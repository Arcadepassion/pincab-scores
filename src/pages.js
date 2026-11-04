// =====================================================================
//  PincabOS Scores en ligne — pages du site (une seule page, rendue côté téléphone)
// =====================================================================
export const PAGE_HTML = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#070B1A">
<title>PincabOS Scores</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;800&display=swap">
<link rel="stylesheet" href="/app.css">
</head>
<body>
<main id="app" aria-live="polite"></main>
<script src="/app.js"></script>
</body>
</html>`;

export const APP_CSS = `
:root{--fond:#070B1A;--carte:#0B1230;--carte2:#111A3A;--bord:#1C2A57;--bord2:#2A3A70;--texte:#E6ECFF;
--doux:#A7B3D9;--gris:#8F9CC8;--cyan:#22D3EE;--cyan2:#67E8F9;--or:#FFC83D;--rose:#FF3DA6;--rouge:#FF7A7A}
*{box-sizing:border-box}
html,body{margin:0;background:var(--fond);color:var(--texte);font-family:Inter,system-ui,sans-serif;-webkit-text-size-adjust:100%}
main{max-width:520px;margin:0 auto;padding:20px 16px 40px;display:flex;flex-direction:column;gap:14px;min-height:100vh}
a{color:var(--cyan)}a:hover{color:var(--cyan2)}
.entete{display:flex;align-items:center;justify-content:space-between;gap:10px}
.retour{width:44px;min-width:44px;height:44px;min-height:44px;padding:0;border:1px solid var(--bord2);border-radius:50%;background:var(--carte2);color:var(--texte);font-size:25px;line-height:1}
.logo{font-family:Anton,Impact,sans-serif;font-size:22px;letter-spacing:1px;color:#fff;text-decoration:none}
.logo span{color:var(--cyan)}
.pastille{min-width:44px;height:44px;border-radius:22px;background:var(--cyan);color:var(--fond);display:flex;align-items:center;
justify-content:center;font-family:Anton,Impact,sans-serif;font-size:14px;text-decoration:none;padding:0 10px}
.titre{font-family:Anton,Impact,sans-serif;letter-spacing:1px;margin:0}
.or{color:var(--or)}.cyan{color:var(--cyan2)}.doux{color:var(--doux)}.gris{color:var(--gris)}
.bloc{background:var(--carte);border:1px solid var(--bord);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px}
.cadre{border-radius:18px;padding:2px;background:linear-gradient(120deg,#FF3DA6,#FFC83D,#22D3EE,#7C5CFF)}
.cadre>.bloc{border:none;border-radius:16px;align-items:center;text-align:center}
.score{font-family:Anton,Impact,sans-serif;font-size:42px;color:var(--or);letter-spacing:1px;text-shadow:0 0 14px rgba(255,138,0,.55);
line-height:1.1;word-break:break-all}
.badge{display:inline-flex;align-items:center;gap:6px;border-radius:20px;padding:6px 14px;font-weight:800;font-size:13px;
background:rgba(34,211,238,.12);color:var(--cyan2)}
.badge.alerte{background:rgba(255,200,61,.14);color:var(--or)}
.badge.erreur{background:rgba(255,122,122,.14);color:var(--rouge)}
.deux{display:flex;gap:10px;width:100%}
.deux>div{flex:1;background:var(--carte2);border-radius:12px;padding:10px;text-align:center}
.petit{font-size:12px;color:var(--doux)}
.grand{font-family:Anton,Impact,sans-serif;font-size:26px}
button,.bouton{display:block;width:100%;border:none;border-radius:14px;padding:15px;font:800 16px Inter,system-ui,sans-serif;
background:var(--cyan);color:var(--fond);text-align:center;text-decoration:none;cursor:pointer;min-height:48px}
.bouton:hover,.bouton:visited{color:var(--fond)}
.bouton.second:hover,.bouton.second:visited{color:var(--texte)}
.pastille:hover,.pastille:visited{color:var(--fond)}
button.second,.bouton.second{background:var(--carte2);color:var(--texte);border:1px solid var(--bord2);font-weight:600}
button:disabled{opacity:.55;cursor:default}
.actions{display:flex;flex-direction:column;gap:10px;margin-top:auto}
label{font-size:13px;font-weight:600;color:var(--doux)}
input{width:100%;background:var(--carte2);border:1px solid var(--bord2);border-radius:12px;color:var(--texte);padding:13px;
font:600 16px Inter,system-ui,sans-serif}
input:focus{outline:2px solid var(--cyan);outline-offset:1px}
.champ{display:flex;flex-direction:column;gap:6px}
.liste{display:flex;flex-direction:column;gap:6px}
.ligne{display:flex;align-items:center;gap:10px;background:var(--carte);border:1px solid var(--bord);border-radius:12px;padding:10px 12px;
color:var(--texte);text-decoration:none}
.ligne.moi{background:rgba(34,211,238,.10);border-color:var(--cyan)}
.rang{width:34px;font-family:Anton,Impact,sans-serif;font-size:22px;text-align:center;flex-shrink:0}
.milieu{flex:1;min-width:0;display:flex;flex-direction:column}
.milieu b{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.droite{font-family:Anton,Impact,sans-serif;font-size:17px;color:var(--or);text-align:right}
.onglets{display:flex;background:var(--carte2);border-radius:14px;padding:4px;gap:4px}
.onglets button{flex:1;background:transparent;color:var(--doux);padding:11px;font-size:14px;min-height:44px}
.onglets button.actif{background:var(--cyan);color:var(--fond)}
.code{font-family:ui-monospace,Consolas,monospace;font-size:22px;letter-spacing:2px;color:var(--or);background:var(--carte2);
border-radius:12px;padding:14px;text-align:center;word-break:break-all;user-select:all}
.carte-joueur{border-radius:20px;padding:2px;background:linear-gradient(135deg,#22D3EE,#7C5CFF 45%,#FF3DA6)}
.carte-joueur>div{border-radius:18px;background:linear-gradient(160deg,#13204D,#0A1029 70%);padding:18px;display:flex;flex-direction:column;gap:14px}
.ini{font-family:Anton,Impact,sans-serif;font-size:40px;color:var(--cyan2);text-shadow:0 0 16px rgba(34,211,238,.6);letter-spacing:2px;line-height:1}
.trois{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.trois>div{background:rgba(255,255,255,.05);border-radius:12px;padding:10px 6px;text-align:center}
.section{font-size:12px;font-weight:800;letter-spacing:1px;color:var(--gris);margin-top:4px}
.vide{color:var(--gris);text-align:center;padding:20px 10px;font-size:14px}
.pied{font-size:12px;color:var(--gris);text-align:center;line-height:1.5}
.chargement{color:var(--gris);text-align:center;padding:40px 0}
.ico{width:24px;height:24px;object-fit:contain;flex-shrink:0;vertical-align:middle}
.ico.petite{width:16px;height:16px}.ico.moyenne{width:30px;height:30px}
.avec-ico{display:flex;align-items:center;justify-content:center;gap:10px}
.wheel{width:46px;height:46px;object-fit:contain;flex-shrink:0;filter:drop-shadow(0 0 6px rgba(34,211,238,.35))}
.wheel.grande{width:150px;height:150px;filter:drop-shadow(0 0 22px rgba(34,211,238,.45))}
.wheel.moyenne{width:84px;height:84px}
.logo img{height:30px;width:auto;vertical-align:middle}
.hero{display:flex;justify-content:center}.hero img{height:150px;width:auto}
.systeme{display:inline-flex;align-items:center;gap:5px}
.m-txt{position:relative;margin-bottom:.62em}
span.m-txt{display:inline-block}
.m-txt::after{content:attr(data-m);position:absolute;left:0;right:0;top:100%;margin-top:-.12em;transform:scaleY(-1);
pointer-events:none;text-shadow:none;opacity:.9;
-webkit-mask-image:linear-gradient(to top,rgba(0,0,0,.42),rgba(0,0,0,0) 78%);mask-image:linear-gradient(to top,rgba(0,0,0,.42),rgba(0,0,0,0) 78%)}
.m-img{position:relative;display:inline-block;line-height:0;margin-bottom:13px;vertical-align:middle}
.m-img.p{margin-bottom:7px}.hero .m-img{margin-bottom:64px}
.m-img>.m-reflet{position:absolute;left:0;top:100%;margin-top:1px;transform:scaleY(-1);pointer-events:none;filter:none;
-webkit-mask-image:linear-gradient(to top,rgba(0,0,0,.4),rgba(0,0,0,0) 45%);mask-image:linear-gradient(to top,rgba(0,0,0,.4),rgba(0,0,0,0) 45%)}
@media (prefers-reduced-motion:no-preference){.cadre{animation:tourne 6s linear infinite;background-size:300% 300%}
@keyframes tourne{0%{background-position:0 50%}50%{background-position:100% 50%}100%{background-position:0 50%}}}
`;

export const APP_JS = `
"use strict";
(function () {
var LANGUE = (navigator.language || "fr").slice(0, 2).toLowerCase();
var TEXTES = {
  fr: {
    accueil: "Accueil", ma_carte: "Ma carte", chargement: "Chargement…", erreur_reseau: "Connexion impossible. Réessaie.",
    recherche: "Chercher une table", pincabs: "Pincabs", joueurs: "Joueurs", scores: "Scores",
    derniers: "DERNIERS SCORES", aucun: "Aucun score pour l'instant.", record: "RECORD", top: "TOP {}",
    score_ajoute: "SCORE AJOUTÉ À TA CARTE", nouveau_record: "NOUVEAU RECORD !", ton_score: "TON SCORE",
    sur_pincab: "Sur ce pincab", tous_pincabs: "Tous les pincabs", place: "{}e", place1: "1er",
    voir_classement: "Voir le classement de la table", confirmer: "Mettre mon score en ligne",
    confirmer_aide: "Ce score apparaîtra dans le classement en ligne avec ta carte {}.",
    deja_titre: "CE SCORE EST DÉJÀ EN LIGNE", deja_texte: "Ce QR code a déjà été scanné. Chaque score ne compte qu'une seule fois.",
    ajoute_par: "Ajouté par", le: "Le", table: "Table", score: "Score",
    pas_toi: "Ce n'est pas toi ? Seule la carte liée au joueur du pincab peut récupérer un score.",
    besoin_carte: "Pour mettre ce score en ligne, il te faut une carte joueur (gratuite, sans e-mail).",
    creer_carte: "Créer ma carte joueur", restaurer: "J'ai déjà une carte",
    non_liee_titre: "TA CARTE N'EST PAS LIÉE À CE PINCAB",
    non_liee_texte: "Sur le pincab : Tableau des scores > Joueurs > Lier une carte, puis scanne le QR code affiché. À faire une seule fois.",
    initiales_diff: "Ce score a été fait avec les initiales {}, ta carte a les initiales {}. Seule la carte {} de ce pincab peut le récupérer.",
    sans_initiales: "Ce score n'a pas d'initiales : il ne peut pas être mis en ligne.",
    erreurs: {
      qr_illisible: "Ce QR code n'est pas un QR PincabOS valide.", signature_invalide: "QR code refusé : il n'a pas été créé par un pincab PincabOS.",
      pincab_inconnu: "Ce pincab n'est pas enregistré.", pincab_bloque: "Ce pincab ne peut plus envoyer de scores.",
      qr_mauvais_type: "Ce n'est pas le bon type de QR code.", qr_expire: "Ce QR code a expiré : affiches-en un nouveau sur le pincab.",
      score_invalide: "Score invalide.", table_invalide: "Table invalide.", carte_requise: "Carte joueur nécessaire.",
      initiales_prises: "Les initiales {} sont déjà utilisées par une autre carte sur ce pincab. Crée une carte avec d'autres initiales.",
      deja_en_ligne: "Ce score est déjà en ligne.", code_inconnu: "Code inconnu. Vérifie-le et réessaie.",
      pseudo_invalide: "Pseudo trop court (2 caractères minimum).", pseudo_deja_pris: "Ce pseudo est déjà utilisé par un autre joueur : choisissez-en un autre.", initiales_invalides: "Initiales invalides (1 à 3 lettres ou chiffres).",
      trop_de_demandes: "Trop de demandes depuis cette connexion. Réessaie demain.", erreur_serveur: "Erreur du serveur. Réessaie plus tard.",
      acces_refuse: "Clé d'administration incorrecte (attention aux majuscules ajoutées par le clavier du téléphone).", introuvable: "Page introuvable."
    },
    carte_titre: "MA CARTE JOUEUR", creer_titre: "CRÉER MA CARTE JOUEUR",
    creer_texte: "Ta carte garde tous tes scores. Pas d'e-mail ni de mot de passe : seulement un code de secours.",
    pseudo: "Pseudo", initiales: "Initiales (les mêmes que sur le pincab)", creer: "Créer ma carte",
    code_titre: "TON CODE DE SECOURS", code_texte: "Note-le ou prends-le en photo : c'est le seul moyen de retrouver ta carte sur un autre téléphone. Ne le donne à personne.",
    code_ok: "J'ai noté mon code", restaurer_titre: "RETROUVER MA CARTE", code: "Code de secours", valider: "Valider",
    records: "Records", podiums: "Podiums", liee_a: "Liée à", aucun_pincab: "Pas encore liée à un pincab",
    mes_scores: "MES SCORES", voir_code: "Afficher mon code de secours", oublier: "Retirer la carte de ce téléphone",
    oublier_confirm: "Retirer la carte de ce téléphone ? Garde bien ton code de secours pour la retrouver.",
    lier_titre: "LIER MA CARTE À CE PINCAB", lier_ok: "CARTE LIÉE !", lier_ok_texte: "Ta carte {} est liée à « {} ». Tes prochains scores avec les initiales {} pourront être mis en ligne.",
    lier_deja: "Ta carte est déjà liée à « {} ».", retour: "Retour", joueur: "JOUEUR",
    retour_page: "Retour à la page précédente", pseudo_modifier: "Modifier le pseudo", pseudo_enregistre: "Pseudo enregistré.",
    delier: "Délier", delier_confirme: "Délier ce pincab ? Les anciens scores restent dans les classements.",
    compte_supprimer: "Supprimer mon compte", compte_supprimer_confirme: "Supprimer ce compte ? Le pseudo sera libéré et les scores resteront anonymisés dans les classements. Cette action est définitive.",
    compte_supprime: "Compte supprimé. Les scores conservés dans les classements sont anonymisés.",
    setup_profil_aide: "Crée ton profil dans le Setup du pincab, puis scanne le QR de connexion affiché dans ses réglages.",
    deconnexion: "Déconnecter ce téléphone", deconnexion_confirme: "Déconnecter ce téléphone ? Le profil et les scores ne seront pas supprimés.",
    realisations: "SUCCÈS", aucun_succes: "Continue à jouer pour débloquer tes premiers succès.",
    voir_joueurs: "Voir les joueurs et leurs succès", meilleur_score: "Meilleur score", tables_jouees: "Tables jouées",
    succes_premier_score: "Premier score", succes_cinq_tables: "5 tables jouées", succes_dix_tables: "10 tables jouées",
    succes_premier_podium: "Premier podium", succes_premier_record: "Premier record", succes_cent_scores: "100 scores",
    temps_jeu: "Temps de jeu partagé", heures: "h", minutes: "min",
    donnees_qr: "Seuls les scores scannés depuis un pincab PincabOS apparaissent ici.", admin: "Administration", cle_admin: "Clé d'administration",
    approuver: "Valider", bloquer: "Bloquer", debloquer: "Débloquer", retirer: "Retirer",
    cle_ok: "Clé acceptée : {} pincab(s) enregistré(s).", aucun_pincab_admin: "Aucun pincab enregistré pour l'instant.",
    en_attente: "En attente de validation", valide: "Validé", bloque: "Bloqué"
  },
  en: {
    accueil: "Home", ma_carte: "My card", chargement: "Loading…", erreur_reseau: "Connection failed. Try again.",
    recherche: "Search a table", pincabs: "Pincabs", joueurs: "Players", scores: "Scores",
    derniers: "LATEST SCORES", aucun: "No scores yet.", record: "RECORD", top: "TOP {}",
    score_ajoute: "SCORE ADDED TO YOUR CARD", nouveau_record: "NEW RECORD!", ton_score: "YOUR SCORE",
    sur_pincab: "On this pincab", tous_pincabs: "All pincabs", place: "#{}", place1: "#1",
    voir_classement: "See the table leaderboard", confirmer: "Put my score online",
    confirmer_aide: "This score will appear in the online leaderboard with your card {}.",
    deja_titre: "THIS SCORE IS ALREADY ONLINE", deja_texte: "This QR code has already been scanned. Each score only counts once.",
    ajoute_par: "Added by", le: "On", table: "Table", score: "Score",
    pas_toi: "Not you? Only the card linked to the pincab player can claim a score.",
    besoin_carte: "To put this score online you need a player card (free, no e-mail).",
    creer_carte: "Create my player card", restaurer: "I already have a card",
    non_liee_titre: "YOUR CARD IS NOT LINKED TO THIS PINCAB",
    non_liee_texte: "On the pincab: Scoreboard > Players > Link a card, then scan the QR code shown. Only once.",
    initiales_diff: "This score was made with the initials {}, your card has the initials {}. Only card {} of this pincab can claim it.",
    sans_initiales: "This score has no initials: it cannot be put online.",
    erreurs: {
      qr_illisible: "This is not a valid PincabOS QR code.", signature_invalide: "QR code refused: it was not created by a PincabOS pincab.",
      pincab_inconnu: "This pincab is not registered.", pincab_bloque: "This pincab can no longer send scores.",
      qr_mauvais_type: "Wrong type of QR code.", qr_expire: "This QR code has expired: show a new one on the pincab.",
      score_invalide: "Invalid score.", table_invalide: "Invalid table.", carte_requise: "Player card required.",
      initiales_prises: "The initials {} are already used by another card on this pincab. Create a card with other initials.",
      deja_en_ligne: "This score is already online.", code_inconnu: "Unknown code. Check it and try again.",
      pseudo_invalide: "Nickname too short (2 characters minimum).", pseudo_deja_pris: "This nickname is already used by another player: choose another one.", initiales_invalides: "Invalid initials (1 to 3 letters or digits).",
      trop_de_demandes: "Too many requests from this connection. Try again tomorrow.", erreur_serveur: "Server error. Try again later.",
      acces_refuse: "Wrong admin key (watch out for capital letters added by the phone keyboard).", introuvable: "Page not found."
    },
    carte_titre: "MY PLAYER CARD", creer_titre: "CREATE MY PLAYER CARD",
    creer_texte: "Your card keeps all your scores. No e-mail or password: just a recovery code.",
    pseudo: "Nickname", initiales: "Initials (the same as on the pincab)", creer: "Create my card",
    code_titre: "YOUR RECOVERY CODE", code_texte: "Write it down or take a photo: it is the only way to get your card back on another phone. Never share it.",
    code_ok: "I saved my code", restaurer_titre: "RECOVER MY CARD", code: "Recovery code", valider: "Confirm",
    records: "Records", podiums: "Podiums", liee_a: "Linked to", aucun_pincab: "Not linked to a pincab yet",
    mes_scores: "MY SCORES", voir_code: "Show my recovery code", oublier: "Remove the card from this phone",
    oublier_confirm: "Remove the card from this phone? Keep your recovery code to get it back.",
    lier_titre: "LINK MY CARD TO THIS PINCAB", lier_ok: "CARD LINKED!", lier_ok_texte: "Your card {} is linked to “{}”. Your next scores with the initials {} can be put online.",
    lier_deja: "Your card is already linked to “{}”.", retour: "Back", joueur: "PLAYER",
    retour_page: "Back to the previous page", pseudo_modifier: "Change nickname", pseudo_enregistre: "Nickname saved.",
    delier: "Unlink", delier_confirme: "Unlink this pincab? Existing scores stay in the leaderboards.",
    compte_supprimer: "Delete my account", compte_supprimer_confirme: "Delete this account? The nickname will be released and scores will remain anonymized in the leaderboards. This cannot be undone.",
    compte_supprime: "Account deleted. Scores retained in leaderboards are anonymized.",
    setup_profil_aide: "Create your profile in the pincab Setup, then scan the sign-in QR shown in its settings.",
    deconnexion: "Sign out on this phone", deconnexion_confirme: "Sign out on this phone? Your profile and scores will not be deleted.",
    realisations: "ACHIEVEMENTS", aucun_succes: "Keep playing to unlock your first achievements.",
    voir_joueurs: "See players and achievements", meilleur_score: "Best score", tables_jouees: "Tables played",
    succes_premier_score: "First score", succes_cinq_tables: "5 tables played", succes_dix_tables: "10 tables played",
    succes_premier_podium: "First podium", succes_premier_record: "First record", succes_cent_scores: "100 scores",
    temps_jeu: "Shared play time", heures: "h", minutes: "min",
    compte_supprime: "Account deleted. Scores retained in leaderboards are anonymized.",
    donnees_qr: "Only scores scanned from a PincabOS pincab appear here.", admin: "Administration", cle_admin: "Admin key",
    approuver: "Approve", bloquer: "Block", debloquer: "Unblock", retirer: "Remove",
    cle_ok: "Key accepted: {} pincab(s) registered.", aucun_pincab_admin: "No pincab registered yet.",
    en_attente: "Waiting for approval", valide: "Approved", bloque: "Blocked"
  }
};
var T = TEXTES[LANGUE] || TEXTES.en;
document.documentElement.lang = TEXTES[LANGUE] ? LANGUE : "en";
function t(cle) {
  var v = cle.indexOf("erreurs.") === 0 ? (T.erreurs[cle.slice(8)] || T.erreurs.erreur_serveur) : (T[cle] || cle);
  for (var i = 1; i < arguments.length; i++) v = v.replace("{}", arguments[i]);
  return v;
}
function nombre(n) { try { return new Intl.NumberFormat(LANGUE).format(n); } catch (e) { return String(n); } }
function dureeTexte(secondes) {
  secondes = Math.max(0, Number(secondes) || 0);
  var h = Math.floor(secondes / 3600), m = Math.floor((secondes % 3600) / 60);
  return h ? h + " " + T.heures + " " + m + " " + T.minutes : m + " " + T.minutes;
}
function date(iso) {
  try { return new Date(iso).toLocaleString(LANGUE, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch (e) { return iso; }
}
function placeTexte(n) { return n === 1 ? T.place1 : t("place", n); }
var COULEURS_PLACE = ["#FFE27A", "#FFC83D", "#FFB347", "#FF9A3C", "#E07B2E"];

// --- construction sûre du DOM (jamais de HTML venant du serveur) ---
function el(tag, attrs) {
  var e = document.createElement(tag);
  attrs = attrs || {};
  Object.keys(attrs).forEach(function (k) {
    var v = attrs[k];
    if (v === null || v === undefined || v === false) return;
    if (k === "class") e.className = v;
    else if (k === "style") e.setAttribute("style", v);
    else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  });
  for (var i = 2; i < arguments.length; i++) ajouter(e, arguments[i]);
  return e;
}
function ajouter(parent, enfant) {
  if (enfant === null || enfant === undefined || enfant === false) return;
  if (Array.isArray(enfant)) { enfant.forEach(function (x) { ajouter(parent, x); }); return; }
  parent.appendChild(typeof enfant === "string" || typeof enfant === "number" ? document.createTextNode(String(enfant)) : enfant);
}
// --- images : icônes du site et logos (wheels) des tables ---
var MEDIATHEQUE = "raw.githubusercontent.com/Arcadepassion/pincab_os-media-library/main/wheel/";
function ico(nom, classe) {
  return el("img", { src: "/images/" + nom + ".png", alt: "", "aria-hidden": "true", class: "ico" + (classe ? " " + classe : "") });
}
function secours() { if (this.getAttribute("data-secours")) return; this.setAttribute("data-secours", "1"); this.src = "/images/table.png"; }
function wheel(nomTable, classe) {
  // logo de la table pris dans la médiathèque PincabOS (GitHub), réduit à la volée ; sinon logo générique
  var source = "https://wsrv.nl/?url=" + encodeURIComponent(MEDIATHEQUE + encodeURIComponent(nomTable || "") + ".png") +
    "&w=300&h=300&fit=contain&output=webp";
  return el("img", { src: source, alt: "", "aria-hidden": "true", class: "wheel" + (classe ? " " + classe : ""),
                     loading: "lazy", onerror: secours });
}
function systeme(sy) {
  var nom = sy === "VPX" ? "vpx" : (sy === "PBFX" ? "pbfx" : "");
  var texte = sy === "VPX" ? "Visual Pinball" : (sy === "PBFX" ? "Pinball FX" : (sy || ""));
  return el("span", { class: "systeme" }, nom ? ico(nom, "petite") : null, texte);
}
// NOUVEAU : effet miroir (reflet sous le texte ou l'image, comme dans le Tableau des scores de PincabOS)
function mt(e) { e.classList.add("m-txt"); e.setAttribute("data-m", e.textContent); return e; }
function mi(img) {
  var reflet = img.cloneNode(false);
  reflet.className += " m-reflet";
  reflet.setAttribute("alt", ""); reflet.setAttribute("aria-hidden", "true");
  return el("span", { class: "m-img" + (/petite/.test(img.className) ? " p" : "") }, img, reflet);
}
function boutonIco(nom, texte, attrs) {
  attrs = attrs || {};
  attrs.class = ((attrs.class || "") + " avec-ico").trim();
  return el(attrs.href ? "a" : "button", attrs.href ? attrs : Object.assign({ type: "button" }, attrs),
            ico(nom), el("span", {}, texte));
}
var APP = document.getElementById("app");
function afficher() {
  APP.textContent = "";
  for (var i = 0; i < arguments.length; i++) ajouter(APP, arguments[i]);
  window.scrollTo(0, 0);
}

// --- carte stockée sur ce téléphone ---
var CLE_STOCKAGE = "pincabos_carte", CLE_INITIALES = "pincabos_initiales";
function codeCarte() { try { return localStorage.getItem(CLE_STOCKAGE) || ""; } catch (e) { return ""; } }
function garderCode(c) { try { localStorage.setItem(CLE_STOCKAGE, c); } catch (e) {} }
function oublierCode() { try { localStorage.removeItem(CLE_STOCKAGE); localStorage.removeItem(CLE_INITIALES); } catch (e) {} }
function garderInitiales(i) { window.INITIALES = i; try { localStorage.setItem(CLE_INITIALES, i); } catch (e) {} }
try { window.INITIALES = codeCarte() ? (localStorage.getItem(CLE_INITIALES) || "") : ""; } catch (e) {}

function api(methode, chemin, corps) {
  var entetes = { "content-type": "application/json" };
  var code = codeCarte();
  if (code) entetes.authorization = "Bearer " + code;
  if (window.CLE_ADMIN) entetes["x-admin-cle"] = window.CLE_ADMIN;
  return fetch(chemin, { method: methode, headers: entetes, body: corps ? JSON.stringify(corps) : undefined })
    .then(function (r) { return r.json(); })
    .catch(function () { return { ok: false, erreur: "reseau" }; });
}
function messageErreur(r) {
  if (!r || r.erreur === "reseau") return T.erreur_reseau;
  return t("erreurs." + r.erreur, r.initiales || r.attendues || "");
}

function entete() {
  var code = codeCarte();
  return el("div", { class: "entete" },
    location.pathname !== "/" ? el("button", { class: "retour", type: "button", "aria-label": T.retour_page,
      onclick: function () {
        var precedent = "";
        try { precedent = document.referrer ? new URL(document.referrer).origin : ""; } catch (e) {}
        if (precedent === location.origin) history.back(); else location.href = "/";
      } }, "←") : null,
    el("a", { class: "logo", href: "/", "aria-label": "PincabOS Scores" },
      el("img", { src: "/images/logo.png", alt: "PincabOS" }), " SCORES"),
    el("a", { class: "pastille avec-ico", href: "/carte", "aria-label": T.ma_carte, style: "gap:6px;padding:0 12px 0 8px" },
      el("img", { src: "/images/carte.png", alt: "", "aria-hidden": "true", class: "ico" }),
      code ? (window.INITIALES || T.ma_carte) : T.ma_carte));
}
function chargement() { afficher(entete(), el("div", { class: "chargement" }, T.chargement)); }
function blocErreur(texte) {
  return el("div", { class: "bloc", style: "align-items:center;text-align:center" },
    el("span", { class: "badge erreur" }, "!"), el("div", {}, texte));
}
function ligneScore(rang, haut, bas, droite, lien, moi, nomTable) {
  var couleur = rang <= 5 ? COULEURS_PLACE[rang - 1] : "#8F9CC8";
  return el(lien ? "a" : "div", { class: "ligne" + (moi ? " moi" : ""), href: lien || null },
    el("div", { class: "rang", style: "color:" + couleur }, String(rang)),
    nomTable ? wheel(nomTable) : null,
    el("div", { class: "milieu" }, el("b", {}, haut), el("span", { class: "petit" }, bas)),
    el("div", { class: "droite" }, miroirDroite(droite)));
}
function miroirDroite(droite) {
  // NOUVEAU : le score de la ligne a son reflet (le badge éventuel reste tel quel)
  var d = Array.isArray(droite) ? droite.slice() : [droite];
  if (typeof d[0] === "string") d[0] = mt(el("span", {}, d[0]));
  return d;
}

// ------------------------------------------------------------------ pages
var params = new URLSearchParams(location.search);

function pageAccueil() {
  chargement();
  api("GET", "/api/accueil").then(function (r) {
    if (!r.ok) { afficher(entete(), blocErreur(messageErreur(r))); return; }
    var resultats = el("div", { class: "liste" });
    var champ = el("input", { id: "recherche", type: "search", placeholder: T.recherche, autocomplete: "off" });
    var minuterie = null;
    champ.addEventListener("input", function () {
      clearTimeout(minuterie);
      minuterie = setTimeout(function () {
        var q = champ.value.trim();
        if (q.length < 2) { resultats.textContent = ""; return; }
        api("GET", "/api/recherche?q=" + encodeURIComponent(q)).then(function (x) {
          resultats.textContent = "";
          (x.tables || []).forEach(function (tb) {
            ajouter(resultats, el("a", { class: "ligne", href: "/table?cle=" + encodeURIComponent(tb.table_cle) },
              wheel(tb.table_nom),
              el("div", { class: "milieu" }, el("b", {}, tb.table_nom), el("span", { class: "petit" }, systeme(tb.systeme))),
              el("div", { class: "droite" }, nombre(tb.record))));
          });
        });
      }, 250);
    });
    var derniers = (r.derniers || []).map(function (s) {
      var badge = s.place === 1 ? T.record : (s.place <= 5 ? t("top", s.place) : placeTexte(s.place));
      return ligneScore(s.place, s.table_nom, s.initiales + " · " + s.pincab + " · " + date(s.ajoute),
        [nombre(s.score), el("div", { class: "petit", style: "font-family:Inter;font-weight:800;color:#FFC83D" }, badge)],
        "/table?cle=" + encodeURIComponent(s.table_cle), false, s.table_nom);
    });
    function stat(icone, valeur, texte) {
      return el("div", { class: "bloc", style: "padding:12px;align-items:center;gap:4px" }, ico(icone, "moyenne"),
        el("div", { class: "grand or" }, nombre(valeur)), el("div", { class: "petit" }, texte));
    }
    afficher(entete(),
      el("div", { class: "hero" }, mi(el("img", { src: "/images/scores.png", alt: "" }))),
      el("div", { class: "champ" }, el("label", { for: "recherche" }, T.recherche), champ), resultats,
      el("div", { class: "trois", style: "grid-template-columns:repeat(2,minmax(0,1fr))" },
        stat("table", r.stats.pincabs, T.pincabs), stat("joueurs", r.stats.joueurs, T.joueurs),
        stat("meilleur-score", r.stats.scores, T.scores),
        el("div", { class: "bloc", style: "padding:12px;align-items:center;gap:4px" }, ico("chrono", "moyenne"),
          el("div", { class: "grand or" }, dureeTexte(r.stats.temps_jeu)), el("div", { class: "petit" }, T.temps_jeu))),
      el("a", { class: "bouton second", href: "/joueurs" }, T.voir_joueurs),
      el("div", { class: "section" }, T.derniers),
      derniers.length ? el("div", { class: "liste" }, derniers) : el("div", { class: "vide" }, T.aucun),
      el("div", { class: "pied" }, T.donnees_qr));
  });
}

function carteScore(s, badge) {
  return el("div", { class: "cadre" }, el("div", { class: "bloc" },
    badge,
    wheel(s.table, "grande"),
    el("div", { style: "font-weight:800;font-size:18px" }, s.table),
    el("div", { class: "petit" }, systeme(s.systeme), " · " + s.pincab + (s.date ? " · " + date(s.date) : "")),
    mt(el("div", { class: "score" }, nombre(s.score))),
    s.initiales ? el("div", { class: "cyan", style: "font-family:Anton,Impact,sans-serif;font-size:28px;letter-spacing:2px" }, s.initiales) : null));
}
function blocRangs(rangs) {
  return el("div", { class: "deux" },
    el("div", {}, el("div", { class: "petit avec-ico", style: "gap:6px" }, ico("podium", "petite"), T.sur_pincab), el("div", { class: "grand", style: "color:" + (COULEURS_PLACE[rangs.pincab - 1] || "#E6ECFF") }, placeTexte(rangs.pincab))),
    el("div", {}, el("div", { class: "petit avec-ico", style: "gap:6px" }, ico("podium", "petite"), T.tous_pincabs), el("div", { class: "grand", style: "color:" + (COULEURS_PLACE[rangs.tous - 1] || "#E6ECFF") }, placeTexte(rangs.tous))));
}

function pageScan() {
  var p = params.get("p"), g = params.get("g");
  chargement();
  api("POST", "/api/verifier", { p: p, g: g }).then(function (r) {
    if (!r.ok) { afficher(entete(), blocErreur(messageErreur(r)), el("a", { class: "bouton second", href: "/" }, T.accueil)); return; }
    var s = r.score;
    var lienTable = "/table?cle=" + encodeURIComponent(s.table_cle) + "&pc=" + encodeURIComponent(s.pincab_id);
    afficher(entete(), carteScore(s), blocRangs(r.rangs),
      el("div", { class: "actions" }, boutonIco("podium", T.voir_classement, { class: "bouton", href: lienTable }),
        boutonIco("scores", T.accueil, { class: "bouton second", href: "/" })));
  });
}
function ligneInfo(gauche, droite) {
  return el("div", { style: "display:flex;justify-content:space-between;gap:10px;font-size:14px;background:#111A3A;border-radius:10px;padding:10px 12px" },
    el("span", { class: "doux" }, gauche), el("b", {}, droite));
}

function pageCarte() {
  var retour = params.get("retour");
  if (retour && retour.charAt(0) !== "/") retour = null;   // jamais vers un autre site
  var jeton = params.get("jeton");
  if (!jeton && location.hash.indexOf("#jeton=") === 0) {
    try { jeton = decodeURIComponent(location.hash.slice(7)); } catch (e) { jeton = ""; }
  }
  if (jeton) {
    garderCode(jeton);
    params.delete("jeton");
    var rechercheNettoyee = params.toString();
    history.replaceState(null, "", location.pathname + (rechercheNettoyee ? "?" + rechercheNettoyee : ""));
  }
  if (!codeCarte()) {
    afficher(entete(), el("div", { class: "bloc", style: "align-items:center;text-align:center" },
      ico("carte", "moyenne"), el("h1", { class: "titre", style: "font-size:22px" }, T.ma_carte),
      el("div", { class: "doux" }, T.setup_profil_aide)),
      el("a", { class: "bouton second", href: "/" }, T.accueil));
    return;
  }
  chargement();
  api("GET", "/api/carte").then(function (r) {
    if (!r.ok) { if (r.erreur === "carte_requise") { oublierCode(); pageCarte(); return; } afficher(entete(), blocErreur(messageErreur(r))); return; }
    garderInitiales(r.initiales);
    if (retour) { location.href = retour; return; }
    var liste = (r.scores || []).map(function (s) {
      return ligneScore(s.place, s.table_nom, s.pincab + " · " + date(s.ajoute), nombre(s.score),
        "/table?cle=" + encodeURIComponent(s.table_cle), false, s.table_nom);
    });
    var pseudoModifie = el("input", { value: r.pseudo, maxlength: "24", autocomplete: "nickname", "aria-label": T.pseudo_modifier });
    var retourPseudo = el("div", { class: "petit" });
    var formPseudo = el("div", { class: "bloc" },
      el("div", { class: "champ" }, el("label", {}, T.pseudo_modifier), pseudoModifie), retourPseudo,
      el("button", { type: "button", class: "second", onclick: function () {
        api("POST", "/api/carte/pseudo", { pseudo: pseudoModifie.value }).then(function (x) {
          if (!x.ok) { retourPseudo.textContent = messageErreur(x); return; }
          retourPseudo.textContent = T.pseudo_enregistre;
          setTimeout(function () { location.reload(); }, 500);
        });
      } }, T.pseudo_modifier));
    var zoneLiens = el("div", { class: "bloc" }, el("b", {}, T.liee_a));
    if (!r.pincabs.length) ajouter(zoneLiens, el("div", { class: "petit" }, T.aucun_pincab));
    (r.pincabs || []).forEach(function (pc) {
      ajouter(zoneLiens, el("div", { class: "ligne" }, el("div", { class: "milieu" }, el("b", {}, pc.nom),
        el("span", { class: "petit" }, pc.initiales || "")),
        el("button", { type: "button", class: "second", style: "width:auto;padding:9px 12px",
          onclick: function () {
            if (!confirm(T.delier_confirme)) return;
            api("POST", "/api/lien/delier", { pincab_id: pc.id }).then(function (x) {
              if (x.ok) location.reload(); else alert(messageErreur(x));
            });
          } }, T.delier)));
    });
    var actionCompte = el("button", { type: "button", class: "second", onclick: function () {
      if (!confirm(T.compte_supprimer_confirme)) return;
      api("POST", "/api/carte/supprimer", {}).then(function (x) {
        if (!x.ok) { alert(messageErreur(x)); return; }
        oublierCode();
        alert(T.compte_supprime);
        location.href = "/";
      });
    } }, T.compte_supprimer);
    var nomsRealisations = {
      premier_score: LANGUE === "fr" ? "Premier score" : "First score",
      cinq_tables: LANGUE === "fr" ? "Explorateur · 5 tables" : "Explorer · 5 tables",
      dix_tables: LANGUE === "fr" ? "Collectionneur · 10 tables" : "Collector · 10 tables",
      premier_podium: LANGUE === "fr" ? "Premier podium" : "First podium",
      premier_record: LANGUE === "fr" ? "Premier record" : "First record",
      cent_scores: LANGUE === "fr" ? "Cent scores" : "One hundred scores"
    };
    var realisations = (r.realisations || []).map(function (x) {
      return el("span", { class: "badge", style: "margin:3px" }, ico("trophee", "petite"), nomsRealisations[x.cle] || x.cle);
    });
    afficher(entete(),
      el("h1", { class: "titre", style: "font-size:22px" }, T.carte_titre),
      // NOUVEAU : tout ce qui est dans le cadre de la carte a son reflet (effet miroir)
      el("div", { class: "carte-joueur" }, el("div", {},
        el("div", { style: "display:flex;justify-content:space-between;align-items:flex-start;gap:10px" },
          el("div", {}, mt(el("div", { class: "section", style: "margin:0 0 .62em" }, "PINCABOS")), mt(el("div", { style: "font-weight:800;font-size:20px" }, r.pseudo))),
          mt(el("div", { class: "ini" }, r.initiales))),
        el("div", { class: "trois" },
          el("div", {}, mi(ico("trophee", "moyenne")), mt(el("div", { class: "grand", style: "color:#FFE27A" }, String(r.stats.records))), mt(el("div", { class: "petit" }, T.records))),
          el("div", {}, mi(ico("podium", "moyenne")), mt(el("div", { class: "grand", style: "color:#FFC83D" }, String(r.stats.podiums))), mt(el("div", { class: "petit" }, T.podiums))),
          el("div", {}, mi(ico("meilleur-score", "moyenne")), mt(el("div", { class: "grand", style: "color:#FFB347" }, String(r.stats.scores))), mt(el("div", { class: "petit" }, T.scores)))),
        el("div", { class: "petit avec-ico", style: "justify-content:flex-start;gap:6px" }, mi(ico("table", "petite")), mt(el("span", {}, r.pincabs.length ? T.liee_a + " : " + r.pincabs.map(function (x) { return x.nom; }).join(", ") : T.aucun_pincab))))),
      formPseudo, zoneLiens,
      el("div", { class: "bloc" }, el("b", {}, T.realisations),
        realisations.length ? el("div", {}, realisations) : el("div", { class: "petit" }, T.aucun_succes)),
      el("div", { class: "section" }, T.mes_scores),
      liste.length ? el("div", { class: "liste" }, liste) : el("div", { class: "vide" }, T.aucun),
      el("div", { class: "actions" }, actionCompte,
        el("button", { type: "button", class: "second", onclick: function () {
          if (confirm(T.deconnexion_confirme)) { oublierCode(); location.href = "/"; }
        } }, T.deconnexion)));
  });
}
function formaterCode(c) { return (c || "").replace(/[^A-Z0-9]/gi, "").toUpperCase().replace(/(.{4})(?=.)/g, "$1-"); }

function formulaireCreation(retour) {
  var pseudo = el("input", { id: "pseudo", maxlength: "24", autocomplete: "nickname" });
  var ini = el("input", { id: "ini", maxlength: "3", autocapitalize: "characters", style: "font-family:Anton,Impact,sans-serif;font-size:24px;letter-spacing:4px;text-transform:uppercase" });
  var zoneErreur = el("div", {});
  var bouton = el("button", { type: "submit", class: "avec-ico" }, ico("carte"), el("span", {}, T.creer));
  var form = el("form", { class: "bloc" },
    el("h1", { class: "titre", style: "font-size:24px" }, T.creer_titre), el("div", { class: "doux" }, T.creer_texte),
    el("div", { class: "champ" }, el("label", { for: "pseudo" }, T.pseudo), pseudo),
    el("div", { class: "champ" }, el("label", { for: "ini" }, T.initiales), ini), zoneErreur, bouton);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    bouton.disabled = true;
    api("POST", "/api/carte", { pseudo: pseudo.value, initiales: ini.value }).then(function (r) {
      bouton.disabled = false;
      if (!r.ok) { zoneErreur.textContent = ""; ajouter(zoneErreur, blocErreur(messageErreur(r))); return; }
      garderCode(r.code);
      garderInitiales(r.initiales);
      afficher(entete(), el("div", { class: "bloc" },
        el("h1", { class: "titre or", style: "font-size:24px" }, T.code_titre), el("div", { class: "doux" }, T.code_texte),
        el("div", { class: "code" }, r.code)),
        el("div", { class: "actions" }, boutonIco("valide", T.code_ok, { class: "bouton", href: retour || "/carte" })));
    });
  });
  afficher(entete(), form, el("a", { class: "bouton second", href: "/carte?restaurer=1" + (retour ? "&retour=" + encodeURIComponent(retour) : "") }, T.restaurer));
}

function formulaireRestaurer(retour) {
  var champ = el("input", { id: "code", autocapitalize: "characters", autocomplete: "off", style: "font-family:ui-monospace,Consolas,monospace;letter-spacing:2px;text-transform:uppercase" });
  var zoneErreur = el("div", {});
  var bouton = el("button", { type: "submit" }, T.valider);
  var form = el("form", { class: "bloc" },
    el("h1", { class: "titre", style: "font-size:24px" }, T.restaurer_titre),
    el("div", { class: "champ" }, el("label", { for: "code" }, T.code), champ), zoneErreur, bouton);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    bouton.disabled = true;
    api("POST", "/api/carte/restaurer", { code: champ.value }).then(function (r) {
      bouton.disabled = false;
      if (!r.ok) { zoneErreur.textContent = ""; ajouter(zoneErreur, blocErreur(messageErreur(r))); return; }
      garderCode(champ.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
      location.href = retour || "/carte";
    });
  });
  afficher(entete(), form);
}

function pageLier() {
  var p = params.get("p"), g = params.get("g");
  if (!codeCarte()) { location.href = "/carte?retour=" + encodeURIComponent(location.pathname + location.search); return; }
  chargement();
  api("POST", "/api/lier", { p: p, g: g }).then(function (r) {
    if (!r.ok) { afficher(entete(), el("h1", { class: "titre", style: "font-size:22px" }, T.lier_titre), blocErreur(messageErreur(r))); return; }
    if (r.initiales) garderInitiales(r.initiales);
    afficher(entete(), el("div", { class: "cadre" }, el("div", { class: "bloc" },
      ico("valide", "moyenne"),
      el("h1", { class: "titre or", style: "font-size:30px" }, r.deja ? T.lier_titre : T.lier_ok),
      el("div", { class: "doux" }, r.deja ? t("lier_deja", r.pincab) : t("lier_ok_texte", r.initiales, r.pincab, r.initiales)))),
      el("div", { class: "actions" }, boutonIco("carte", T.ma_carte, { class: "bouton", href: "/carte" })));
  });
}

function pageTable() {
  var cle = params.get("cle") || "", pc = params.get("pc") || "";
  var vue = pc ? "pincab" : "tous";
  function charger() {
    chargement();
    var url = "/api/table?cle=" + encodeURIComponent(cle) + (vue === "pincab" ? "&pc=" + encodeURIComponent(pc) : "");
    api("GET", url).then(function (r) {
      if (!r.ok) { afficher(entete(), blocErreur(messageErreur(r))); return; }
      var onglets = pc ? el("div", { class: "onglets" },
        el("button", { type: "button", class: vue === "pincab" ? "actif" : "", onclick: function () { vue = "pincab"; charger(); } }, T.sur_pincab),
        el("button", { type: "button", class: vue === "tous" ? "actif" : "", onclick: function () { vue = "tous"; charger(); } }, T.tous_pincabs)) : null;
      var lignes = (r.lignes || []).map(function (l, i) {
        return ligneScore(i + 1, l.initiales + "  " + l.pseudo, (l.pincab || "") + " · " + date(l.ajoute), nombre(l.score), null,
          window.INITIALES && l.initiales === window.INITIALES && codeCarte());
      });
      afficher(entete(),
        el("div", { style: "display:flex;align-items:center;gap:14px" }, wheel(r.table, "moyenne"),
          el("div", {}, el("h1", { class: "titre", style: "font-size:26px" }, r.table),
            el("div", { class: "petit" }, systeme(r.systeme), vue === "pincab" && r.pincab ? " · " + r.pincab : ""))),
        onglets, lignes.length ? el("div", { class: "liste" }, lignes) : el("div", { class: "vide" }, T.aucun),
        el("div", { class: "pied" }, T.donnees_qr));
    });
  }
  charger();
}

function texteSucces(realisations) {
  return (realisations || []).map(function (r) { return t("succes_" + r.cle); }).filter(function (x) { return x.indexOf("succes_") !== 0; });
}
function pageJoueurs() {
  chargement();
  api("GET", "/api/joueurs").then(function (r) {
    if (!r.ok) { afficher(entete(), blocErreur(messageErreur(r))); return; }
    var lignes = (r.joueurs || []).map(function (j, i) {
      var succes = texteSucces(j.realisations);
      return el("a", { class: "ligne", href: "/joueur?id=" + encodeURIComponent(j.carte_id) },
        el("div", { class: "rang" }, String(i + 1)),
        el("div", { class: "milieu" }, el("b", {}, j.pseudo + (j.initiales ? " · " + j.initiales : "")),
          el("span", { class: "petit" }, nombre(j.nb_records || 0) + " " + T.records + " · " + nombre(j.nb_tables || 0) + " " + T.tables_jouees),
          el("span", { class: "petit" }, succes.join(" · ") || T.aucun_succes)),
        el("div", { class: "droite" }, nombre(j.meilleur || 0)));
    });
    afficher(entete(), el("h1", { class: "titre" }, T.joueurs),
      lignes.length ? el("div", { class: "liste" }, lignes) : el("div", { class: "vide" }, T.aucun));
  });
}
function pageJoueur() {
  var id = params.get("id") || "";
  chargement();
  api("GET", "/api/joueur?id=" + encodeURIComponent(id)).then(function (r) {
    if (!r.ok) { afficher(entete(), blocErreur(messageErreur(r))); return; }
    var succes = texteSucces(r.realisations);
    var scores = (r.tables || []).map(function (x, i) {
      return ligneScore(x.rang, x.table_nom, (x.pincab || "") + (x.ajoute ? " · " + date(x.ajoute) : ""), nombre(x.score),
        "/table?cle=" + encodeURIComponent(x.table_cle), false, x.table_nom);
    });
    afficher(entete(),
      el("div", { class: "carte-joueur" }, el("div", {}, el("div", { class: "ini" }, r.initiales || "★"),
        el("h1", { class: "titre" }, r.pseudo),
        el("div", { class: "trois" },
          el("div", {}, el("div", { class: "grand" }, nombre(r.stats.scores)), el("div", { class: "petit" }, T.scores)),
          el("div", {}, el("div", { class: "grand" }, nombre(r.stats.tables)), el("div", { class: "petit" }, T.tables_jouees)),
          el("div", {}, el("div", { class: "grand" }, nombre(r.stats.records)), el("div", { class: "petit" }, T.records))))),
      el("div", { class: "bloc" }, el("b", {}, T.realisations),
        succes.length ? el("div", { class: "liste" }, succes.map(function (s) { return el("span", { class: "badge" }, "🏆 " + s); })) : el("span", { class: "petit" }, T.aucun_succes)),
      el("div", { class: "section" }, T.mes_scores),
      scores.length ? el("div", { class: "liste" }, scores) : el("div", { class: "vide" }, T.aucun));
  });
}

function pageAdmin() {
  var champ = el("input", { id: "cle", type: "password", autocomplete: "off", autocapitalize: "off",
                            autocorrect: "off", spellcheck: "false" });
  var zone = el("div", { class: "liste" });
  champ.addEventListener("keydown", function (ev) { if (ev.key === "Enter") charger(); });
  function charger() {
    window.CLE_ADMIN = champ.value;
    api("GET", "/api/admin/pincabs").then(function (r) {
      zone.textContent = "";
      if (!r.ok) { ajouter(zone, blocErreur(messageErreur(r))); return; }
      // NOUVEAU : confirmation visible (avant, une clé correcte avec une liste vide n'affichait rien)
      ajouter(zone, el("div", { class: "badge", style: "align-self:flex-start" }, ico("valide", "petite"), t("cle_ok", r.pincabs.length)));
      if (!r.pincabs.length) ajouter(zone, el("div", { class: "vide" }, T.aucun_pincab_admin));
      r.pincabs.forEach(function (pc) {
        function maj(approuve, bloque) { api("POST", "/api/admin/pincab", { id: pc.id, approuve: approuve, bloque: bloque }).then(charger); }
        ajouter(zone, el("div", { class: "bloc", style: "padding:12px" },
          el("b", {}, pc.nom),
          el("span", { class: "petit", style: "font-weight:800;color:" + (pc.bloque ? "#FF7A7A" : (pc.approuve ? "#67E8F9" : "#FFC83D")) },
            pc.bloque ? T.bloque : (pc.approuve ? T.valide : T.en_attente)),
          el("span", { class: "petit" }, pc.id + " · " + date(pc.cree) + " · " + pc.scores + " " + T.scores),
          el("div", { class: "deux" },
            el("button", { type: "button", class: pc.approuve ? "second" : "", onclick: function () { maj(!pc.approuve, pc.bloque); } }, pc.approuve ? T.retirer : T.approuver),
            el("button", { type: "button", class: "second", onclick: function () { maj(pc.approuve, !pc.bloque); } }, pc.bloque ? T.debloquer : T.bloquer))));
      });
    });
  }
  afficher(entete(), el("h1", { class: "titre avec-ico", style: "font-size:24px;justify-content:flex-start" }, ico("reglages", "moyenne"), T.admin),
    el("div", { class: "champ" }, el("label", { for: "cle" }, T.cle_admin), champ),
    el("button", { type: "button", onclick: charger }, T.valider), zone);
}

var ROUTES = { "/": pageAccueil, "/s": pageScan, "/carte": pageCarte, "/lier": pageLier, "/table": pageTable, "/joueurs": pageJoueurs, "/joueur": pageJoueur, "/admin": pageAdmin };
(ROUTES[location.pathname] || pageAccueil)();
})();
`;
