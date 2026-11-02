// =====================================================================
//  PincabOS Scores en ligne — serveur (Cloudflare Worker + base D1)
// =====================================================================
//  - Chaque pincab reçoit une clé secrète à son activation et SIGNE ses QR codes (HMAC-SHA256) :
//    un QR fabriqué à la main est refusé.
//  - Un QR = un score = un seul enregistrement (identifiant unique « u »).
//  - Un score n'est mis en ligne qu'après confirmation sur le téléphone, par la carte joueur liée à
//    ce pincab avec les mêmes initiales (initiales uniques par pincab) : personne ne peut prendre le
//    score d'un autre.
//  - « Tous les pincabs » ne montre que les pincabs validés par l'administrateur.
// =====================================================================
import { PAGE_HTML as PAGE_BRUTE, APP_JS, APP_CSS } from "./pages.js";

// CORRECTIF : le code des pages porte une empreinte dans son adresse (/app.js?v=...) : après chaque mise à
// jour du site, les navigateurs chargent tout de suite la nouvelle version (plus de vieille copie en cache)
function empreinte(texte) {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) { h ^= texte.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
const VERSION_PAGES = empreinte(APP_JS + APP_CSS);
const PAGE_HTML = PAGE_BRUTE.replace('src="/app.js"', `src="/app.js?v=${VERSION_PAGES}"`)
  .replace('href="/app.css"', `href="/app.css?v=${VERSION_PAGES}"`);

const VERSION_QR = 1;
const DUREE_LIEN_MAX = 3600;          // s : validité d'un QR « Lier une carte »
const MAX_PINCABS_PAR_IP_JOUR = 3;
const MAX_CARTES_PAR_IP_JOUR = 10;
const SCORE_MAX = 1e15;

// ------------------------------------------------------------------ outils
const enc = new TextEncoder();

function b64urlEncode(octets) {
  let s = "";
  for (const o of octets) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(texte) {
  const t = String(texte || "").replace(/-/g, "+").replace(/_/g, "/");
  const s = atob(t + "=".repeat((4 - (t.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

function aleatoire(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

function identifiant(n = 9) {
  return b64urlEncode(aleatoire(n));
}

const BASE32 = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // sans I, O, 0, 1 (confusions)
function codeCarte() {
  const o = aleatoire(24);
  let c = "";
  for (let i = 0; i < 24; i++) c += BASE32[o[i] % BASE32.length];
  return c.match(/.{4}/g).join("-");
}

function normaliserCode(code) {
  return String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function sha256(texte) {
  const h = await crypto.subtle.digest("SHA-256", enc.encode(texte));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function signatureValide(secret, p, g) {
  try {
    const cle = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" },
      false, ["sign"]);
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", cle, enc.encode(p))).slice(0, 16);
    const recu = b64urlDecode(g);
    if (recu.length !== sig.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig[i] ^ recu[i];   // comparaison à temps constant
    return diff === 0;
  } catch (e) {
    return false;
  }
}

function normaliserInitiales(texte) {
  return String(texte || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
}

function maintenant() {
  return new Date().toISOString().slice(0, 19) + "Z";
}

function json(donnees, statut = 200) {
  return new Response(JSON.stringify(donnees), {
    status: statut,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function erreur(code, statut = 400, extra = {}) {
  return json({ ok: false, erreur: code, ...extra }, statut);
}

async function lireJson(req) {
  try {
    return await req.json();
  } catch (e) {
    return {};
  }
}

function ipDe(req) {
  return req.headers.get("cf-connecting-ip") || "local";
}

// ------------------------------------------------------------------ QR signés
async function lireQR(env, p, g, typeAttendu) {
  let donnees;
  try {
    donnees = JSON.parse(new TextDecoder().decode(b64urlDecode(p)));
  } catch (e) {
    return { erreur: "qr_illisible" };
  }
  if (!donnees || donnees.v !== VERSION_QR || typeof donnees.pc !== "string") return { erreur: "qr_illisible" };
  if ((donnees.k || "score") !== typeAttendu) return { erreur: "qr_mauvais_type" };
  const pincab = await env.DB.prepare("SELECT * FROM pincabs WHERE id = ?").bind(donnees.pc).first();
  if (!pincab) return { erreur: "pincab_inconnu" };
  if (pincab.bloque) return { erreur: "pincab_bloque" };
  if (!(await signatureValide(pincab.secret, p, g))) return { erreur: "signature_invalide" };
  return { donnees, pincab };
}

function verifierScore(d) {
  const score = Number(d.sc);
  if (!Number.isSafeInteger(score) || score <= 0 || score > SCORE_MAX) return "score_invalide";
  if (typeof d.u !== "string" || d.u.length < 8 || d.u.length > 64) return "qr_illisible";
  if (typeof d.t !== "string" || !/^[A-Z0-9_]{2,12}:[^\s]{1,80}$/i.test(d.t)) return "table_invalide";
  return null;
}

// ------------------------------------------------------------------ cartes joueurs
async function carteDe(env, req) {
  const auth = req.headers.get("authorization") || "";
  const code = normaliserCode(auth.replace(/^Bearer\s+/i, ""));
  if (code.length !== 24) return null;
  return await env.DB.prepare("SELECT * FROM cartes WHERE jeton_hash = ?").bind(await sha256(code)).first();
}

async function rangs(env, tableCle, pincabId, score) {
  const surPincab = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM (SELECT carte_id, MAX(score) AS m FROM scores
       WHERE table_cle = ? AND pincab_id = ? GROUP BY carte_id) WHERE m > ?`).bind(tableCle, pincabId, score).first();
  const surTous = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM (SELECT s.carte_id, MAX(s.score) AS m FROM scores s
       JOIN pincabs p ON p.id = s.pincab_id
       WHERE s.table_cle = ? AND p.approuve = 1 AND p.bloque = 0 GROUP BY s.carte_id) WHERE m > ?`)
    .bind(tableCle, score).first();
  return { pincab: (surPincab?.n || 0) + 1, tous: (surTous?.n || 0) + 1 };
}

// ------------------------------------------------------------------ API
const API = {
  // Le pincab s'active une fois : il reçoit son identifiant et sa clé de signature.
  async "POST /api/pincab/activer"(req, env) {
    const corps = await lireJson(req);
    const nom = String(corps.nom || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 40);
    if (nom.length < 2) return erreur("nom_invalide");
    const ip = ipDe(req);
    const hier = new Date(Date.now() - 86400000).toISOString();
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM pincabs WHERE ip = ? AND cree > ?").bind(ip, hier).first();
    if ((n?.n || 0) >= Number(env.LIMITE_PINCABS_JOUR || MAX_PINCABS_PAR_IP_JOUR)) return erreur("trop_de_demandes", 429);
    const id = identifiant(9);
    const secret = b64urlEncode(aleatoire(32));
    await env.DB.prepare("INSERT INTO pincabs (id, nom, secret, cree, ip) VALUES (?, ?, ?, ?, ?)")
      .bind(id, nom, secret, maintenant(), ip).run();
    return json({ ok: true, id, secret, nom });
  },

  // Le pincab demande quels scores sont déjà en ligne (« ✓ en ligne » dans le Tableau des scores).
  async "POST /api/pincab/statut"(req, env) {
    const corps = await lireJson(req);
    const ids = (Array.isArray(corps.ids) ? corps.ids : []).filter((x) => typeof x === "string").slice(0, 200);
    if (!ids.length || typeof corps.pc !== "string") return json({ ok: true, en_ligne: [] });
    const marques = ids.map(() => "?").join(",");
    const r = await env.DB.prepare(`SELECT id FROM scores WHERE pincab_id = ? AND id IN (${marques})`)
      .bind(corps.pc, ...ids).all();
    return json({ ok: true, en_ligne: (r.results || []).map((x) => x.id) });
  },

  // NOUVEAU : le pincab consulte son état (affiché dans le Setup : en attente / validé / bloqué).
  async "GET /api/pincab/info"(req, env, url) {
    const pc = url.searchParams.get("pc") || "";
    const r = await env.DB.prepare("SELECT nom, approuve, bloque FROM pincabs WHERE id = ?").bind(pc).first();
    if (!r) return erreur("pincab_inconnu", 404);
    return json({ ok: true, nom: r.nom, approuve: !!r.approuve, bloque: !!r.bloque });
  },

  // Le téléphone vient de scanner un QR de score : on le vérifie et on l'affiche (rien n'est publié).
  async "POST /api/verifier"(req, env) {
    const corps = await lireJson(req);
    const qr = await lireQR(env, corps.p, corps.g, "score");
    if (qr.erreur) return erreur(qr.erreur);
    const d = qr.donnees;
    const probleme = verifierScore(d);
    if (probleme) return erreur(probleme);
    const deja = await env.DB.prepare(
      `SELECT s.ajoute, c.pseudo, c.initiales FROM scores s JOIN cartes c ON c.id = s.carte_id WHERE s.id = ?`)
      .bind(d.u).first();
    const carte = await carteDe(env, req);
    let lien = null;
    if (carte) {
      lien = await env.DB.prepare("SELECT initiales FROM liens WHERE carte_id = ? AND pincab_id = ?")
        .bind(carte.id, d.pc).first();
    }
    return json({
      ok: true,
      score: { table: d.n, table_cle: d.t, systeme: d.sy, score: Number(d.sc), initiales: normaliserInitiales(d.i),
               date: d.d, pincab: qr.pincab.nom, pincab_id: d.pc },
      deja: deja ? { pseudo: deja.pseudo, initiales: deja.initiales, le: deja.ajoute } : null,
      carte: carte ? { pseudo: carte.pseudo, initiales: carte.initiales, liee: !!lien } : null,
      rangs: await rangs(env, d.t, d.pc, Number(d.sc)),
    });
  },

  // Confirmation sur le téléphone : le score est mis en ligne sur la carte du joueur.
  async "POST /api/score"(req, env) {
    const carte = await carteDe(env, req);
    if (!carte) return erreur("carte_requise", 401);
    const corps = await lireJson(req);
    const qr = await lireQR(env, corps.p, corps.g, "score");
    if (qr.erreur) return erreur(qr.erreur);
    const d = qr.donnees;
    const probleme = verifierScore(d);
    if (probleme) return erreur(probleme);
    const initiales = normaliserInitiales(d.i);
    if (!initiales) return erreur("score_sans_initiales");
    const lien = await env.DB.prepare("SELECT initiales FROM liens WHERE carte_id = ? AND pincab_id = ?")
      .bind(carte.id, d.pc).first();
    if (!lien) return erreur("carte_non_liee", 403);
    if (lien.initiales !== initiales) return erreur("initiales_differentes", 403, { attendues: initiales });
    const deja = await env.DB.prepare("SELECT 1 FROM scores WHERE id = ?").bind(d.u).first();
    if (deja) return erreur("deja_en_ligne", 409);
    const ancien = await env.DB.prepare(
      `SELECT MAX(s.score) AS m FROM scores s JOIN pincabs p ON p.id = s.pincab_id
        WHERE s.table_cle = ? AND p.approuve = 1 AND p.bloque = 0`).bind(d.t).first();
    try {
      await env.DB.prepare(
        `INSERT INTO scores (id, pincab_id, carte_id, table_cle, table_nom, systeme, score, initiales, date_partie, ajoute)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(d.u, d.pc, carte.id, d.t, String(d.n || d.t).slice(0, 80), String(d.sy || "").slice(0, 12),
              Number(d.sc), initiales, String(d.d || "").slice(0, 25), maintenant()).run();
    } catch (e) {
      return erreur("deja_en_ligne", 409);       // deux téléphones au même instant
    }
    return json({ ok: true, rangs: await rangs(env, d.t, d.pc, Number(d.sc)), ancien_record: ancien?.m || 0 });
  },

  // Création d'une carte joueur (sur le téléphone). Le code n'est montré qu'une fois.
  async "POST /api/carte"(req, env) {
    const corps = await lireJson(req);
    const pseudo = String(corps.pseudo || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 24);
    const initiales = normaliserInitiales(corps.initiales);
    if (pseudo.length < 2) return erreur("pseudo_invalide");
    if (!initiales) return erreur("initiales_invalides");
    const ip = ipDe(req);
    const hier = new Date(Date.now() - 86400000).toISOString();
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM cartes WHERE ip = ? AND cree > ?").bind(ip, hier).first();
    if ((n?.n || 0) >= Number(env.LIMITE_CARTES_JOUR || MAX_CARTES_PAR_IP_JOUR)) return erreur("trop_de_demandes", 429);
    const code = codeCarte();
    const id = identifiant(9);
    await env.DB.prepare("INSERT INTO cartes (id, pseudo, initiales, jeton_hash, cree, ip) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, pseudo, initiales, await sha256(normaliserCode(code)), maintenant(), ip).run();
    return json({ ok: true, id, code, pseudo, initiales });
  },

  async "POST /api/carte/restaurer"(req, env) {
    const corps = await lireJson(req);
    const code = normaliserCode(corps.code);
    const carte = code.length === 24
      ? await env.DB.prepare("SELECT * FROM cartes WHERE jeton_hash = ?").bind(await sha256(code)).first() : null;
    if (!carte) return erreur("code_inconnu", 404);
    return json({ ok: true, pseudo: carte.pseudo, initiales: carte.initiales });
  },

  async "GET /api/carte"(req, env) {
    const carte = await carteDe(env, req);
    if (!carte) return erreur("carte_requise", 401);
    const scores = await env.DB.prepare(
      `SELECT s.id, s.table_cle, s.table_nom, s.systeme, s.score, s.ajoute, p.nom AS pincab
         FROM scores s JOIN pincabs p ON p.id = s.pincab_id WHERE s.carte_id = ? ORDER BY s.ajoute DESC LIMIT 30`)
      .bind(carte.id).all();
    const liste = [];
    for (const s of scores.results || []) {
      liste.push({ ...s, place: (await rangs(env, s.table_cle, "", s.score)).tous });
    }
    const pincabs = await env.DB.prepare(
      `SELECT p.nom, l.initiales FROM liens l JOIN pincabs p ON p.id = l.pincab_id WHERE l.carte_id = ?`)
      .bind(carte.id).all();
    return json({
      ok: true, id: carte.id, pseudo: carte.pseudo, initiales: carte.initiales, depuis: carte.cree,
      scores: liste, pincabs: pincabs.results || [],
      stats: { records: liste.filter((s) => s.place === 1).length, podiums: liste.filter((s) => s.place <= 3).length,
               scores: liste.length },
    });
  },

  // Le téléphone scanne le QR « Lier une carte » affiché par le pincab.
  async "POST /api/lier"(req, env) {
    const carte = await carteDe(env, req);
    if (!carte) return erreur("carte_requise", 401);
    const corps = await lireJson(req);
    const qr = await lireQR(env, corps.p, corps.g, "lien");
    if (qr.erreur) return erreur(qr.erreur);
    const expire = Number(qr.donnees.x || 0);
    const t = Math.floor(Date.now() / 1000);
    if (!(expire >= t && expire - t <= DUREE_LIEN_MAX)) return erreur("qr_expire");
    const existe = await env.DB.prepare("SELECT initiales FROM liens WHERE carte_id = ? AND pincab_id = ?")
      .bind(carte.id, qr.pincab.id).first();
    if (existe) return json({ ok: true, deja: true, pincab: qr.pincab.nom });
    const pris = await env.DB.prepare("SELECT 1 FROM liens WHERE pincab_id = ? AND initiales = ?")
      .bind(qr.pincab.id, carte.initiales).first();
    if (pris) return erreur("initiales_prises", 409, { initiales: carte.initiales });
    await env.DB.prepare("INSERT INTO liens (carte_id, pincab_id, initiales, cree) VALUES (?, ?, ?, ?)")
      .bind(carte.id, qr.pincab.id, carte.initiales, maintenant()).run();
    return json({ ok: true, pincab: qr.pincab.nom, initiales: carte.initiales });
  },

  // Classement d'une table : meilleur score de chaque joueur.
  async "GET /api/table"(req, env, url) {
    const cle = url.searchParams.get("cle") || "";
    const pc = url.searchParams.get("pc") || "";
    const vue = pc ? "pincab" : "tous";
    const r = await env.DB.prepare(
      `SELECT c.id AS carte_id, c.pseudo, s.initiales, MAX(s.score) AS score, s.ajoute,
              (SELECT p2.nom FROM scores s2 JOIN pincabs p2 ON p2.id = s2.pincab_id
                WHERE s2.carte_id = c.id AND s2.table_cle = s.table_cle ORDER BY s2.score DESC LIMIT 1) AS pincab
         FROM scores s JOIN cartes c ON c.id = s.carte_id JOIN pincabs p ON p.id = s.pincab_id
        WHERE s.table_cle = ? AND p.bloque = 0 AND ${vue === "pincab" ? "s.pincab_id = ?" : "p.approuve = 1"}
        GROUP BY c.id ORDER BY score DESC LIMIT 50`)
      .bind(...(vue === "pincab" ? [cle, pc] : [cle])).all();
    const nom = await env.DB.prepare("SELECT table_nom, systeme FROM scores WHERE table_cle = ? ORDER BY ajoute DESC LIMIT 1")
      .bind(cle).first();
    const pincab = pc ? await env.DB.prepare("SELECT nom FROM pincabs WHERE id = ?").bind(pc).first() : null;
    return json({ ok: true, cle, table: nom?.table_nom || cle, systeme: nom?.systeme || "", vue,
                  pincab: pincab?.nom || "", lignes: r.results || [] });
  },

  async "GET /api/accueil"(req, env) {
    const stats = await env.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM pincabs WHERE approuve = 1 AND bloque = 0) AS pincabs,
              (SELECT COUNT(*) FROM cartes) AS joueurs, (SELECT COUNT(*) FROM scores) AS scores`).first();
    const r = await env.DB.prepare(
      `SELECT s.table_cle, s.table_nom, s.systeme, s.score, s.initiales, s.ajoute, p.nom AS pincab
         FROM scores s JOIN pincabs p ON p.id = s.pincab_id
        WHERE p.approuve = 1 AND p.bloque = 0 ORDER BY s.ajoute DESC LIMIT 20`).all();
    const derniers = [];
    for (const s of r.results || []) derniers.push({ ...s, place: (await rangs(env, s.table_cle, "", s.score)).tous });
    return json({ ok: true, stats, derniers });
  },

  async "GET /api/recherche"(req, env, url) {
    const q = String(url.searchParams.get("q") || "").trim().slice(0, 40);
    if (q.length < 2) return json({ ok: true, tables: [] });
    const r = await env.DB.prepare(
      `SELECT s.table_cle, s.table_nom, s.systeme, MAX(s.score) AS record FROM scores s JOIN pincabs p ON p.id = s.pincab_id
        WHERE p.approuve = 1 AND p.bloque = 0 AND s.table_nom LIKE ? GROUP BY s.table_cle ORDER BY s.table_nom LIMIT 30`)
      .bind(`%${q}%`).all();
    return json({ ok: true, tables: r.results || [] });
  },

  // --- administration (validation / blocage des pincabs) ---
  async "GET /api/admin/pincabs"(req, env) {
    if (!adminOk(req, env)) return erreur("acces_refuse", 403);
    const r = await env.DB.prepare(
      `SELECT p.id, p.nom, p.cree, p.approuve, p.bloque, (SELECT COUNT(*) FROM scores s WHERE s.pincab_id = p.id) AS scores
         FROM pincabs p ORDER BY p.cree DESC LIMIT 500`).all();
    return json({ ok: true, pincabs: r.results || [] });
  },

  async "POST /api/admin/pincab"(req, env) {
    if (!adminOk(req, env)) return erreur("acces_refuse", 403);
    const corps = await lireJson(req);
    await env.DB.prepare("UPDATE pincabs SET approuve = ?, bloque = ? WHERE id = ?")
      .bind(corps.approuve ? 1 : 0, corps.bloque ? 1 : 0, String(corps.id || "")).run();
    return json({ ok: true });
  },
};

function adminOk(req, env) {
  const cle = req.headers.get("x-admin-cle") || "";
  return !!env.ADMIN_CLE && env.ADMIN_CLE.length >= 12 && cle === env.ADMIN_CLE;
}

// ------------------------------------------------------------------ pages
const PAGES = new Set(["/", "/s", "/lier", "/carte", "/table", "/admin"]);
const ENTETES_PAGE = {
  "content-type": "text/html; charset=utf-8",
  "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src https://fonts.gstatic.com; img-src 'self' data: https://wsrv.nl; connect-src 'self'; frame-ancestors 'none'",
  "referrer-policy": "no-referrer",
  "cache-control": "no-cache",
  "x-content-type-options": "nosniff",
};

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const route = API[`${req.method} ${url.pathname}`];
    try {
      if (route) return await route(req, env, url);
      if (url.pathname.startsWith("/api/")) return erreur("introuvable", 404);
      if (url.pathname === "/app.js") {
        return new Response(APP_JS, { headers: { "content-type": "text/javascript; charset=utf-8",
                                                  "cache-control": "public, max-age=31536000, immutable" } });
      }
      if (url.pathname === "/app.css") {
        return new Response(APP_CSS, { headers: { "content-type": "text/css; charset=utf-8",
                                                   "cache-control": "public, max-age=31536000, immutable" } });
      }
      if (PAGES.has(url.pathname) && req.method === "GET") return new Response(PAGE_HTML, { headers: ENTETES_PAGE });
      return new Response("Introuvable", { status: 404 });
    } catch (e) {
      console.error(e);
      return erreur("erreur_serveur", 500);
    }
  },
};
