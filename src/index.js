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
// NOUVEAU : liste des wheels de la médiathèque intégrée au site (régénérée par outils/generer_liste_wheels.py)
import { WHEELS_MEDIATHEQUE } from "./wheels_mediatheque.js";

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
  start_url: "/", scope: "/", display: "standalone", background_color: "#070B1A", theme_color: "#070B1A",
  // NOUVEAU : icône PincabOS quand le site est ajouté à l'écran d'accueil
  icons: [{ src: "/images/icone-192.png", sizes: "192x192", type: "image/png" },
          { src: "/images/icone-512.png", sizes: "512x512", type: "image/png" }] });
const SERVICE_WORKER_JS = `
"use strict";
// CORRECTIF : une nouvelle version de ce script prend la main tout de suite. Avant, elle attendait que
// toutes les pages du site soient fermées : sur un téléphone (appli de l'écran d'accueil jamais vraiment
// fermée), l'ancienne version restait active et les notifications n'avaient pas le logo PincabOS.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title || "PincabOS Scores", {
    body: data.body || "Un nouveau score est entré dans le Top 3.",
    tag: data.tag || "pincab-high-score", data: { url: data.url || "/" },
    // CORRECTIF : « badge » = petite icône de la barre d'état (Android n'en garde que la silhouette :
    // une image pleine donnait un carré blanc) ; « icon » = logo PincabOS en couleur
    icon: "/images/icone-192.png", badge: "/images/notif-badge.png"
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

function dureeLisible(secondes) {
  const s = Math.max(0, Number(secondes) || 0);
  if (s > 0 && s < 60) return `${Math.round(s)} sec`;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min`;
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
  if (d.du !== undefined && (!Number.isSafeInteger(Number(d.du)) || Number(d.du) < 0 || Number(d.du) > 86400))
    return "duree_invalide";
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

// NOUVEAU : notifications dans la langue de chaque téléphone. Le téléphone donne sa langue en s'abonnant ;
// la colonne « langue » est ajoutée automatiquement à push_subscriptions (rien n'est effacé ; les anciens
// abonnements restent en français jusqu'à la prochaine ouverture du site sur le téléphone).
const LANGUES_PUSH = ["fr", "en", "es", "it", "de", "pt", "ja", "zh", "ru", "ar"];
const LOCALES_PUSH = { fr: "fr-FR", en: "en-GB", es: "es-ES", it: "it-IT", de: "de-DE", pt: "pt-PT", ja: "ja-JP",
                       zh: "zh-CN", ru: "ru-RU", ar: "ar-u-nu-latn" };
const TEXTES_PUSH = {
  fr: { record: "Nouveau record en ligne !", top3: "Nouveau score dans le Top 3 !", joueur: "Un joueur", points: "points", partie: "Partie" },
  en: { record: "New online record!", top3: "New score in the Top 3!", joueur: "A player", points: "points", partie: "Game" },
  es: { record: "¡Nuevo récord en línea!", top3: "¡Nueva puntuación en el Top 3!", joueur: "Un jugador", points: "puntos", partie: "Partida" },
  it: { record: "Nuovo record online!", top3: "Nuovo punteggio nella Top 3!", joueur: "Un giocatore", points: "punti", partie: "Partita" },
  de: { record: "Neuer Online-Rekord!", top3: "Neuer Punktestand in den Top 3!", joueur: "Ein Spieler", points: "Punkte", partie: "Spiel" },
  pt: { record: "Novo recorde online!", top3: "Nova pontuação no Top 3!", joueur: "Um jogador", points: "pontos", partie: "Partida" },
  ja: { record: "オンライン新記録!", top3: "トップ3に新スコア!", joueur: "プレイヤー", points: "ポイント", partie: "プレイ時間" },
  zh: { record: "新的在线纪录!", top3: "前 3 名出现新分数!", joueur: "一位玩家", points: "分", partie: "游戏时长" },
  ru: { record: "Новый онлайн-рекорд!", top3: "Новый результат в Топ-3!", joueur: "Игрок", points: "очков", partie: "Игра" },
  ar: { record: "رقم قياسي جديد عبر الإنترنت!", top3: "نتيجة جديدة ضمن أفضل 3!", joueur: "لاعب", points: "نقطة", partie: "المباراة" },
};
function textePush(langue, n) {
  const T = TEXTES_PUSH[langue] || TEXTES_PUSH.fr;
  let score;
  try { score = Number(n.score).toLocaleString(LOCALES_PUSH[langue] || "fr-FR"); } catch (_) { score = String(n.score); }
  return {
    title: n.place === 1 ? T.record : T.top3,
    body: `${n.pseudo || T.joueur} (${n.initiales}) — ${n.table} : ${score} ${T.points} (#${n.place})` +
      (n.duree ? ` · ${T.partie} ${dureeLisible(n.duree)}` : "."),
  };
}
let colonneLanguePrete = false;
async function assurerColonneLangue(env) {
  if (colonneLanguePrete) return;
  try {
    await env.DB.prepare("ALTER TABLE push_subscriptions ADD COLUMN langue TEXT NOT NULL DEFAULT 'fr'").run();
  } catch (e) {
    if (!/duplicate column/i.test(String(e?.message || e))) throw e;   // colonne déjà là : normal
  }
  colonneLanguePrete = true;
}

// CORRECTIF : reçoit les données du score (plus un texte tout fait) et envoie à chaque téléphone le texte
// dans SA langue : un envoi groupé par langue.
async function envoyerPushScores(env, n) {
  // CORRECTIF : chaque cas est noté dans les journaux Cloudflare (avant, rien ne disait pourquoi aucune
  // notification n'arrivait sur le téléphone)
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.warn(JSON.stringify({ event: "push_scores_sans_cle_vapid" }));
    return;
  }
  let subs;
  try {
    await assurerColonneLangue(env);
    subs = (await env.DB.prepare("SELECT endpoint, p256dh, auth, langue FROM push_subscriptions LIMIT 2000").all()).results || [];
  } catch (e) {   // sécurité : sans la colonne, tout le monde reçoit le texte en français comme avant
    console.warn(JSON.stringify({ event: "push_scores_sans_langue", message: String(e?.message || e) }));
    subs = (await env.DB.prepare("SELECT endpoint, p256dh, auth FROM push_subscriptions LIMIT 2000").all()).results || [];
  }
  if (!subs.length) {
    console.warn(JSON.stringify({ event: "push_scores_aucun_abonne" }));
    return;
  }
  const parLangue = {};
  for (const s of subs) {
    const l = LANGUES_PUSH.includes(s.langue) ? s.langue : "fr";
    (parLangue[l] = parLangue[l] || []).push({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } });
  }
  let livres = 0;
  const gone = [], failed = [];
  for (const [langue, liste] of Object.entries(parLangue)) {
    const payload = { ...textePush(langue, n), url: n.url, tag: n.tag };
    // CORRECTIF : urgency « high » : un téléphone Android ou iPhone en veille reçoit la notification tout de
    // suite (sans priorité, le service de notifications peut attendre le réveil du téléphone).
    const result = await sendPushBatch(liste, payload, { publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY,
      subject: "mailto:arcadepassion42@gmail.com" }, { concurrency: 20, ttl: 3600, urgency: "high" });
    livres += result.delivered;
    gone.push(...result.gone);
    failed.push(...result.failed);
  }
  console.log(JSON.stringify({ event: "push_scores_envoyes", abonnes: subs.length, livres,
    expires: gone.length, echecs: failed.length, langues: Object.keys(parLangue) }));   // NOUVEAU : bilan de chaque envoi
  if (gone.length) {
    const reqs = gone.map((endpoint) => env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(endpoint));
    for (let i = 0; i < reqs.length; i += 100) await env.DB.batch(reqs.slice(i, i + 100));
  }
  if (failed.length) console.warn(JSON.stringify({ event: "push_scores_partial_failure", n: failed.length }));
}

// NOUVEAU : wheels de la médiathèque GitHub sans souci de majuscules / minuscules. GitHub distingue la casse
// (« BioLab.png » n'est pas « Biolab.png ») : la liste des fichiers du dossier wheel/ est lue (gardée 6 h) et
// donne le nom exact. Si GitHub ne répond pas, le nom est essayé tel quel (comme avant).
const ARBRE_WHEELS = "https://api.github.com/repos/Arcadepassion/pincab_os-media-library/git/trees/main:wheel";
const MEDIATHEQUE_WHEELS = "raw.githubusercontent.com/Arcadepassion/pincab_os-media-library/main/wheel/";
let indexWheels = null, indexWheelsMs = 0, echecWheelsMs = 0;
async function nomExactWheel(nom) {
  const t = Date.now();
  if ((!indexWheels || t - indexWheelsMs > 6 * 3600000) && t - echecWheelsMs > 600000) {
    try {
      const r = await fetch(ARBRE_WHEELS, { headers: { "user-agent": "pincab-scores", accept: "application/vnd.github+json" },
                                           cf: { cacheTtl: 21600, cacheEverything: true } });
      if (!r.ok) throw new Error("GitHub " + r.status);
      const m = new Map();
      for (const e of (await r.json()).tree || []) {
        if (/\.png$/i.test(e.path)) m.set(e.path.slice(0, -4).toLowerCase(), e.path.slice(0, -4));
      }
      indexWheels = m;
      indexWheelsMs = t;
    } catch (e) {
      echecWheelsMs = t;
      console.warn(JSON.stringify({ event: "index_wheels_indisponible", message: String(e?.message || e) }));
    }
  }
  const cle = String(nom).toLowerCase();
  // CORRECTIF : la liste lue sur GitHub (nouvelles wheels) d'abord, sinon la liste intégrée au site. GitHub limite
  // ses réponses (60 par heure pour tous les sites d'un même serveur Cloudflare) : sans la liste intégrée, le site
  // essayait alors « Biolab.png » au lieu de « BioLab.png » et affichait le logo par défaut.
  return (indexWheels && indexWheels.get(cle)) || INDEX_WHEELS_INTEGRE.get(cle) || nom;
}
const INDEX_WHEELS_INTEGRE = new Map(WHEELS_MEDIATHEQUE.map((n) => [n.toLowerCase(), n]));

// NOUVEAU : wheels envoyées par les pincabs pour les tables absentes de la médiathèque GitHub. Le site n'a
// jamais accès aux PC : c'est PincabOS qui envoie (signée avec la clé du pincab) une petite copie de la wheel
// d'une table qu'il a partagée, et seulement si le site ne l'a pas. Tout le monde la voit ensuite.
const TAILLE_MAX_WHEEL = 400000;   // octets (PincabOS envoie une image réduite à 300 px, ~30 à 150 Ko)
let tableWheelsPrete = false;
async function assurerTableWheels(env) {
  if (tableWheelsPrete) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS wheels_pincabs (nom_norm TEXT PRIMARY KEY, nom TEXT NOT NULL, type TEXT NOT NULL,
       image BLOB NOT NULL, pincab_id TEXT NOT NULL, ajoute TEXT NOT NULL)`).run();
  tableWheelsPrete = true;
}
function nomNormalise(nom) { return String(nom || "").trim().toLowerCase(); }
// la médiathèque (liste lue sur GitHub ou liste intégrée) a-t-elle une wheel pour ce nom ?
function wheelDansMediatheque(nom) {
  const cle = nomNormalise(nom);
  return !!((indexWheels && indexWheels.has(cle)) || INDEX_WHEELS_INTEGRE.has(cle));
}
function typeImage(octets) {
  if (octets.length > 8 && octets[0] === 0x89 && octets[1] === 0x50 && octets[2] === 0x4e && octets[3] === 0x47) return "image/png";
  if (octets.length > 3 && octets[0] === 0xff && octets[1] === 0xd8 && octets[2] === 0xff) return "image/jpeg";
  if (octets.length > 12 && String.fromCharCode(...octets.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...octets.slice(8, 12)) === "WEBP") return "image/webp";
  return "";
}
async function sha256Octets(octets) {
  const h = await crypto.subtle.digest("SHA-256", octets);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
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

// NOUVEAU : badges obtenus, datés (le site joue une animation quand un joueur en débloque un).
// On ne note que les badges qui APPARAISSENT après un nouveau score (avant / après), donc les badges
// déjà gagnés avant cette version ne sont jamais annoncés comme nouveaux.
let tableBadgesPrete = false;
async function assurerTableBadges(env) {
  if (tableBadgesPrete) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS badges_obtenus (
       carte_id TEXT NOT NULL, cle TEXT NOT NULL, obtenu TEXT NOT NULL, pincab_id TEXT NOT NULL DEFAULT '',
       PRIMARY KEY (carte_id, cle))`).run();
  tableBadgesPrete = true;
}
async function clesRealisations(env, carteId) {
  const stats = await env.DB.prepare(
    "SELECT COUNT(*) AS scores, COUNT(DISTINCT table_cle) AS tables FROM scores WHERE carte_id = ?").bind(carteId).first();
  const places = await env.DB.prepare(`${MEILLEURS_SQL},
      rg AS (SELECT m.carte_id, (SELECT COUNT(*) FROM m m2 WHERE m2.table_cle = m.table_cle AND m2.sc > m.sc) AS devant FROM m)
    SELECT SUM(CASE WHEN devant = 0 THEN 1 ELSE 0 END) AS records, SUM(CASE WHEN devant < 3 THEN 1 ELSE 0 END) AS podiums
      FROM rg WHERE carte_id = ?1`).bind(carteId).first();
  return realisationsPour(Number(stats?.scores) || 0, Number(stats?.tables) || 0,
                          Number(places?.records) || 0, Number(places?.podiums) || 0).map((x) => x.cle);
}
async function noterNouveauxBadges(env, carteId, pincabId, avant) {
  try {
    await assurerTableBadges(env);
    const apres = await clesRealisations(env, carteId);
    const nouveaux = apres.filter((c) => !avant.includes(c));
    for (const cle of nouveaux) {
      await env.DB.prepare("INSERT OR IGNORE INTO badges_obtenus (carte_id, cle, obtenu, pincab_id) VALUES (?, ?, ?, ?)")
        .bind(carteId, cle, maintenant(), pincabId || "").run();
    }
  } catch (e) {
    console.warn(JSON.stringify({ event: "badges_error", message: String(e?.message || e) }));
  }
}

// ------------------------------------------------------------------ NOUVEAU : vérification automatique des scores
// Le pincab signe ses scores, mais la clé est sur la machine de l'utilisateur : un tricheur pourrait signer
// n'importe quoi. Chaque score reçu passe donc des contrôles de vraisemblance ; un score anormal n'entre pas
// dans les classements : il est mis en quarantaine (table scores_suspects) et l'administrateur l'accepte ou
// le refuse depuis la page /admin. Aucun score n'est perdu.
const VERIF = {
  scoresParHeure: 20,        // scores de parties récentes (avec durée) par pincab et par heure
  anciensParJour: 300,       // anciens scores ajoutés (sans durée de partie) par pincab et par jour
  dureeMin: 20,              // s : partie plus courte = score suspect
  dureeMax: 6 * 3600,        // s : partie plus longue = score suspect
  facteurRecord: 10,         // score > 10 × le meilleur score des AUTRES pincabs (si assez de références)
  facteurVitesse: 5,         // points par seconde > 5 × le plus rapide des autres pincabs
  referencesMin: 3,          // nombre de scores d'autres pincabs nécessaires pour comparer
  suspectsSurveillance: 3,   // pincab avec 3 scores en attente : ses nouveaux scores passent tous en vérification
};
let tableSuspectsPrete = false;
async function assurerTableSuspects(env) {
  if (tableSuspectsPrete) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS scores_suspects (
       id TEXT PRIMARY KEY, pincab_id TEXT NOT NULL, carte_id TEXT NOT NULL, table_cle TEXT NOT NULL,
       table_nom TEXT NOT NULL, systeme TEXT NOT NULL, score INTEGER NOT NULL, initiales TEXT NOT NULL,
       date_partie TEXT NOT NULL, duree_partie INTEGER NOT NULL DEFAULT 0, raison TEXT NOT NULL, recu TEXT NOT NULL)`).run();
  tableSuspectsPrete = true;
}

// Renvoie "" si le score est vraisemblable, sinon la raison de la quarantaine.
async function raisonSuspect(env, d) {
  await assurerTableSuspects(env);
  const score = Number(d.sc), duree = Number(d.du) || 0;
  const enAttente = await env.DB.prepare("SELECT COUNT(*) AS n FROM scores_suspects WHERE pincab_id = ?").bind(d.pc).first();
  if ((enAttente?.n || 0) >= VERIF.suspectsSurveillance) return "pincab_surveille";
  if (d.d) {
    const t = Date.parse(String(d.d));
    if (Number.isFinite(t) && t > Date.now() + 86400000) return "date_future";
  }
  if (duree > 0) {
    if (duree < VERIF.dureeMin) return "partie_trop_courte";
    if (duree > VERIF.dureeMax) return "partie_trop_longue";
    const heure = new Date(Date.now() - 3600000).toISOString();
    const n = await env.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM scores WHERE pincab_id = ?1 AND ajoute > ?2 AND duree_partie > 0)
            + (SELECT COUNT(*) FROM scores_suspects WHERE pincab_id = ?1 AND recu > ?2 AND duree_partie > 0) AS n`)
      .bind(d.pc, heure).first();
    if ((n?.n || 0) >= VERIF.scoresParHeure) return "trop_de_scores";
  } else {
    const jour = new Date(Date.now() - 86400000).toISOString();
    const n = await env.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM scores WHERE pincab_id = ?1 AND ajoute > ?2 AND duree_partie = 0)
            + (SELECT COUNT(*) FROM scores_suspects WHERE pincab_id = ?1 AND recu > ?2 AND duree_partie = 0) AS n`)
      .bind(d.pc, jour).first();
    if ((n?.n || 0) >= VERIF.anciensParJour) return "trop_de_scores";
  }
  // Comparaison avec les scores des AUTRES pincabs sur la même table
  const ref = await env.DB.prepare(
    `SELECT COUNT(*) AS n, COUNT(DISTINCT s.pincab_id) AS pcs, MAX(s.score) AS m,
            MAX(CASE WHEN s.duree_partie > 0 THEN CAST(s.score AS REAL) / s.duree_partie END) AS vitesse,
            SUM(CASE WHEN s.duree_partie > 0 THEN 1 ELSE 0 END) AS avec_duree
       FROM scores s JOIN pincabs p ON p.id = s.pincab_id
      WHERE s.table_cle = ? AND s.pincab_id <> ? AND p.bloque = 0`).bind(d.t, d.pc).first();
  if ((ref?.n || 0) >= VERIF.referencesMin && (ref?.pcs || 0) >= 2 && ref.m > 0 && score > VERIF.facteurRecord * ref.m)
    return "score_anormal";
  if (duree > 0 && (ref?.avec_duree || 0) >= VERIF.referencesMin && ref.vitesse > 0
      && score / duree > VERIF.facteurVitesse * ref.vitesse)
    return "score_trop_rapide";
  return "";
}

// ------------------------------------------------------------------ NOUVEAU : podium et succès du jour / semaine / mois / année
// Podium : les 3 joueurs qui détiennent les plus gros records de table (le plus gros score qui est encore n° 1
// de sa table). Si un autre joueur bat ce score sur la table, il prend la place sur le podium.
// Succès de la période : le joueur qui a marqué le plus de points pendant la période (record en ligne = 3 points,
// entrée dans le Top 3 = 1 point ; à égalité : le plus de scores envoyés). Le gagnant d'une période terminée
// garde la récompense pour toujours (table recompenses), à condition d'avoir atteint l'objectif de la période
// (OBJECTIFS) : sinon personne ne gagne. Périodes à l'heure de Paris.
const TYPES_PERIODE = ["jour", "semaine", "mois", "annee"];
// CORRECTIF : un objectif minimum par période ; si personne ne l'atteint, personne ne gagne le succès
const OBJECTIFS = { jour: 3, semaine: 10, mois: 30, annee: 150 };   // points (record = 3, Top 3 = 1)
let tableRecompensesPrete = false;
async function assurerTableRecompenses(env) {
  if (tableRecompensesPrete) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS recompenses (
       type TEXT NOT NULL, periode TEXT NOT NULL, carte_id TEXT NOT NULL, points INTEGER NOT NULL DEFAULT 0,
       records INTEGER NOT NULL DEFAULT 0, top3 INTEGER NOT NULL DEFAULT 0, scores INTEGER NOT NULL DEFAULT 0,
       cree TEXT NOT NULL, PRIMARY KEY (type, periode))`).run();
  tableRecompensesPrete = true;
}
const FORMAT_PARIS = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit",
  day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
function partiesParis(ms) {
  const o = {};
  for (const x of FORMAT_PARIS.formatToParts(new Date(ms))) o[x.type] = Number(x.value);
  return o;
}
function decalageParis(ms) {
  const o = partiesParis(ms);
  return Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute, o.second) - Math.floor(ms / 1000) * 1000;
}
function minuitParis(a, m, j) {            // ms UTC du début du jour a-m-j à Paris (m : 1..12, débordements acceptés)
  const brut = Date.UTC(a, m - 1, j);
  let t = brut - decalageParis(brut);
  t = brut - decalageParis(t);
  return t;
}
function periode(type, ms) {
  const o = partiesParis(ms);
  const deuxChiffres = (n) => String(n).padStart(2, "0");
  if (type === "jour") {
    return { cle: `${o.year}-${deuxChiffres(o.month)}-${deuxChiffres(o.day)}`,
             debut: minuitParis(o.year, o.month, o.day), fin: minuitParis(o.year, o.month, o.day + 1) };
  }
  if (type === "semaine") {
    const jourSemaine = (new Date(Date.UTC(o.year, o.month - 1, o.day)).getUTCDay() + 6) % 7;   // lundi = 0
    const lundi = new Date(Date.UTC(o.year, o.month - 1, o.day - jourSemaine));
    const a = lundi.getUTCFullYear(), m = lundi.getUTCMonth() + 1, j = lundi.getUTCDate();
    return { cle: `S${a}-${deuxChiffres(m)}-${deuxChiffres(j)}`, debut: minuitParis(a, m, j), fin: minuitParis(a, m, j + 7) };
  }
  if (type === "mois") {
    return { cle: `${o.year}-${deuxChiffres(o.month)}`, debut: minuitParis(o.year, o.month, 1),
             fin: minuitParis(o.year, o.month + 1, 1) };
  }
  return { cle: `${o.year}`, debut: minuitParis(o.year, 1, 1), fin: minuitParis(o.year + 1, 1, 1) };
}
async function championPeriode(env, debut, fin) {
  const a = new Date(debut).toISOString(), b = new Date(fin).toISOString();
  const r = await env.DB.prepare(
    `WITH ev AS (
       SELECT n.carte_id, SUM(CASE WHEN n.place = 1 THEN 3 ELSE 1 END) AS points,
              SUM(CASE WHEN n.place = 1 THEN 1 ELSE 0 END) AS records,
              SUM(CASE WHEN n.place > 1 THEN 1 ELSE 0 END) AS top3, MIN(n.cree_ms) AS premier
         FROM score_notifications n JOIN pincabs p ON p.id = n.pincab_id
        WHERE n.cree_ms >= ?1 AND n.cree_ms < ?2 AND p.bloque = 0 GROUP BY n.carte_id),
     sc AS (
       SELECT s.carte_id, COUNT(*) AS scores FROM scores s JOIN pincabs p ON p.id = s.pincab_id
        WHERE s.ajoute >= ?3 AND s.ajoute < ?4 AND p.bloque = 0 GROUP BY s.carte_id)
     SELECT c.id AS carte_id, c.pseudo, c.initiales, COALESCE(ev.points, 0) AS points,
            COALESCE(ev.records, 0) AS records, COALESCE(ev.top3, 0) AS top3, COALESCE(sc.scores, 0) AS scores
       FROM cartes c LEFT JOIN ev ON ev.carte_id = c.id LEFT JOIN sc ON sc.carte_id = c.id
      WHERE ev.carte_id IS NOT NULL AND c.pseudo <> 'Joueur supprimé'
      ORDER BY points DESC, scores DESC, COALESCE(ev.premier, 9e15) ASC LIMIT 1`)
    .bind(debut, fin, a, b).first();
  return r || null;
}
// Récompense les gagnants des périodes terminées (les 7 derniers jours, la semaine, le mois et l'année d'avant).
async function attribuerRecompenses(env) {
  await assurerTableRecompenses(env);
  const maintenantMs = Date.now();
  const aFaire = [];
  let p = periode("jour", maintenantMs);
  // CORRECTIF : jour / semaine / mois = missions (attribuées dès qu'elles sont réussies) ; ici, seulement l'année
  void p;
  for (const type of ["annee"]) aFaire.push([type, periode(type, periode(type, maintenantMs).debut - 1)]);
  const cles = aFaire.map(([type, x]) => type + "|" + x.cle);
  const marques = cles.map(() => "?").join(",");
  const deja = await env.DB.prepare(`SELECT type || '|' || periode AS k FROM recompenses WHERE type || '|' || periode IN (${marques})`)
    .bind(...cles).all();
  const faits = new Set((deja.results || []).map((x) => x.k));
  // CORRECTIF : retire les succès donnés sans atteindre l'objectif (première version)
  await env.DB.batch(TYPES_PERIODE.map((type) =>
    env.DB.prepare("DELETE FROM recompenses WHERE type = ? AND points < ?").bind(type, OBJECTIFS[type])));
  for (const [type, x] of aFaire) {
    if (faits.has(type + "|" + x.cle)) continue;
    const c = await championPeriode(env, x.debut, x.fin);
    if (!c || c.points < OBJECTIFS[type]) continue;
    await env.DB.prepare(
      `INSERT OR IGNORE INTO recompenses (type, periode, carte_id, points, records, top3, scores, cree)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(type, x.cle, c.carte_id, c.points, c.records, c.top3, c.scores, maintenant()).run();
  }
}
async function recompensesDe(env, carteId) {
  await assurerTableRecompenses(env);
  await assurerTableMissions(env);
  // CORRECTIF : succès du jour / semaine / mois = missions réussies (+ succès gagnés avant les missions)
  const r = await env.DB.prepare(
    `SELECT type, COUNT(*) AS n FROM (SELECT type FROM recompenses WHERE carte_id = ?1
       UNION ALL SELECT type FROM missions_reussies WHERE carte_id = ?1) GROUP BY type`).bind(carteId).all();
  const o = { jour: 0, semaine: 0, mois: 0, annee: 0 };
  for (const x of r.results || []) o[x.type] = Number(x.n) || 0;
  return o;
}

// ------------------------------------------------------------------ NOUVEAU : missions
// Succès du jour : une mission pour chaque jour de la semaine (lundi → dimanche), le cycle recommence le lundi.
// Succès de la semaine / du mois : une mission tirée au hasard dans une liste, différente à chaque période.
// Tout joueur qui réussit la mission gagne le badge de la période (le badge reste le même).
// Mesures : parties, tables (différentes), temps (s cumulées), longue (s, plus longue partie), records (en
// ligne), top3 (entrées dans le Top 3), tables_top3 (tables différentes dans le Top 3), jours (différents),
// points (record = 3, Top 3 = 1).
const MISSIONS = {
  jour: [{ m: "tables", n: 4 }, { m: "temps", n: 2700 }, { m: "top3", n: 1 }, { m: "parties", n: 10 },
         { m: "longue", n: 900 }, { m: "records", n: 1 }, { m: "points", n: 4 }],
  semaine: [{ m: "parties", n: 40 }, { m: "tables", n: 12 }, { m: "temps", n: 14400 }, { m: "records", n: 3 },
            { m: "tables_top3", n: 5 }, { m: "jours", n: 5 }, { m: "points", n: 15 }],
  mois: [{ m: "parties", n: 150 }, { m: "tables", n: 30 }, { m: "temps", n: 43200 }, { m: "records", n: 8 },
         { m: "tables_top3", n: 15 }, { m: "jours", n: 15 }, { m: "points", n: 50 }],
};
const TYPES_MISSION = ["jour", "semaine", "mois"];
let tableMissionsPrete = false;
async function assurerTableMissions(env) {
  if (tableMissionsPrete) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS missions_reussies (
       type TEXT NOT NULL, periode TEXT NOT NULL, carte_id TEXT NOT NULL, mission TEXT NOT NULL, cree TEXT NOT NULL,
       PRIMARY KEY (type, periode, carte_id))`).run();
  tableMissionsPrete = true;
}
function hasard(graine) {      // générateur pseudo-aléatoire reproductible (même tirage pour tout le monde)
  let h = 2166136261;
  for (const c of String(graine)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
function melange(type, cycle) {   // chaque mission une fois par cycle, dans un ordre tiré au hasard
  const ordre = MISSIONS[type].map((_, i) => i), alea = hasard(`pincabos|${type}|${cycle}`);
  for (let i = ordre.length - 1; i > 0; i--) { const j = Math.floor(alea() * (i + 1)); [ordre[i], ordre[j]] = [ordre[j], ordre[i]]; }
  return ordre;
}
function missionDe(type, ms) {
  const p = periode(type, ms), o = partiesParis(ms), liste = MISSIONS[type];
  let index;
  if (type === "jour") {
    index = (new Date(Date.UTC(o.year, o.month - 1, o.day)).getUTCDay() + 6) % 7;   // lundi = 0
  } else {
    const numero = type === "semaine" ? Math.round(p.debut / (7 * 86400000)) : o.year * 12 + (o.month - 1);
    const cycle = Math.floor(numero / liste.length), position = numero % liste.length;
    const ordre = melange(type, cycle);
    if (position === 0) {           // pas deux fois la même mission d'un cycle à l'autre
      const avant = melange(type, cycle - 1);
      if (ordre[0] === avant[avant.length - 1]) [ordre[0], ordre[1]] = [ordre[1], ordre[0]];
    }
    index = ordre[position];
  }
  return { ...liste[index], index, periode: p };
}
function valeurMission(x, m) {
  if (!x) return 0;
  if (m === "points") return (Number(x.records) || 0) * 3 + ((Number(x.top3) || 0) - (Number(x.records) || 0));
  return Number(x[m]) || 0;
}
// Mesures de la période pour un joueur (carteId) ou pour tous (carteId vide) : { carte_id: mesures }
async function mesuresPeriode(env, debut, fin, carteId) {
  const a = new Date(debut).toISOString(), b = new Date(fin).toISOString();
  const h = Math.round(decalageParis(debut) / 3600000);
  const filtre = carteId ? "AND s.carte_id = ?3" : "";
  const filtreN = carteId ? "AND n.carte_id = ?3" : "";
  const sc = await env.DB.prepare(
    `SELECT s.carte_id, COUNT(*) AS parties, COUNT(DISTINCT s.table_cle) AS tables,
            COALESCE(SUM(s.duree_partie), 0) AS temps, COALESCE(MAX(s.duree_partie), 0) AS longue,
            COUNT(DISTINCT date(s.ajoute, '${h >= 0 ? "+" : ""}${h} hours')) AS jours
       FROM scores s JOIN pincabs p ON p.id = s.pincab_id
      WHERE s.ajoute >= ?1 AND s.ajoute < ?2 AND p.bloque = 0 ${filtre} GROUP BY s.carte_id`)
    .bind(a, b, ...(carteId ? [carteId] : [])).all();
  const ev = await env.DB.prepare(
    `SELECT n.carte_id, SUM(CASE WHEN n.place = 1 THEN 1 ELSE 0 END) AS records, COUNT(*) AS top3,
            COUNT(DISTINCT n.table_cle) AS tables_top3
       FROM score_notifications n JOIN pincabs p ON p.id = n.pincab_id
      WHERE n.cree_ms >= ?1 AND n.cree_ms < ?2 AND p.bloque = 0 ${filtreN} GROUP BY n.carte_id`)
    .bind(debut, fin, ...(carteId ? [carteId] : [])).all();
  const o = {};
  for (const x of sc.results || []) o[x.carte_id] = { ...x };
  for (const x of ev.results || []) o[x.carte_id] = { ...(o[x.carte_id] || { carte_id: x.carte_id }), ...x };
  return o;
}
// Après un score : le joueur a-t-il réussi la mission du jour / de la semaine / du mois ?
async function verifierMissions(env, carteId) {
  try {
    await assurerTableMissions(env);
    const ms = Date.now();
    for (const type of TYPES_MISSION) {
      const mi = missionDe(type, ms);
      const mesures = (await mesuresPeriode(env, mi.periode.debut, mi.periode.fin, carteId))[carteId];
      if (valeurMission(mesures, mi.m) >= mi.n) {
        await env.DB.prepare("INSERT OR IGNORE INTO missions_reussies (type, periode, carte_id, mission, cree) VALUES (?, ?, ?, ?, ?)")
          .bind(type, mi.periode.cle, carteId, `${mi.m}:${mi.n}`, maintenant()).run();
      }
    }
  } catch (e) {
    console.warn(JSON.stringify({ event: "missions_error", message: String(e?.message || e) }));
  }
}
// Mission en cours (pour le site et le Frontend) : la mission, qui l'a réussie, le joueur le plus avancé.
async function etatMission(env, type, ms, carteMoi) {
  await assurerTableMissions(env);
  const mi = missionDe(type, ms);
  const mesures = await mesuresPeriode(env, mi.periode.debut, mi.periode.fin, "");
  const reussis = await env.DB.prepare(
    `SELECT c.id AS carte_id, c.pseudo, c.initiales FROM missions_reussies r JOIN cartes c ON c.id = r.carte_id
      WHERE r.type = ? AND r.periode = ? ORDER BY r.cree LIMIT 50`).bind(type, mi.periode.cle).all();
  let tete = null;
  for (const [id, x] of Object.entries(mesures)) {
    const v = valeurMission(x, mi.m);
    if (v > 0 && (!tete || v > tete.valeur)) tete = { carte_id: id, valeur: v };
  }
  if (tete) {
    const c = await env.DB.prepare("SELECT pseudo, initiales FROM cartes WHERE id = ?").bind(tete.carte_id).first();
    tete = c ? { ...tete, ...c, points: tete.valeur } : null;      // « points » : compatibilité anciens Frontends
  }
  const prec = missionDe(type, mi.periode.debut - 1);
  const nbPrec = await env.DB.prepare("SELECT COUNT(*) AS n FROM missions_reussies WHERE type = ? AND periode = ?")
    .bind(type, prec.periode.cle).first();
  const liste = (reussis.results || []);
  return { mission: { m: mi.m, n: mi.n, index: mi.index }, objectif: mi.n, fin: new Date(mi.periode.fin).toISOString(),
           en_tete: tete, nb_reussi: liste.length, reussi: liste.slice(0, 8),
           mission_precedente: { m: prec.m, n: prec.n }, nb_precedent: Number(nbPrec?.n) || 0, precedent: null,
           moi: carteMoi ? { valeur: valeurMission(mesures[carteMoi], mi.m), reussi: liste.some((x) => x.carte_id === carteMoi) } : null,
           semaine: type === "jour" ? MISSIONS.jour.map((x) => ({ m: x.m, n: x.n })) : undefined };
}
async function podium(env) {
  const r = await env.DB.prepare(`${MEILLEURS_SQL},
      rg AS (SELECT m.table_cle, m.carte_id, m.sc,
                    (SELECT COUNT(*) FROM m m2 WHERE m2.table_cle = m.table_cle AND m2.sc > m.sc) AS devant FROM m)
    SELECT c.id AS carte_id, c.pseudo, c.initiales,
           MAX(CASE WHEN rg.devant = 0 THEN rg.sc END) AS record_score,
           MAX(rg.sc) AS meilleur,
           SUM(CASE WHEN rg.devant = 0 THEN 1 ELSE 0 END) AS records,
           SUM(CASE WHEN rg.devant < 3 THEN 1 ELSE 0 END) AS podiums,
           COUNT(*) AS tables,
           (SELECT COUNT(*) FROM scores s WHERE s.carte_id = c.id) AS nb_scores
      FROM rg JOIN cartes c ON c.id = rg.carte_id
     WHERE c.pseudo <> 'Joueur supprimé'
     GROUP BY c.id
     ORDER BY (record_score IS NULL), record_score DESC, meilleur DESC LIMIT 3`).all();
  const liste = [];
  for (const x of r.results || []) {
    const score = x.record_score || x.meilleur;
    const t = await env.DB.prepare(
      "SELECT table_nom, table_cle FROM scores WHERE carte_id = ? AND score = ? ORDER BY ajoute DESC LIMIT 1")
      .bind(x.carte_id, score).first();
    liste.push({ ...x, table_nom: t?.table_nom || "", table_cle: t?.table_cle || "",
                 recompenses: await recompensesDe(env, x.carte_id),
                 // NOUVEAU : badges débloqués (premier score, 5 / 10 tables, premier podium, premier record, 100 scores)
                 realisations: realisationsPour(Number(x.nb_scores) || 0, Number(x.tables) || 0,
                                                Number(x.records) || 0, Number(x.podiums) || 0) });
  }
  return liste;
}

// NOUVEAU : effacement complet de profils : scores, scores en vérification, alertes, liens, notifications,
// badges, succès et le profil lui-même. Rien ne reste sur le site (même pas un score « Anonyme »).
async function effacerCartes(env, ids) {
  if (!ids.length) return;
  await assurerTableSuspects(env);
  await assurerTableBadges(env);
  await assurerTableRecompenses(env);
  await assurerTableMissions(env);
  const ops = [];
  for (const id of ids) {
    for (const table of ["scores", "scores_suspects", "score_notifications", "liens", "push_subscriptions",
                         "badges_obtenus", "recompenses", "missions_reussies"]) {
      ops.push(env.DB.prepare(`DELETE FROM ${table} WHERE carte_id = ?`).bind(id));
    }
    ops.push(env.DB.prepare("DELETE FROM cartes WHERE id = ?").bind(id));
  }
  await env.DB.batch(ops);
  console.log(JSON.stringify({ event: "profils_effaces", n: ids.length }));
}
// NOUVEAU : les comptes supprimés avant cette version (« Joueur supprimé », scores anonymes) sont effacés
// une fois pour toutes
let anciensSupprimesNettoyes = false;
async function nettoyerAnciensComptesSupprimes(env) {
  if (anciensSupprimesNettoyes) return;
  anciensSupprimesNettoyes = true;
  try {
    const r = await env.DB.prepare("SELECT id FROM cartes WHERE pseudo = 'Joueur supprimé' LIMIT 50").all();
    await effacerCartes(env, (r.results || []).map((x) => x.id));
  } catch (e) {
    anciensSupprimesNettoyes = false;
    console.warn(JSON.stringify({ event: "nettoyage_error", message: String(e?.message || e) }));
  }
}

// ------------------------------------------------------------------ API
const API = {
  // NOUVEAU : podium des 3 meilleurs joueurs et champions du jour / de la semaine / du mois / de l'année
  async "GET /api/podium"(req, env) {
    await attribuerRecompenses(env);
    const maintenantMs = Date.now();
    const champions = {};
    const carteMoi = await carteDe(env, req);
    for (const type of TYPES_MISSION) champions[type] = await etatMission(env, type, maintenantMs, carteMoi?.id || "");   // NOUVEAU
    for (const type of ["annee"]) {   // CORRECTIF : seule l'année garde le « meilleur joueur avec objectif »
      const actuelle = periode(type, maintenantMs);
      const precedente = periode(type, actuelle.debut - 1);
      const gagnant = await env.DB.prepare(
        `SELECT r.points, r.records, r.top3, r.scores, c.id AS carte_id, c.pseudo, c.initiales
           FROM recompenses r JOIN cartes c ON c.id = r.carte_id
          WHERE r.type = ? AND r.periode = ? AND c.pseudo <> 'Joueur supprimé'`).bind(type, precedente.cle).first();
      champions[type] = { en_tete: await championPeriode(env, actuelle.debut, actuelle.fin), precedent: gagnant || null,
                          objectif: OBJECTIFS[type], fin: new Date(actuelle.fin).toISOString() };
    }
    return json({ ok: true, podium: await podium(env), champions });
  },

  // Flux des records/podiums récents, lu périodiquement par les frontends connectés.
  async "GET /api/notifications"(req, env, url) {
    const depuis = Number(url.searchParams.get("depuis") || 0);
    const apres = String(url.searchParams.get("apres") || "").slice(0, 80);
    const pc = String(url.searchParams.get("pc") || "").slice(0, 80);
    if (!Number.isSafeInteger(depuis) || depuis < 0) return erreur("requete_invalide", 400);
    const r = await env.DB.prepare(
      `SELECT n.score_id AS id, n.cree_ms, n.table_cle, n.table_nom, n.systeme, n.score, n.duree_partie,
              n.place, p.nom AS pincab,
              CASE WHEN c.pseudo = 'Joueur supprimé' THEN 'Anonyme' ELSE c.pseudo END AS pseudo,
              CASE WHEN c.pseudo = 'Joueur supprimé' THEN '' ELSE n.initiales END AS initiales
         FROM score_notifications n JOIN cartes c ON c.id = n.carte_id JOIN pincabs p ON p.id = n.pincab_id
        WHERE (n.cree_ms > ? OR (n.cree_ms = ? AND n.score_id > ?))
          AND (? = '' OR n.pincab_id <> ?) AND p.bloque = 0
        ORDER BY n.cree_ms, n.score_id LIMIT 50`).bind(depuis, depuis, apres, pc, pc).all();
    return json({ ok: true, notifications: r.results || [], maintenant: Date.now() });
  },

  // NOUVEAU : logo (wheel) d'une table : redirige vers l'image réduite, avec le nom de fichier exact
  async "GET /api/wheel"(req, env, url) {
    const nom = String(url.searchParams.get("n") || "").slice(0, 200);
    const exact = await nomExactWheel(nom);
    // NOUVEAU : absente de la médiathèque -> wheel envoyée par un pincab (si elle existe)
    if (!wheelDansMediatheque(nom)) {
      try {
        await assurerTableWheels(env);
        const w = await env.DB.prepare("SELECT type, image FROM wheels_pincabs WHERE nom_norm = ?")
          .bind(nomNormalise(nom)).first();
        if (w && w.image) {
          return new Response(new Uint8Array(w.image), { headers: { "content-type": w.type,
            "cache-control": "public, max-age=86400", "x-content-type-options": "nosniff" } });
        }
      } catch (e) {
        console.warn(JSON.stringify({ event: "wheel_pincab_illisible", message: String(e?.message || e) }));
      }
    }
    const cible = "https://wsrv.nl/?url=" + encodeURIComponent(MEDIATHEQUE_WHEELS + encodeURIComponent(exact) + ".png") +
      "&w=300&h=300&fit=contain&output=webp";
    // CORRECTIF : la réponse n'est gardée par le navigateur (1 jour) que si le nom exact est connu. Sinon rien
    // n'est gardé : nouvel essai la prochaine fois (la wheel peut arriver plus tard depuis un pincab).
    const garder = wheelDansMediatheque(nom) ? "public, max-age=86400" : "no-store";
    return new Response(null, { status: 302, headers: { location: cible, "cache-control": garder } });
  },

  // NOUVEAU : tables partagées par ce pincab dont le site n'a aucune wheel (ni médiathèque, ni envoi d'un pincab)
  async "GET /api/wheels/manquantes"(req, env, url) {
    const pc = String(url.searchParams.get("pc") || "").slice(0, 40);
    if (!pc) return json({ ok: true, tables: [] });
    await nomExactWheel("");   // charge la liste GitHub si possible (sinon la liste intégrée suffit)
    await assurerTableWheels(env);
    const r = await env.DB.prepare(
      `SELECT DISTINCT s.table_nom AS nom FROM scores s
        WHERE s.pincab_id = ? AND trim(s.table_nom) <> ''
          AND lower(trim(s.table_nom)) NOT IN (SELECT nom_norm FROM wheels_pincabs) LIMIT 500`).bind(pc).all();
    const tables = (r.results || []).map((x) => x.nom).filter((n) => !wheelDansMediatheque(n)).slice(0, 20);
    return json({ ok: true, tables });
  },

  // NOUVEAU : un pincab envoie la wheel d'une table qu'il a partagée (message signé + empreinte de l'image)
  async "POST /api/pincab/wheel"(req, env) {
    const corps = await lireJson(req);
    const qr = await lireQR(env, corps.p, corps.g, "wheel");
    if (qr.erreur) return erreur(qr.erreur);
    const d = qr.donnees;
    const nom = String(d.n || "").trim().slice(0, 80);
    if (!nom || typeof d.h !== "string") return erreur("wheel_invalide");
    let octets;
    try { octets = b64urlDecode(String(corps.img || "")); } catch (e) { return erreur("wheel_invalide"); }
    if (!octets.length || octets.length > TAILLE_MAX_WHEEL) return erreur("wheel_trop_grande");
    const type = typeImage(octets);
    if (!type) return erreur("wheel_invalide");
    if ((await sha256Octets(octets)) !== d.h) return erreur("signature_invalide");
    // seulement pour une table que ce pincab a vraiment partagée, et si le site n'a pas déjà sa wheel
    const joue = await env.DB.prepare("SELECT 1 FROM scores WHERE pincab_id = ? AND lower(trim(table_nom)) = ? LIMIT 1")
      .bind(qr.pincab.id, nomNormalise(nom)).first();
    if (!joue) return erreur("table_inconnue", 404);
    if (wheelDansMediatheque(nom)) return json({ ok: true, deja: true });
    await assurerTableWheels(env);
    await env.DB.prepare(
      `INSERT OR IGNORE INTO wheels_pincabs (nom_norm, nom, type, image, pincab_id, ajoute) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(nomNormalise(nom), nom, type, octets.buffer.slice(octets.byteOffset, octets.byteOffset + octets.byteLength),
            qr.pincab.id, maintenant()).run();
    console.log(JSON.stringify({ event: "wheel_pincab_recue", table: nom, octets: octets.length }));
    return json({ ok: true });
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
    // NOUVEAU : langue du site sur ce téléphone, pour lui envoyer les notifications dans sa langue
    const langue = LANGUES_PUSH.includes(corps.langue) ? corps.langue : "fr";
    try {
      await assurerColonneLangue(env);
      await env.DB.prepare(
        `INSERT INTO push_subscriptions (endpoint, carte_id, p256dh, auth, created, updated, langue) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(endpoint) DO UPDATE SET carte_id = excluded.carte_id, p256dh = excluded.p256dh,
         auth = excluded.auth, updated = excluded.updated, langue = excluded.langue`)
        .bind(endpoint, carte.id, p256dh, auth, maintenantIso, maintenantIso, langue).run();
    } catch (e) {   // sécurité : sans la colonne « langue », l'abonnement est enregistré comme avant
      console.warn(JSON.stringify({ event: "push_abonnement_sans_langue", message: String(e?.message || e) }));
      await env.DB.prepare(
        `INSERT INTO push_subscriptions (endpoint, carte_id, p256dh, auth, created, updated) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(endpoint) DO UPDATE SET carte_id = excluded.carte_id, p256dh = excluded.p256dh,
         auth = excluded.auth, updated = excluded.updated`)
        .bind(endpoint, carte.id, p256dh, auth, maintenantIso, maintenantIso).run();
    }
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

  // NOUVEAU : badges débloqués récemment (tous les joueurs). « depuis » = heure renvoyée par l'appel précédent ;
  // sans « depuis » (première visite) : seulement les badges de la carte de ce téléphone des dernières 24 h.
  async "GET /api/badges/recents"(req, env, url) {
    await assurerTableBadges(env);
    await assurerTableMissions(env);
    await attribuerRecompenses(env);
    const maintenantIso = maintenant();
    const depuisBrut = String(url.searchParams.get("depuis") || "");
    const limite = new Date(Date.now() - 3 * 86400000).toISOString();
    const premier = !/^\d{4}-\d\d-\d\dT/.test(depuisBrut);
    const depuis = premier ? new Date(Date.now() - 86400000).toISOString() : (depuisBrut > limite ? depuisBrut : limite);
    const carte = await carteDe(env, req);
    const r = await env.DB.prepare(
      `SELECT * FROM (
         SELECT b.cle, '' AS periode, b.obtenu AS date, b.carte_id, c.pseudo, c.initiales,
                (SELECT p.nom FROM pincabs p WHERE p.id = b.pincab_id) AS pincab
           FROM badges_obtenus b JOIN cartes c ON c.id = b.carte_id
          WHERE b.obtenu > ?1 AND c.pseudo <> 'Joueur supprimé'
         UNION ALL
         SELECT m.type AS cle, m.periode, m.cree AS date, m.carte_id, c.pseudo, c.initiales,
                (SELECT p.nom FROM scores s JOIN pincabs p ON p.id = s.pincab_id WHERE s.carte_id = m.carte_id
                  ORDER BY s.ajoute DESC LIMIT 1) AS pincab
           FROM missions_reussies m JOIN cartes c ON c.id = m.carte_id
          WHERE m.cree > ?1
         UNION ALL
         SELECT r.type AS cle, r.periode, r.cree AS date, r.carte_id, c.pseudo, c.initiales,
                (SELECT p.nom FROM scores s JOIN pincabs p ON p.id = s.pincab_id WHERE s.carte_id = r.carte_id
                  ORDER BY s.ajoute DESC LIMIT 1) AS pincab
           FROM recompenses r JOIN cartes c ON c.id = r.carte_id
          WHERE r.cree > ?1 AND c.pseudo <> 'Joueur supprimé')
       ORDER BY date LIMIT 20`).bind(depuis).all();
    let badges = (r.results || []).map((x) => ({ ...x, moi: !!carte && x.carte_id === carte.id }));
    if (premier) badges = badges.filter((x) => x.moi);
    return json({ ok: true, maintenant: maintenantIso, badges: badges.slice(-5) });
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
               ORDER BY s.score DESC, s.ajoute DESC LIMIT 1) AS ajoute,
             (SELECT s.duree_partie FROM scores s WHERE s.carte_id = m.carte_id AND s.table_cle = m.table_cle
               ORDER BY s.score DESC, s.ajoute DESC LIMIT 1) AS duree_partie
        FROM m WHERE m.carte_id = ?1 ORDER BY rang, score DESC LIMIT 300`).bind(id).all();
    // NOUVEAU : temps de jeu total du joueur = somme des durées de ses parties partagées (pincabs validés)
    const stats = await env.DB.prepare(
      `SELECT COUNT(*) AS scores, COUNT(DISTINCT s.table_cle) AS tables,
              COALESCE(SUM(CASE WHEN p.bloque = 0 THEN s.duree_partie ELSE 0 END), 0) AS temps_jeu
         FROM scores s LEFT JOIN pincabs p ON p.id = s.pincab_id WHERE s.carte_id = ?`).bind(id).first();
    const podiums = await env.DB.prepare(`${MEILLEURS_SQL}
      SELECT COUNT(*) AS n FROM m WHERE m.carte_id = ?1 AND
        (SELECT COUNT(*) FROM m m2 WHERE m2.table_cle = m.table_cle AND m2.sc > m.sc) < 3`).bind(id).first();
    const records = await env.DB.prepare(`${MEILLEURS_SQL}
      SELECT COUNT(*) AS n FROM m WHERE m.carte_id = ?1 AND
        (SELECT COUNT(*) FROM m m2 WHERE m2.table_cle = m.table_cle AND m2.sc > m.sc) = 0`).bind(id).first();
    const scoresN = Number(stats?.scores) || 0, tablesN = Number(stats?.tables) || 0;
    return json({ ok: true, pseudo: carte.pseudo, initiales: carte.initiales, tables: r.results || [],
      stats: { scores: scoresN, tables: tablesN, podiums: Number(podiums?.n) || 0, records: Number(records?.n) || 0,
               temps_jeu: Number(stats?.temps_jeu) || 0 },   // NOUVEAU : temps de jeu total du joueur
      realisations: realisationsPour(scoresN, tablesN, Number(records?.n) || 0, Number(podiums?.n) || 0),
      recompenses: await recompensesDe(env, carte.id) });   // NOUVEAU
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
    // NOUVEAU : scores encore en vérification (quarantaine), pour l'affichage dans le Tableau des scores
    await assurerTableSuspects(env);
    const v = await env.DB.prepare(`SELECT id FROM scores_suspects WHERE pincab_id = ? AND id IN (${marques})`)
      .bind(corps.pc, ...ids).all();
    return json({ ok: true, en_ligne: (r.results || []).map((x) => x.id),
                  en_verification: (v.results || []).map((x) => x.id) });
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
      score: { table: d.n, table_cle: d.t, systeme: d.sy, score: Number(d.sc), duree_partie: Number(d.du) || 0,
               initiales: normaliserInitiales(d.i),
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
    // NOUVEAU : vérification automatique ; un score anormal attend la décision de l'administrateur
    const raison = await raisonSuspect(env, d);
    if (raison) {
      await env.DB.prepare(
        `INSERT OR IGNORE INTO scores_suspects (id, pincab_id, carte_id, table_cle, table_nom, systeme, score, initiales,
           date_partie, duree_partie, raison, recu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(d.u, d.pc, carte.id, d.t, String(d.n || d.t).slice(0, 80), String(d.sy || "").slice(0, 12),
              Number(d.sc), initiales, String(d.d || "").slice(0, 25), Number(d.du) || 0, raison, maintenant()).run();
      console.warn(JSON.stringify({ event: "score_suspect", pc: d.pc, table: d.t, score: Number(d.sc), raison }));
      return json({ ok: true, en_verification: true, raison });
    }
    const badgesAvant = await clesRealisations(env, carte.id);   // NOUVEAU : badges avant ce score
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
        `INSERT INTO scores (id, pincab_id, carte_id, table_cle, table_nom, systeme, score, initiales, date_partie, ajoute, duree_partie)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(d.u, d.pc, carte.id, d.t, String(d.n || d.t).slice(0, 80), String(d.sy || "").slice(0, 12),
              Number(d.sc), initiales, String(d.d || "").slice(0, 25), maintenant(), Number(d.du) || 0).run();
    } catch (e) {
      return erreur("deja_en_ligne", 409);       // deux téléphones au même instant
    }
    await noterNouveauxBadges(env, carte.id, d.pc, badgesAvant);   // NOUVEAU : badges débloqués par ce score
    const places = await rangs(env, d.t, d.pc, Number(d.sc));
    // Alerte seulement lors d'un record global ou d'une première entrée dans le Top 3.
    // Les améliorations suivantes d'un joueur déjà dans le Top 3 ne génèrent pas de spam.
    if (nouveauRecordJoueur && (places.tous === 1 || (places.tous <= 3 && ancienRangTous > 3))) {
      const creeMs = Date.now();
      await env.DB.prepare(
        `INSERT OR IGNORE INTO score_notifications
           (score_id, carte_id, pincab_id, table_cle, table_nom, systeme, score, initiales, place, cree_ms, duree_partie)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(d.u, carte.id, d.pc, d.t, String(d.n || d.t).slice(0, 80), String(d.sy || "").slice(0, 12),
          Number(d.sc), initiales, places.tous, creeMs, Number(d.du) || 0).run();
      const profil = await env.DB.prepare("SELECT pseudo FROM cartes WHERE id = ?").bind(carte.id).first();
      // CORRECTIF : titre et texte construits pour chaque téléphone dans sa langue (envoyerPushScores)
      // NOUVEAU : l'adresse désigne ce record précis : en ouvrant la notification, le site joue l'animation
      // du record (plein écran doré pour le joueur qui l'a fait, « alerte record » pour les autres)
      const payload = { pseudo: profil?.pseudo || "", initiales, table: String(d.n || d.t).slice(0, 80),
        score: Number(d.sc), place: places.tous, duree: Number(d.du) || 0,
        url: `/table?cle=${encodeURIComponent(d.t)}&record=${encodeURIComponent(d.u)}&quand=${creeMs}`,
        tag: `score-${d.u}` };
      if (ctx && typeof ctx.waitUntil === "function") {
        ctx.waitUntil(envoyerPushScores(env, payload).catch((e) => {
          console.warn(JSON.stringify({ event: "push_scores_error", message: String(e?.message || e) }));
        }));
      }
    }
    await verifierMissions(env, carte.id);   // NOUVEAU : mission du jour / de la semaine / du mois réussie ?
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
      `SELECT s.id, s.table_cle, s.table_nom, s.systeme, s.score, s.duree_partie, s.ajoute, p.nom AS pincab
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
      realisations, recompenses: await recompensesDe(env, carte.id),   // NOUVEAU : succès du jour / semaine / mois / année
    });
  },

  // Le propriétaire peut libérer son pseudo et ses initiales depuis son téléphone, sans code de secours.
  // Les scores restent dans le classement, mais sont anonymisés et ne sont plus rattachés à un compte.
  // CORRECTIF : supprimer son compte depuis le téléphone efface TOUT (avant : scores gardés en « Anonyme »)
  async "POST /api/carte/supprimer"(req, env) {
    const carte = await carteDe(env, req);
    if (!carte) return erreur("carte_requise", 401);
    await effacerCartes(env, [carte.id]);
    return json({ ok: true });
  },

  // NOUVEAU : effacement complet d'un profil depuis le Setup du pincab qui l'a créé (le Setup garde le code du
  // profil). Contrairement à la suppression depuis le téléphone (scores gardés anonymes), TOUT disparaît :
  // scores, scores en vérification, alertes, liens, notifications, badges, succès et le profil lui-même.
  async "POST /api/carte/effacer"(req, env) {
    const carte = await carteDe(env, req);
    if (!carte) return erreur("carte_requise", 401);
    await effacerCartes(env, [carte.id]);
    return json({ ok: true });
  },

  // NOUVEAU : le Setup vérifie que ses profils existent encore (supprimés depuis le téléphone ?).
  // Réponse : {ok, existe} ; « existe: false » = le code ne correspond plus à aucun profil.
  async "POST /api/carte/existe"(req, env) {
    const carte = await carteDe(env, req);
    return json({ ok: true, existe: !!carte && carte.pseudo !== "Joueur supprimé" });
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
      `WITH classes AS (
         SELECT c.id AS carte_id, CASE WHEN c.pseudo = 'Joueur supprimé' THEN 'Anonyme' ELSE c.pseudo END AS pseudo,
                s.initiales, s.score, s.duree_partie, s.ajoute, p.nom AS pincab,
                ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY s.score DESC, s.ajoute DESC, s.id DESC) AS numero
           FROM scores s JOIN cartes c ON c.id = s.carte_id JOIN pincabs p ON p.id = s.pincab_id
          WHERE s.table_cle = ? AND p.bloque = 0
            AND ${vue === "pincab" ? "s.pincab_id = ?" : "1 = 1"}
       )
       SELECT carte_id, pseudo, initiales, score, duree_partie, ajoute, pincab
         FROM classes WHERE numero = 1 ORDER BY score DESC LIMIT 50`)
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
    await nettoyerAnciensComptesSupprimes(env);   // NOUVEAU
    // CORRECTIF : le temps de jeu partagé global et le temps de jeu par table ne sont plus affichés sur
    // l'accueil (la durée de chaque partie reste dans « Derniers scores » et sur les fiches des joueurs)
    const stats = await env.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM pincabs WHERE bloque = 0) AS pincabs,
              (SELECT COUNT(*) FROM cartes WHERE pseudo <> 'Joueur supprimé') AS joueurs,
              (SELECT COUNT(*) FROM scores) AS scores`).first();
    const r = await env.DB.prepare(
      `SELECT s.table_cle, s.table_nom, s.systeme, s.score, s.duree_partie, s.initiales, s.ajoute, p.nom AS pincab
         FROM scores s JOIN pincabs p ON p.id = s.pincab_id
        WHERE p.bloque = 0 ORDER BY s.ajoute DESC LIMIT 20`).all();
    const derniers = [];
    for (const s of r.results || []) derniers.push({ ...s, place: (await rangs(env, s.table_cle, "", s.score)).tous });
    return json({ ok: true, stats, derniers });
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

  // NOUVEAU : scores mis en quarantaine par la vérification automatique
  async "GET /api/admin/suspects"(req, env) {
    if (!adminOk(req, env)) return erreur("acces_refuse", 403);
    await assurerTableSuspects(env);
    const r = await env.DB.prepare(
      `SELECT s.*, p.nom AS pincab, c.pseudo,
              (SELECT MAX(x.score) FROM scores x WHERE x.table_cle = s.table_cle) AS record
         FROM scores_suspects s JOIN pincabs p ON p.id = s.pincab_id LEFT JOIN cartes c ON c.id = s.carte_id
        ORDER BY s.recu DESC LIMIT 300`).all();
    return json({ ok: true, suspects: r.results || [] });
  },

  async "POST /api/admin/suspect"(req, env) {
    if (!adminOk(req, env)) return erreur("acces_refuse", 403);
    await assurerTableSuspects(env);
    const corps = await lireJson(req);
    const id = String(corps.id || "");
    const s = await env.DB.prepare("SELECT * FROM scores_suspects WHERE id = ?").bind(id).first();
    if (!s) return erreur("introuvable", 404);
    const badgesAvant = corps.accepter ? await clesRealisations(env, s.carte_id) : [];   // NOUVEAU
    const ops = [env.DB.prepare("DELETE FROM scores_suspects WHERE id = ?").bind(id)];
    if (corps.accepter) {
      ops.unshift(env.DB.prepare(
        `INSERT OR IGNORE INTO scores (id, pincab_id, carte_id, table_cle, table_nom, systeme, score, initiales, date_partie, ajoute, duree_partie)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(s.id, s.pincab_id, s.carte_id, s.table_cle, s.table_nom, s.systeme, s.score, s.initiales,
              s.date_partie, maintenant(), s.duree_partie));
    }
    await env.DB.batch(ops);
    if (corps.accepter) await noterNouveauxBadges(env, s.carte_id, s.pincab_id, badgesAvant);   // NOUVEAU
    if (corps.accepter) await verifierMissions(env, s.carte_id);   // NOUVEAU
    return json({ ok: true });
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
  if (!env.ADMIN_CLE || env.ADMIN_CLE.length < 12) return false;
  // CORRECTIF : la page admin envoie maintenant la clé encodée (accents, caractères spéciaux) ;
  // une clé envoyée telle quelle (anciens outils, tests) reste acceptée
  let decodee = cle;
  try { decodee = decodeURIComponent(cle); } catch (_) {}
  return cle === env.ADMIN_CLE || decodee === env.ADMIN_CLE;
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
