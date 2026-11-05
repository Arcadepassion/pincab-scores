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
import { isPushServiceEndpoint, sendPushBatch } from "@mmmike/web-push/send";

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
const MANIFEST = JSON.stringify({ id: "/", name: "PincabOS Scores", short_name: "PincabOS",
  start_url: "/", scope: "/", display: "standalone", background_color: "#070B1A", theme_color: "#070B1A" });
const SERVICE_WORKER_JS = `
"use strict";
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title || "PincabOS Scores", {
    body: data.body || "Un nouveau score est entré dans le Top 3.",
    tag: data.tag || "pincab-high-score", data: { url: data.url || "/" },
    icon: "/images/carte.png", badge: "/images/carte.png"
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin);
  if (url.origin !== self.location.origin) return;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const client = clients.find((c) => new URL(c.url).pathname === url.pathname);
    return client ? client.focus().then(() => client.navigate(url.href)) : self.clients.openWindow(url.href);
  }));
});
`;

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
       WHERE s.table_cle = ? AND p.bloque = 0 GROUP BY s.carte_id) WHERE m > ?`)
    .bind(tableCle, score).first();
  return { pincab: (surPincab?.n || 0) + 1, tous: (surTous?.n || 0) + 1 };
}

async function envoyerPushScores(env, payload) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;
  const r = await env.DB.prepare("SELECT endpoint, p256dh, auth FROM push_subscriptions LIMIT 2000").all();
  const subs = r.results || [];
  if (!subs.length) return;
  const result = await sendPushBatch(subs.map((s) => ({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } })),
    payload, { publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY,
      subject: "mailto:arcadepassion42@gmail.com" }, { concurrency: 20, ttl: 3600 });
  if (result.gone.length) {
    const reqs = result.gone.map((endpoint) => env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(endpoint));
    for (let i = 0; i < reqs.length; i += 100) await env.DB.batch(reqs.slice(i, i + 100));
  }
  if (result.failed.length) console.warn(JSON.stringify({ event: "push_scores_partial_failure", n: result.failed.length }));
}

// NOUVEAU : nom de pincab déjà utilisé par un autre pincab ?
async function nomPincabPris(env, nom, saufId) {
  const r = await env.DB.prepare("SELECT 1 FROM pincabs WHERE lower(trim(nom)) = lower(?) AND id <> ?")
    .bind(nom, saufId || "").first();
  return !!r;
}

// NOUVEAU : meilleur score de chaque carte sur chaque table, sur les pincabs validés (+ le pincab qui demande)
const MEILLEURS_SQL = `
  WITH m AS (SELECT s.table_cle, s.carte_id, MAX(s.score) AS sc FROM scores s JOIN pincabs p ON p.id = s.pincab_id
              WHERE p.bloque = 0 GROUP BY s.table_cle, s.carte_id)`;

function realisationsPour(scores, tables, records, podiums) {
  const r = [];
  if (scores >= 1) r.push({ cle: "premier_score" });
  if (tables >= 5) r.push({ cle: "cinq_tables" });
  if (tables >= 10) r.push({ cle: "dix_tables" });
  if (podiums >= 1) r.push({ cle: "premier_podium" });
  if (records >= 1) r.push({ cle: "premier_record" });
  if (scores >= 100) r.push({ cle: "cent_scores" });
  return r;
}

// ------------------------------------------------------------------ API
const API = {
  // Flux des records/podiums récents, lu périodiquement par les frontends connectés.
  async "GET /api/notifications"(req, env, url) {
    const depuis = Number(url.searchParams.get("depuis") || 0);
    const apres = String(url.searchParams.get("apres") || "").slice(0, 80);
    const pc = String(url.searchParams.get("pc") || "").slice(0, 80);
    if (!Number.isSafeInteger(depuis) || depuis < 0) return erreur("requete_invalide", 400);
    const r = await env.DB.prepare(
      `SELECT n.score_id AS id, n.cree_ms, n.table_cle, n.table_nom, n.systeme, n.score,
              n.place, p.nom AS pincab,
              CASE WHEN c.pseudo = 'Joueur supprimé' THEN 'Anonyme' ELSE c.pseudo END AS pseudo,
              CASE WHEN c.pseudo = 'Joueur supprimé' THEN '' ELSE n.initiales END AS initiales
         FROM score_notifications n JOIN cartes c ON c.id = n.carte_id JOIN pincabs p ON p.id = n.pincab_id
        WHERE (n.cree_ms > ? OR (n.cree_ms = ? AND n.score_id > ?))
          AND (? = '' OR n.pincab_id <> ?) AND p.bloque = 0
        ORDER BY n.cree_ms, n.score_id LIMIT 50`).bind(depuis, depuis, apres, pc, pc).all();
    return json({ ok: true, notifications: r.results || [], maintenant: Date.now() });
  },

  async "GET /api/push/config"(req, env) {
    return json({ ok: !!env.VAPID_PUBLIC_KEY, public_key: env.VAPID_PUBLIC_KEY || "" });
  },

  // L'abonnement push est privé à la carte connectée; endpoint vérifié pour éviter les SSRF.
  async "POST /api/push/subscribe"(req, env) {
    const carte = await carteDe(env, req);
    if (!carte || carte.pseudo === "Joueur supprimé") return erreur("carte_requise", 401);
    const corps = await lireJson(req);
    const endpoint = String(corps.endpoint || "");
    const p256dh = String(corps.p256dh || ""), auth = String(corps.auth || "");
    if (!isPushServiceEndpoint(endpoint) || endpoint.length > 2048 ||
        !/^[A-Za-z0-9_-]{80,100}$/.test(p256dh) || !/^[A-Za-z0-9_-]{20,30}$/.test(auth))
      return erreur("abonnement_invalide", 400);
    const existant = await env.DB.prepare("SELECT carte_id FROM push_subscriptions WHERE endpoint = ?").bind(endpoint).first();
    if (!existant || existant.carte_id !== carte.id) {
      const nombre = await env.DB.prepare("SELECT COUNT(*) AS n FROM push_subscriptions WHERE carte_id = ?").bind(carte.id).first();
      if ((nombre?.n || 0) >= 5) return erreur("limite_appareils", 429);
    }
    const maintenantIso = maintenant();
    await env.DB.prepare(
      `INSERT INTO push_subscriptions (endpoint, carte_id, p256dh, auth, created, updated) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET carte_id = excluded.carte_id, p256dh = excluded.p256dh,
       auth = excluded.auth, updated = excluded.updated`)
      .bind(endpoint, carte.id, p256dh, auth, maintenantIso, maintenantIso).run();
    return json({ ok: true });
  },

  async "POST /api/push/unsubscribe"(req, env) {
    const carte = await carteDe(env, req);
    if (!carte) return erreur("carte_requise", 401);
    const corps = await lireJson(req), endpoint = String(corps.endpoint || "");
    if (!isPushServiceEndpoint(endpoint) || endpoint.length > 2048) return erreur("abonnement_invalide", 400);
    await env.DB.prepare("DELETE FROM push_subscriptions WHERE carte_id = ? AND endpoint = ?")
      .bind(carte.id, endpoint).run();
    return json({ ok: true });
  },

  // NOUVEAU : joueurs qui ont mis des scores en ligne (onglet « Joueurs » du Tableau des scores de PincabOS)
  async "GET /api/joueurs"(req, env, url) {
    const r = await env.DB.prepare(`${MEILLEURS_SQL},
      t AS (SELECT table_cle, MAX(sc) AS top FROM m GROUP BY table_cle)
      SELECT c.id AS carte_id, CASE WHEN c.pseudo = 'Joueur supprimé' THEN 'Anonyme' ELSE c.pseudo END AS pseudo,
             c.initiales, COUNT(*) AS nb_tables,
             SUM(CASE WHEN m.sc = t.top THEN 1 ELSE 0 END) AS nb_records, MAX(m.sc) AS meilleur,
             SUM(CASE WHEN (SELECT COUNT(*) FROM m m2 WHERE m2.table_cle = m.table_cle AND m2.sc > m.sc) < 3
                      THEN 1 ELSE 0 END) AS nb_podiums,
             (SELECT COUNT(*) FROM scores sx WHERE sx.carte_id = c.id) AS nb_scores,
             (SELECT s2.table_nom FROM scores s2 WHERE s2.carte_id = c.id ORDER BY s2.score DESC LIMIT 1) AS table_meilleur,
             (SELECT p2.nom FROM scores s3 JOIN pincabs p2 ON p2.id = s3.pincab_id WHERE s3.carte_id = c.id
               ORDER BY s3.ajoute DESC LIMIT 1) AS pincab
        FROM m JOIN t ON t.table_cle = m.table_cle JOIN cartes c ON c.id = m.carte_id
       WHERE c.pseudo <> 'Joueur supprimé'
       GROUP BY c.id ORDER BY nb_records DESC, meilleur DESC LIMIT 200`).all();
    const joueurs = (r.results || []).map((j) => ({ ...j,
      realisations: realisationsPour(Number(j.nb_scores) || 0, Number(j.nb_tables) || 0,
                                      Number(j.nb_records) || 0, Number(j.nb_podiums) || 0) }));
    return json({ ok: true, joueurs });
  },

  // NOUVEAU : fiche en ligne d'un joueur : sa place sur chaque table (tous les pincabs validés)
  async "GET /api/joueur"(req, env, url) {
    const id = url.searchParams.get("id") || "";
    const carte = await env.DB.prepare(
      "SELECT id, CASE WHEN pseudo = 'Joueur supprimé' THEN 'Anonyme' ELSE pseudo END AS pseudo, initiales FROM cartes WHERE id = ?")
      .bind(id).first();
    if (!carte) return erreur("carte_inconnue", 404);
    const r = await env.DB.prepare(`${MEILLEURS_SQL}
      SELECT m.table_cle, m.sc AS score,
             (SELECT COUNT(*) FROM m m2 WHERE m2.table_cle = m.table_cle AND m2.sc > m.sc) + 1 AS rang,
             (SELECT s.table_nom FROM scores s WHERE s.table_cle = m.table_cle ORDER BY s.ajoute DESC LIMIT 1) AS table_nom,
             (SELECT s.systeme FROM scores s WHERE s.table_cle = m.table_cle LIMIT 1) AS systeme,
             (SELECT p.nom FROM scores s JOIN pincabs p ON p.id = s.pincab_id WHERE s.carte_id = m.carte_id
               AND s.table_cle = m.table_cle ORDER BY s.score DESC LIMIT 1) AS pincab,
             (SELECT s.ajoute FROM scores s WHERE s.carte_id = m.carte_id AND s.table_cle = m.table_cle
               ORDER BY s.score DESC LIMIT 1) AS ajoute
        FROM m WHERE m.carte_id = ?1 ORDER BY rang, score DESC LIMIT 300`).bind(id).all();
    const stats = await env.DB.prepare(
      "SELECT COUNT(*) AS scores, COUNT(DISTINCT table_cle) AS tables FROM scores WHERE carte_id = ?").bind(id).first();
    const podiums = await env.DB.prepare(`${MEILLEURS_SQL}
      SELECT COUNT(*) AS n FROM m WHERE m.carte_id = ?1 AND
        (SELECT COUNT(*) FROM m m2 WHERE m2.table_cle = m.table_cle AND m2.sc > m.sc) < 3`).bind(id).first();
    const records = await env.DB.prepare(`${MEILLEURS_SQL}
      SELECT COUNT(*) AS n FROM m WHERE m.carte_id = ?1 AND
        (SELECT COUNT(*) FROM m m2 WHERE m2.table_cle = m.table_cle AND m2.sc > m.sc) = 0`).bind(id).first();
    const scoresN = Number(stats?.scores) || 0, tablesN = Number(stats?.tables) || 0;
    return json({ ok: true, pseudo: carte.pseudo, initiales: carte.initiales, tables: r.results || [],
      stats: { scores: scoresN, tables: tablesN, podiums: Number(podiums?.n) || 0, records: Number(records?.n) || 0 },
      realisations: realisationsPour(scoresN, tablesN, Number(records?.n) || 0, Number(podiums?.n) || 0) });
  },

  // Le pincab s'active une fois : il reçoit son identifiant et sa clé de signature.
  async "POST /api/pincab/activer"(req, env) {
    const corps = await lireJson(req);
    const nom = String(corps.nom || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 40);
    if (nom.length < 2) return erreur("nom_invalide");
    const ip = ipDe(req);
    const hier = new Date(Date.now() - 86400000).toISOString();
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM pincabs WHERE ip = ? AND cree > ?").bind(ip, hier).first();
    if ((n?.n || 0) >= Number(env.LIMITE_PINCABS_JOUR || MAX_PINCABS_PAR_IP_JOUR)) return erreur("trop_de_demandes", 429);
    // NOUVEAU : deux pincabs ne peuvent pas porter le même nom (majuscules / minuscules ignorées)
    if (await nomPincabPris(env, nom, "")) return erreur("nom_deja_pris", 409);
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

  // Le partage n'attend plus une validation manuelle : tout pincab non bloqué est actif en ligne.
  async "GET /api/pincab/info"(req, env, url) {
    const pc = url.searchParams.get("pc") || "";
    const r = await env.DB.prepare("SELECT nom, approuve, bloque FROM pincabs WHERE id = ?").bind(pc).first();
    if (!r) return erreur("pincab_inconnu", 404);
    return json({ ok: true, nom: r.nom, approuve: !r.bloque, bloque: !!r.bloque });
  },

  // NOUVEAU : le pincab change son nom (demande signée avec sa clé : personne d'autre ne peut le faire)
  async "POST /api/pincab/renommer"(req, env) {
    const corps = await lireJson(req);
    const qr = await lireQR(env, corps.p, corps.g, "renommer");
    if (qr.erreur) return erreur(qr.erreur);
    const t = Math.floor(Date.now() / 1000), x = Number(qr.donnees.x || 0);
    if (!(x >= t && x - t <= 600)) return erreur("qr_expire");
    const nom = String(qr.donnees.nom || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 40);
    if (nom.length < 2) return erreur("nom_invalide");
    if (await nomPincabPris(env, nom, qr.pincab.id)) return erreur("nom_deja_pris", 409);   // NOUVEAU
    await env.DB.prepare("UPDATE pincabs SET nom = ? WHERE id = ?").bind(nom, qr.pincab.id).run();
    return json({ ok: true, nom });
  },

  // NOUVEAU : cartes liées à ce pincab (le pincab ferme son QR « Lier une carte » dès qu'une carte est liée)
  async "GET /api/pincab/liens"(req, env, url) {
    const pc = url.searchParams.get("pc") || "";
    const r = await env.DB.prepare(
      `SELECT c.pseudo, l.initiales, l.cree FROM liens l JOIN cartes c ON c.id = l.carte_id
        WHERE l.pincab_id = ? ORDER BY l.cree DESC LIMIT 500`).bind(pc).all();
    return json({ ok: true, liens: r.results || [] });
  },

  // NOUVEAU : un score précis est-il en ligne, et par qui (le pincab ferme son QR dès qu'il l'est)
  async "GET /api/pincab/score"(req, env, url) {
    const pc = url.searchParams.get("pc") || "", u = url.searchParams.get("u") || "";
    const r = await env.DB.prepare(
      `SELECT c.pseudo, s.initiales, s.ajoute FROM scores s JOIN cartes c ON c.id = s.carte_id
        WHERE s.id = ? AND s.pincab_id = ?`).bind(u, pc).first();
    return json({ ok: true, en_ligne: !!r, pseudo: r?.pseudo || "", initiales: r?.initiales || "" });
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
  async "POST /api/score"(req, env, _url, ctx) {
    const corps = await lireJson(req);
    const qr = await lireQR(env, corps.p, corps.g, "score");
    if (qr.erreur) return erreur(qr.erreur);
    const d = qr.donnees;
    const probleme = verifierScore(d);
    if (probleme) return erreur(probleme);
    const initiales = normaliserInitiales(d.i);
    if (!initiales) return erreur("score_sans_initiales");
    let carte = await carteDe(env, req);
    if (carte) {
      const lien = await env.DB.prepare("SELECT initiales FROM liens WHERE carte_id = ? AND pincab_id = ?")
        .bind(carte.id, d.pc).first();
      if (!lien) return erreur("carte_non_liee", 403);
      if (lien.initiales !== initiales) return erreur("initiales_differentes", 403, { attendues: initiales });
    } else {
      // Nouveau parcours : le pincab envoie le score signé automatiquement, sans scan ni confirmation.
      const profil = await env.DB.prepare(
        "SELECT c.id FROM liens l JOIN cartes c ON c.id = l.carte_id WHERE l.pincab_id = ? AND l.initiales = ? AND c.pseudo <> 'Joueur supprimé'")
        .bind(d.pc, initiales).first();
      if (!profil) return erreur("joueur_non_configure", 403, { initiales });
      carte = { id: profil.id };
    }
    const deja = await env.DB.prepare("SELECT 1 FROM scores WHERE id = ?").bind(d.u).first();
    if (deja) return erreur("deja_en_ligne", 409);
    const meilleurJoueurAvant = await env.DB.prepare(
      "SELECT MAX(score) AS m FROM scores WHERE table_cle = ? AND carte_id = ?").bind(d.t, carte.id).first();
    const nouveauRecordJoueur = Number(d.sc) > Number(meilleurJoueurAvant?.m || 0);
    const ancienRangTous = meilleurJoueurAvant?.m
      ? (await rangs(env, d.t, d.pc, Number(meilleurJoueurAvant.m))).tous : Number.POSITIVE_INFINITY;
    const ancien = await env.DB.prepare(
      `SELECT MAX(s.score) AS m FROM scores s JOIN pincabs p ON p.id = s.pincab_id
        WHERE s.table_cle = ? AND p.bloque = 0`).bind(d.t).first();
    try {
      await env.DB.prepare(
        `INSERT INTO scores (id, pincab_id, carte_id, table_cle, table_nom, systeme, score, initiales, date_partie, ajoute)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(d.u, d.pc, carte.id, d.t, String(d.n || d.t).slice(0, 80), String(d.sy || "").slice(0, 12),
              Number(d.sc), initiales, String(d.d || "").slice(0, 25), maintenant()).run();
    } catch (e) {
      return erreur("deja_en_ligne", 409);       // deux téléphones au même instant
    }
    const places = await rangs(env, d.t, d.pc, Number(d.sc));
    // Alerte seulement lors d'un record global ou d'une première entrée dans le Top 3.
    // Les améliorations suivantes d'un joueur déjà dans le Top 3 ne génèrent pas de spam.
    if (nouveauRecordJoueur && (places.tous === 1 || (places.tous <= 3 && ancienRangTous > 3))) {
      const creeMs = Date.now();
      await env.DB.prepare(
        `INSERT OR IGNORE INTO score_notifications
           (score_id, carte_id, pincab_id, table_cle, table_nom, systeme, score, initiales, place, cree_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(d.u, carte.id, d.pc, d.t, String(d.n || d.t).slice(0, 80), String(d.sy || "").slice(0, 12),
          Number(d.sc), initiales, places.tous, creeMs).run();
      const profil = await env.DB.prepare("SELECT pseudo FROM cartes WHERE id = ?").bind(carte.id).first();
      const titre = places.tous === 1 ? "Nouveau record en ligne !" : "Nouveau score dans le Top 3 !";
      const corpsPush = `${profil?.pseudo || "Un joueur"} — ${String(d.n || d.t).slice(0, 80)} : ` +
        `${Number(d.sc).toLocaleString("fr-FR")} points (#${places.tous}).`;
      const payload = { title: titre, body: corpsPush,
        url: `/table?cle=${encodeURIComponent(d.t)}`, tag: `score-${d.u}` };
      if (ctx && typeof ctx.waitUntil === "function") {
        ctx.waitUntil(envoyerPushScores(env, payload).catch((e) => {
          console.warn(JSON.stringify({ event: "push_scores_error", message: String(e?.message || e) }));
        }));
      }
    }
    return json({ ok: true, rangs: places, ancien_record: ancien?.m || 0 });
  },

  // Création d'un profil depuis le Setup : le pincab signe la demande, le téléphone ne crée plus le pseudo.
  async "POST /api/pincab/joueur/creer"(req, env) {
    const corps = await lireJson(req);
    const qr = await lireQR(env, corps.p, corps.g, "joueur_creer");
    if (qr.erreur) return erreur(qr.erreur);
    const d = qr.donnees;
    const maintenantUnix = Math.floor(Date.now() / 1000);
    if (!(Number(d.x) >= maintenantUnix && Number(d.x) - maintenantUnix <= 600)) return erreur("qr_expire");
    const pseudo = String(d.nom || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 24);
    const initiales = normaliserInitiales(d.i);
    if (pseudo.length < 2) return erreur("pseudo_invalide");
    if (!initiales) return erreur("initiales_invalides");
    if (pseudo.toLowerCase() === "joueur supprimé") return erreur("pseudo_invalide");
    const pris = await env.DB.prepare(
      "SELECT 1 FROM cartes WHERE lower(trim(pseudo)) = lower(?) AND pseudo <> 'Joueur supprimé'").bind(pseudo).first();
    if (pris) return erreur("pseudo_deja_pris", 409);
    const initialsPrises = await env.DB.prepare("SELECT 1 FROM liens WHERE pincab_id = ? AND initiales = ?")
      .bind(qr.pincab.id, initiales).first();
    if (initialsPrises) return erreur("initiales_prises", 409, { initiales });
    const id = identifiant(9), code = codeCarte();
    try {
      await env.DB.batch([
        env.DB.prepare("INSERT INTO cartes (id, pseudo, initiales, jeton_hash, cree, ip) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(id, pseudo, initiales, await sha256(normaliserCode(code)), maintenant(), ipDe(req)),
        env.DB.prepare("INSERT INTO liens (carte_id, pincab_id, initiales, cree) VALUES (?, ?, ?, ?)")
          .bind(id, qr.pincab.id, initiales, maintenant()),
      ]);
    } catch (e) {
      return erreur("pseudo_deja_pris", 409);
    }
    return json({ ok: true, id, code, pseudo, initiales });
  },

  // Temps total du pincab : chaque session a un identifiant unique et peut être renvoyée après une coupure réseau.
  async "POST /api/pincab/session"(req, env) {
    const corps = await lireJson(req);
    const qr = await lireQR(env, corps.p, corps.g, "session");
    if (qr.erreur) return erreur(qr.erreur);
    const d = qr.donnees, duree = Number(d.d);
    if (!Number.isSafeInteger(duree) || duree < 0 || duree > 86400 || typeof d.u !== "string" || d.u.length < 8)
      return erreur("session_invalide");
    await env.DB.prepare(
      "INSERT OR IGNORE INTO sessions_pincab (id, pincab_id, duree, table_nom, fin) VALUES (?, ?, ?, ?, ?)")
      .bind(d.u, qr.pincab.id, duree, String(d.n || "").slice(0, 80), String(d.f || maintenant()).slice(0, 25)).run();
    return json({ ok: true });
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
    // NOUVEAU : deux cartes joueurs ne peuvent pas porter le même pseudo (majuscules / minuscules ignorées)
    const pris = await env.DB.prepare("SELECT 1 FROM cartes WHERE lower(trim(pseudo)) = lower(?) AND pseudo <> 'Joueur supprimé'")
      .bind(pseudo).first();
    if (pris) return erreur("pseudo_deja_pris", 409);
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
      `SELECT p.id, p.nom, l.initiales FROM liens l JOIN pincabs p ON p.id = l.pincab_id WHERE l.carte_id = ?`)
      .bind(carte.id).all();
    const stats = await env.DB.prepare(
      "SELECT COUNT(*) AS scores, COUNT(DISTINCT table_cle) AS tables FROM scores WHERE carte_id = ?")
      .bind(carte.id).first();
    const places = await env.DB.prepare(`
      WITH m AS (SELECT table_cle, MAX(score) AS meilleur FROM scores WHERE carte_id = ? GROUP BY table_cle)
      SELECT COUNT(*) AS tables, SUM(CASE WHEN devant = 0 THEN 1 ELSE 0 END) AS records,
             SUM(CASE WHEN devant < 3 THEN 1 ELSE 0 END) AS podiums
        FROM (SELECT m.table_cle,
                     (SELECT COUNT(DISTINCT s.carte_id) FROM scores s JOIN pincabs p ON p.id = s.pincab_id
                       WHERE s.table_cle = m.table_cle AND s.score > m.meilleur AND p.bloque = 0) AS devant
                FROM m)`).bind(carte.id).first();
    const realisations = [];
    if ((stats?.scores || 0) >= 1) realisations.push({ cle: "premier_score", progression: 1, objectif: 1 });
    if ((stats?.tables || 0) >= 5) realisations.push({ cle: "cinq_tables", progression: 5, objectif: 5 });
    if ((stats?.tables || 0) >= 10) realisations.push({ cle: "dix_tables", progression: 10, objectif: 10 });
    if ((places?.podiums || 0) >= 1) realisations.push({ cle: "premier_podium", progression: 1, objectif: 1 });
    if ((places?.records || 0) >= 1) realisations.push({ cle: "premier_record", progression: 1, objectif: 1 });
    if ((stats?.scores || 0) >= 100) realisations.push({ cle: "cent_scores", progression: 100, objectif: 100 });
    return json({
      ok: true, id: carte.id, pseudo: carte.pseudo, initiales: carte.initiales, depuis: carte.cree,
      scores: liste, pincabs: pincabs.results || [],
      stats: { records: places?.records || 0, podiums: places?.podiums || 0,
               scores: stats?.scores || 0, tables: stats?.tables || 0 },
      realisations,
    });
  },

  // Le propriétaire peut libérer son pseudo et ses initiales depuis son téléphone, sans code de secours.
  // Les scores restent dans le classement, mais sont anonymisés et ne sont plus rattachés à un compte.
  async "POST /api/carte/supprimer"(req, env) {
    const carte = await carteDe(env, req);
    if (!carte) return erreur("carte_requise", 401);
    const jetonInvalide = b64urlEncode(aleatoire(24));
    await env.DB.batch([
      env.DB.prepare("UPDATE scores SET initiales = '' WHERE carte_id = ?").bind(carte.id),
      env.DB.prepare("DELETE FROM liens WHERE carte_id = ?").bind(carte.id),
      env.DB.prepare("DELETE FROM push_subscriptions WHERE carte_id = ?").bind(carte.id),
      env.DB.prepare("UPDATE cartes SET pseudo = 'Joueur supprimé', initiales = '', jeton_hash = ?, ip = NULL WHERE id = ?")
        .bind(await sha256(jetonInvalide), carte.id),
    ]);
    return json({ ok: true });
  },

  async "POST /api/carte/pseudo"(req, env) {
    const carte = await carteDe(env, req);
    if (!carte) return erreur("carte_requise", 401);
    const corps = await lireJson(req);
    const pseudo = String(corps.pseudo || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 24);
    if (pseudo.length < 2) return erreur("pseudo_invalide");
    const pris = await env.DB.prepare(
      "SELECT 1 FROM cartes WHERE lower(trim(pseudo)) = lower(?) AND id <> ? AND pseudo <> 'Joueur supprimé'")
      .bind(pseudo, carte.id).first();
    if (pris) return erreur("pseudo_deja_pris", 409);
    await env.DB.prepare("UPDATE cartes SET pseudo = ? WHERE id = ?").bind(pseudo, carte.id).run();
    return json({ ok: true, pseudo });
  },

  // Délier un pincab n'efface aucun score déjà associé au joueur.
  async "POST /api/lien/delier"(req, env) {
    const carte = await carteDe(env, req);
    if (!carte) return erreur("carte_requise", 401);
    const corps = await lireJson(req);
    const pincabId = String(corps.pincab_id || "");
    if (!pincabId) return erreur("pincab_inconnu");
    await env.DB.prepare("DELETE FROM liens WHERE carte_id = ? AND pincab_id = ?")
      .bind(carte.id, pincabId).run();
    return json({ ok: true });
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
      `SELECT c.id AS carte_id, CASE WHEN c.pseudo = 'Joueur supprimé' THEN 'Anonyme' ELSE c.pseudo END AS pseudo,
              s.initiales, MAX(s.score) AS score, s.ajoute,
              (SELECT p2.nom FROM scores s2 JOIN pincabs p2 ON p2.id = s2.pincab_id
                WHERE s2.carte_id = c.id AND s2.table_cle = s.table_cle ORDER BY s2.score DESC LIMIT 1) AS pincab
         FROM scores s JOIN cartes c ON c.id = s.carte_id JOIN pincabs p ON p.id = s.pincab_id
        WHERE s.table_cle = ? AND p.bloque = 0
          AND ${vue === "pincab" ? "s.pincab_id = ?" : "1 = 1"}
        GROUP BY c.id ORDER BY score DESC LIMIT 50`)
      .bind(...(vue === "pincab" ? [cle, pc] : [cle])).all();
    const nom = await env.DB.prepare("SELECT table_nom, systeme FROM scores WHERE table_cle = ? ORDER BY ajoute DESC LIMIT 1")
      .bind(cle).first();
    const nomTable = nom?.table_nom || cle;
    const temps = await env.DB.prepare(
      `SELECT COALESCE(SUM(s.duree), 0) AS temps_jeu FROM sessions_pincab s
         JOIN pincabs p ON p.id = s.pincab_id
        WHERE p.bloque = 0 AND lower(trim(s.table_nom)) = lower(trim(?))
          AND ${vue === "pincab" ? "s.pincab_id = ?" : "1 = 1"}`)
      .bind(...(vue === "pincab" ? [nomTable, pc] : [nomTable])).first();
    const pincab = pc ? await env.DB.prepare("SELECT nom FROM pincabs WHERE id = ?").bind(pc).first() : null;
    return json({ ok: true, cle, table: nomTable, systeme: nom?.systeme || "", vue,
                  pincab: pincab?.nom || "", temps_jeu: Number(temps?.temps_jeu) || 0, lignes: r.results || [] });
  },

  async "GET /api/accueil"(req, env) {
    const stats = await env.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM pincabs WHERE bloque = 0) AS pincabs,
              (SELECT COUNT(*) FROM cartes WHERE pseudo <> 'Joueur supprimé') AS joueurs,
              (SELECT COUNT(*) FROM scores) AS scores,
              (SELECT COALESCE(SUM(s.duree), 0) FROM sessions_pincab s JOIN pincabs p ON p.id = s.pincab_id
                WHERE p.bloque = 0) AS temps_jeu`).first();
    const tempsTables = await env.DB.prepare(
      `SELECT s.table_nom, COALESCE(SUM(s.duree), 0) AS temps_jeu, COUNT(*) AS parties
         FROM sessions_pincab s JOIN pincabs p ON p.id = s.pincab_id
        WHERE p.bloque = 0 AND trim(s.table_nom) <> ''
        GROUP BY lower(trim(s.table_nom)) ORDER BY temps_jeu DESC, s.table_nom COLLATE NOCASE LIMIT 100`).all();
    const r = await env.DB.prepare(
      `SELECT s.table_cle, s.table_nom, s.systeme, s.score, s.initiales, s.ajoute, p.nom AS pincab
         FROM scores s JOIN pincabs p ON p.id = s.pincab_id
        WHERE p.bloque = 0 ORDER BY s.ajoute DESC LIMIT 20`).all();
    const derniers = [];
    for (const s of r.results || []) derniers.push({ ...s, place: (await rangs(env, s.table_cle, "", s.score)).tous });
    return json({ ok: true, stats, temps_tables: tempsTables.results || [], derniers });
  },

  async "GET /api/recherche"(req, env, url) {
    const q = String(url.searchParams.get("q") || "").trim().slice(0, 40);
    if (q.length < 2) return json({ ok: true, tables: [] });
    const r = await env.DB.prepare(
      `SELECT s.table_cle, s.table_nom, s.systeme, MAX(s.score) AS record FROM scores s JOIN pincabs p ON p.id = s.pincab_id
        WHERE p.bloque = 0 AND s.table_nom LIKE ? GROUP BY s.table_cle ORDER BY s.table_nom LIMIT 30`)
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
const PAGES = new Set(["/", "/s", "/lier", "/carte", "/table", "/joueurs", "/joueur", "/admin"]);
const ENTETES_PAGE = {
  "content-type": "text/html; charset=utf-8",
  "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src https://fonts.gstatic.com; img-src 'self' data: https://wsrv.nl; connect-src 'self'; frame-ancestors 'none'",
  "referrer-policy": "no-referrer",
  "cache-control": "no-cache",
  "x-content-type-options": "nosniff",
};

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const route = API[`${req.method} ${url.pathname}`];
    try {
      if (route) return await route(req, env, url, ctx);
      if (url.pathname.startsWith("/api/")) return erreur("introuvable", 404);
      if (url.pathname === "/sw.js") {
        return new Response(SERVICE_WORKER_JS, { headers: { "content-type": "text/javascript; charset=utf-8",
          "cache-control": "no-cache", "service-worker-allowed": "/", "x-content-type-options": "nosniff" } });
      }
      if (url.pathname === "/manifest.webmanifest") {
        return new Response(MANIFEST, { headers: { "content-type": "application/manifest+json; charset=utf-8",
          "cache-control": "public, max-age=3600", "x-content-type-options": "nosniff" } });
      }
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
