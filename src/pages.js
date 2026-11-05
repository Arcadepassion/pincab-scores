// =====================================================================
//  PincabOS Scores en ligne — pages du site (une seule page, rendue côté téléphone)
// =====================================================================
export const PAGE_HTML = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#070B1A">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>PincabOS Scores</title>
<link rel="manifest" href="/manifest.webmanifest">
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
.entete-droite{display:flex;align-items:center;gap:8px}
.logo,.pastille{white-space:nowrap}
@media (max-width:440px){.pastille-texte.long{display:none}.entete .pastille{padding:0 10px!important}}
.langue{position:relative}
.langue-bouton{display:flex;align-items:center;gap:4px;width:auto;min-height:44px;height:44px;padding:0 10px;border-radius:22px;
background:var(--carte2);border:1px solid var(--bord2);color:var(--texte)}
.langue-bouton .fleche{font-size:12px;color:var(--doux)}
.drapeau{width:24px;height:16px;border-radius:3px;box-shadow:0 0 0 1px rgba(255,255,255,.25);flex-shrink:0;display:block}
.langue-menu{position:absolute;top:50px;right:0;z-index:50;list-style:none;margin:0;padding:6px;min-width:190px;
background:var(--carte2);border:1px solid var(--bord2);border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.55)}
[dir=rtl] .langue-menu{right:auto;left:0}
.langue-menu[hidden]{display:none}
.langue-menu button{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:8px 10px;border-radius:10px;
background:transparent;color:var(--texte);font:600 15px Inter,system-ui,sans-serif;text-align:start}
.langue-menu button:hover,.langue-menu button.actif{background:rgba(34,211,238,.14);color:var(--cyan2)}
.retour{width:44px;min-width:44px;height:44px;min-height:44px;padding:0;border:1px solid var(--bord2);border-radius:50%;background:var(--carte2);color:var(--texte);font-size:25px;line-height:1}
.logo{font-family:Anton,Impact,sans-serif;font-size:22px;letter-spacing:1px;color:#fff;text-decoration:none}
.logo span{color:var(--cyan)}
.pastille{min-width:44px;height:44px;border-radius:22px;background:var(--cyan);color:var(--fond);display:flex;align-items:center;
justify-content:center;font-family:Anton,Impact,sans-serif;font-size:14px;text-decoration:none;padding:0 10px}
.titre{font-family:Anton,Impact,sans-serif;letter-spacing:1px;margin:0}
.or{color:var(--or)}.cyan{color:var(--cyan2)}.doux{color:var(--doux)}.gris{color:var(--gris)}
.bloc{background:linear-gradient(var(--carte),var(--carte)) padding-box,linear-gradient(120deg,#FF3DA6,#FFC83D,#22D3EE,#7C5CFF) border-box;
background-size:auto,300% 300%;border:1px solid transparent;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px}
.cadre{border-radius:18px;padding:2px;background:linear-gradient(120deg,#FF3DA6,#FFC83D,#22D3EE,#7C5CFF)}
.cadre>.bloc{border:none;border-radius:16px;align-items:center;text-align:center;background:linear-gradient(160deg,#0B1230,#0B1230)}
.score{font-family:Anton,Impact,sans-serif;font-size:42px;color:var(--or);letter-spacing:1px;text-shadow:0 0 14px rgba(255,138,0,.55);
line-height:1.1;word-break:break-all}
.badge{display:inline-flex;align-items:center;gap:6px;border-radius:20px;padding:6px 14px;font-weight:800;font-size:13px;
background:rgba(34,211,238,.12);color:var(--cyan2)}
.badge.alerte{background:rgba(255,200,61,.14);color:var(--or)}
.badge.erreur{background:rgba(255,122,122,.14);color:var(--rouge)}
.deux{display:flex;gap:10px;width:100%}
.deux>div{flex:1;background:var(--carte2);border-radius:12px;padding:10px;text-align:center}
.petit{font-size:12px;color:var(--doux)}
.grand{font-family:Anton,Impact,sans-serif;font-size:26px}.grand.m-txt{line-height:1}
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
.ligne.score-rgb{border:1px solid transparent;background:linear-gradient(var(--carte),var(--carte)) padding-box,
linear-gradient(120deg,#FF3DA6,#FFC83D,#22D3EE,#7C5CFF) border-box;background-size:auto,300% 300%}
.ligne.score-rgb.moi{background:linear-gradient(rgba(34,211,238,.10),rgba(34,211,238,.10)) padding-box,
linear-gradient(120deg,#FF3DA6,#FFC83D,#22D3EE,#7C5CFF) border-box;background-size:auto,300% 300%}
.rang{width:34px;font-family:Anton,Impact,sans-serif;font-size:22px;text-align:center;flex-shrink:0}
.milieu{flex:1;min-width:0;display:flex;flex-direction:column}
.milieu b{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.droite{font-family:Anton,Impact,sans-serif;font-size:17px;color:var(--or);text-align:right}
.onglets{display:flex;background:var(--carte2);border-radius:14px;padding:4px;gap:4px}
.onglets button{flex:1;background:transparent;color:var(--doux);padding:11px;font-size:14px;min-height:44px}
.onglets button.actif{background:var(--cyan);color:var(--fond)}
.code{font-family:ui-monospace,Consolas,monospace;font-size:22px;letter-spacing:2px;color:var(--or);background:var(--carte2);
border-radius:12px;padding:14px;text-align:center;word-break:break-all;user-select:all}
.carte-joueur{border-radius:20px;padding:2px;background:linear-gradient(135deg,#22D3EE,#7C5CFF 45%,#FF3DA6,#FFC83D);background-size:300% 300%}
.carte-joueur>div{border-radius:18px;background:linear-gradient(160deg,#13204D,#0A1029 70%);padding:18px;display:flex;flex-direction:column;gap:14px}
.ini{font-family:Anton,Impact,sans-serif;font-size:40px;color:var(--cyan2);text-shadow:0 0 16px rgba(34,211,238,.6);letter-spacing:2px;line-height:1}
.ini.m-txt{margin-bottom:.62em}
.ini.m-txt::after{margin-top:-.12em;transform:scaleY(-1);transform-origin:center}
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
.m-txt{position:relative;margin-bottom:.34em}
span.m-txt{display:inline-block}
.m-txt::after{content:attr(data-m);position:absolute;left:0;right:0;top:100%;margin-top:-.4em;transform:scaleY(-.55) translateY(-100%);transform-origin:top;
pointer-events:none;text-shadow:none;opacity:.9;
-webkit-mask-image:linear-gradient(to top,rgba(0,0,0,.42),rgba(0,0,0,0) 78%);mask-image:linear-gradient(to top,rgba(0,0,0,.42),rgba(0,0,0,0) 78%)}
.m-img{position:relative;display:inline-block;line-height:0;margin-bottom:13px;vertical-align:middle}
.m-img.p{margin-bottom:7px}.hero .m-img{margin-bottom:64px}
.m-img>.m-reflet{position:absolute;left:0;top:100%;margin-top:1px;transform:scaleY(-1);pointer-events:none;filter:none;
-webkit-mask-image:linear-gradient(to top,rgba(0,0,0,.4),rgba(0,0,0,0) 45%);mask-image:linear-gradient(to top,rgba(0,0,0,.4),rgba(0,0,0,0) 45%)}
@media (prefers-reduced-motion:no-preference){.cadre,.carte-joueur{animation:tourne 6s linear infinite}
.bloc,.ligne.score-rgb{animation:tourne-bord 6s linear infinite}.cadre>.bloc{animation:none}
@keyframes tourne{0%{background-position:0 50%}50%{background-position:100% 50%}100%{background-position:0 50%}}
@keyframes tourne-bord{0%{background-position:0 0,0 50%}50%{background-position:0 0,100% 50%}100%{background-position:0 0,0 50%}}}
`;

export const APP_JS = `
"use strict";
(function () {
// NOUVEAU : le site en 10 langues (les mêmes que PincabOS) ; français par défaut, choix gardé sur le téléphone
var TEXTES = {
 "fr": {
  "accueil": "Accueil",
  "ma_carte": "Ma carte",
  "chargement": "Chargement…",
  "erreur_reseau": "Connexion impossible. Réessaie.",
  "recherche": "Chercher une table",
  "pincabs": "Pincabs",
  "joueurs": "Joueurs",
  "scores": "Scores",
  "derniers": "DERNIERS SCORES",
  "aucun": "Aucun score pour l'instant.",
  "record": "RECORD",
  "top": "TOP {}",
  "score_ajoute": "SCORE AJOUTÉ À TA CARTE",
  "nouveau_record": "NOUVEAU RECORD !",
  "ton_score": "TON SCORE",
  "sur_pincab": "Sur ce pincab",
  "tous_pincabs": "Tous les pincabs",
  "place": "{}e",
  "place1": "1er",
  "voir_classement": "Voir le classement de la table",
  "confirmer": "Mettre mon score en ligne",
  "confirmer_aide": "Ce score apparaîtra dans le classement en ligne avec ta carte {}.",
  "deja_titre": "CE SCORE EST DÉJÀ EN LIGNE",
  "deja_texte": "Ce QR code a déjà été scanné. Chaque score ne compte qu'une seule fois.",
  "ajoute_par": "Ajouté par",
  "le": "Le",
  "table": "Table",
  "score": "Score",
  "pas_toi": "Ce n'est pas toi ? Seule la carte liée au joueur du pincab peut récupérer un score.",
  "besoin_carte": "Pour mettre ce score en ligne, il te faut une carte joueur (gratuite, sans e-mail).",
  "creer_carte": "Créer ma carte joueur",
  "restaurer": "J'ai déjà une carte",
  "non_liee_titre": "TA CARTE N'EST PAS LIÉE À CE PINCAB",
  "non_liee_texte": "Sur le pincab : Tableau des scores > Joueurs > Lier une carte, puis scanne le QR code affiché. À faire une seule fois.",
  "initiales_diff": "Ce score a été fait avec les initiales {}, ta carte a les initiales {}. Seule la carte {} de ce pincab peut le récupérer.",
  "sans_initiales": "Ce score n'a pas d'initiales : il ne peut pas être mis en ligne.",
  "erreurs": {
   "qr_illisible": "Ce QR code n'est pas un QR PincabOS valide.",
   "signature_invalide": "QR code refusé : il n'a pas été créé par un pincab PincabOS.",
   "pincab_inconnu": "Ce pincab n'est pas enregistré.",
   "pincab_bloque": "Ce pincab ne peut plus envoyer de scores.",
   "qr_mauvais_type": "Ce n'est pas le bon type de QR code.",
   "qr_expire": "Ce QR code a expiré : affiches-en un nouveau sur le pincab.",
   "score_invalide": "Score invalide.",
   "table_invalide": "Table invalide.",
   "duree_invalide": "Durée de partie invalide.",
   "carte_requise": "Carte joueur nécessaire.",
   "initiales_prises": "Les initiales {} sont déjà utilisées par une autre carte sur ce pincab. Crée une carte avec d'autres initiales.",
   "deja_en_ligne": "Ce score est déjà en ligne.",
   "code_inconnu": "Code inconnu. Vérifie-le et réessaie.",
   "pseudo_invalide": "Pseudo trop court (2 caractères minimum).",
   "pseudo_deja_pris": "Ce pseudo est déjà utilisé par un autre joueur : choisissez-en un autre.",
   "initiales_invalides": "Initiales invalides (1 à 3 lettres ou chiffres).",
   "trop_de_demandes": "Trop de demandes depuis cette connexion. Réessaie demain.",
   "erreur_serveur": "Erreur du serveur. Réessaie plus tard.",
   "acces_refuse": "Clé d'administration incorrecte (attention aux majuscules ajoutées par le clavier du téléphone).",
   "introuvable": "Page introuvable.",
   "requete_invalide": "Demande invalide.",
   "abonnement_invalide": "Abonnement de notification invalide.",
   "limite_appareils": "Cette carte est déjà activée sur cinq appareils."
  },
  "carte_titre": "MA CARTE JOUEUR",
  "creer_titre": "CRÉER MA CARTE JOUEUR",
  "creer_texte": "Ta carte garde tous tes scores. Pas d'e-mail ni de mot de passe : seulement un code de secours.",
  "pseudo": "Pseudo",
  "initiales": "Initiales (les mêmes que sur le pincab)",
  "creer": "Créer ma carte",
  "code_titre": "TON CODE DE SECOURS",
  "code_texte": "Note-le ou prends-le en photo : c'est le seul moyen de retrouver ta carte sur un autre téléphone. Ne le donne à personne.",
  "code_ok": "J'ai noté mon code",
  "restaurer_titre": "RETROUVER MA CARTE",
  "code": "Code de secours",
  "valider": "Valider",
  "records": "Records",
  "podiums": "Podiums",
  "liee_a": "Liée à",
  "aucun_pincab": "Pas encore liée à un pincab",
  "mes_scores": "MES SCORES",
  "voir_code": "Afficher mon code de secours",
  "oublier": "Retirer la carte de ce téléphone",
  "oublier_confirm": "Retirer la carte de ce téléphone ? Garde bien ton code de secours pour la retrouver.",
  "lier_titre": "LIER MA CARTE À CE PINCAB",
  "lier_ok": "CARTE LIÉE !",
  "lier_ok_texte": "Ta carte {} est liée à « {} ». Tes prochains scores avec les initiales {} pourront être mis en ligne.",
  "lier_deja": "Ta carte est déjà liée à « {} ».",
  "retour": "Retour",
  "joueur": "JOUEUR",
  "retour_page": "Retour à la page précédente",
  "pseudo_modifier": "Modifier le pseudo",
  "pseudo_enregistre": "Pseudo enregistré.",
  "delier": "Délier",
  "delier_confirme": "Délier ce pincab ? Les anciens scores restent dans les classements.",
  "compte_supprimer": "Supprimer mon compte",
  "compte_supprimer_confirme": "Supprimer ce compte ? Le pseudo sera libéré et les scores resteront anonymisés dans les classements. Cette action est définitive.",
  "compte_supprime": "Compte supprimé. Les scores conservés dans les classements sont anonymisés.",
  "setup_profil_aide": "Crée ton profil dans le Setup du pincab, puis scanne le QR de connexion affiché dans ses réglages.",
  "deconnexion": "Déconnecter ce téléphone",
  "deconnexion_confirme": "Déconnecter ce téléphone ? Le profil et les scores ne seront pas supprimés.",
  "realisations": "SUCCÈS",
  "aucun_succes": "Continue à jouer pour débloquer tes premiers succès.",
  "voir_joueurs": "Voir les joueurs et leurs succès",
  "meilleur_score": "Meilleur score",
  "tables_jouees": "Tables jouées",
  "temps_cumule": "Temps de jeu cumulé sur cette table",
  "duree_partie": "Durée de la partie :",
  "secondes": "s",
  "joueurs_avec_score": "Joueurs avec un score en ligne",
  "aucun_joueur_identifie": "Aucun joueur identifié par un score partagé",
  "push_titre": "Alertes de gros scores",
  "push_aide": "Reçois une notification lorsqu’un joueur établit un record en ligne ou entre dans le Top 3.",
  "push_activer": "Activer les notifications sur ce téléphone",
  "push_desactiver": "Désactiver les notifications sur ce téléphone",
  "push_active": "Les notifications sont activées sur ce téléphone.",
  "push_inactive": "Les notifications ne sont pas activées sur ce téléphone.",
  "push_non_supporte": "Les notifications ne sont pas disponibles dans ce navigateur. Sur iPhone, ajoute d’abord le site à l’écran d’accueil.",
  "push_refuse": "Autorisation refusée. Modifie les réglages de notifications du navigateur pour les activer.",
  "push_erreur": "Impossible d’activer les notifications. Vérifie la connexion et réessaie.",
  "succes_premier_score": "Premier score",
  "succes_cinq_tables": "5 tables jouées",
  "succes_dix_tables": "10 tables jouées",
  "succes_premier_podium": "Premier podium",
  "succes_premier_record": "Premier record",
  "succes_cent_scores": "100 scores",
  "temps_jeu": "Temps de jeu partagé",
  "temps_par_table": "TEMPS DE JEU PAR TABLE",
  "heures": "h",
  "minutes": "min",
  "donnees_qr": "Seuls les scores scannés depuis un pincab PincabOS apparaissent ici.",
  "admin": "Administration",
  "cle_admin": "Clé d'administration",
  "approuver": "Valider",
  "bloquer": "Bloquer",
  "debloquer": "Débloquer",
  "retirer": "Retirer",
  "cle_ok": "Clé acceptée : {} pincab(s) enregistré(s).",
  "aucun_pincab_admin": "Aucun pincab enregistré pour l'instant.",
  "en_attente": "En attente de validation",
  "valide": "Validé",
  "bloque": "Bloqué",
  "langue": "Langue",
  "suspects_titre": "SCORES EN VÉRIFICATION",
  "suspects_aide": "Scores mis de côté par la vérification automatique. Accepter : le score entre dans les classements. Refuser : il est supprimé.",
  "aucun_suspect": "Aucun score en vérification.",
  "accepter": "Accepter",
  "refuser": "Refuser",
  "record_actuel": "Record actuel : {}",
  "duree": "Durée : {}",
  "raisons": {
   "pincab_surveille": "Pincab sous surveillance (plusieurs scores en attente)",
   "date_future": "Date de partie dans le futur",
   "partie_trop_courte": "Partie trop courte",
   "partie_trop_longue": "Partie trop longue",
   "trop_de_scores": "Trop de scores en peu de temps",
   "score_anormal": "Score anormalement élevé pour cette table",
   "score_trop_rapide": "Trop de points par seconde pour cette table"
  }
 },
 "en": {
  "accueil": "Home",
  "ma_carte": "My card",
  "chargement": "Loading…",
  "erreur_reseau": "Connection failed. Try again.",
  "recherche": "Search a table",
  "pincabs": "Pincabs",
  "joueurs": "Players",
  "scores": "Scores",
  "derniers": "LATEST SCORES",
  "aucun": "No scores yet.",
  "record": "RECORD",
  "top": "TOP {}",
  "score_ajoute": "SCORE ADDED TO YOUR CARD",
  "nouveau_record": "NEW RECORD!",
  "ton_score": "YOUR SCORE",
  "sur_pincab": "On this pincab",
  "tous_pincabs": "All pincabs",
  "place": "#{}",
  "place1": "#1",
  "voir_classement": "See the table leaderboard",
  "confirmer": "Put my score online",
  "confirmer_aide": "This score will appear in the online leaderboard with your card {}.",
  "deja_titre": "THIS SCORE IS ALREADY ONLINE",
  "deja_texte": "This QR code has already been scanned. Each score only counts once.",
  "ajoute_par": "Added by",
  "le": "On",
  "table": "Table",
  "score": "Score",
  "pas_toi": "Not you? Only the card linked to the pincab player can claim a score.",
  "besoin_carte": "To put this score online you need a player card (free, no e-mail).",
  "creer_carte": "Create my player card",
  "restaurer": "I already have a card",
  "non_liee_titre": "YOUR CARD IS NOT LINKED TO THIS PINCAB",
  "non_liee_texte": "On the pincab: Scoreboard > Players > Link a card, then scan the QR code shown. Only once.",
  "initiales_diff": "This score was made with the initials {}, your card has the initials {}. Only card {} of this pincab can claim it.",
  "sans_initiales": "This score has no initials: it cannot be put online.",
  "erreurs": {
   "qr_illisible": "This is not a valid PincabOS QR code.",
   "signature_invalide": "QR code refused: it was not created by a PincabOS pincab.",
   "pincab_inconnu": "This pincab is not registered.",
   "pincab_bloque": "This pincab can no longer send scores.",
   "qr_mauvais_type": "Wrong type of QR code.",
   "qr_expire": "This QR code has expired: show a new one on the pincab.",
   "score_invalide": "Invalid score.",
   "table_invalide": "Invalid table.",
   "duree_invalide": "Invalid game duration.",
   "carte_requise": "Player card required.",
   "initiales_prises": "The initials {} are already used by another card on this pincab. Create a card with other initials.",
   "deja_en_ligne": "This score is already online.",
   "code_inconnu": "Unknown code. Check it and try again.",
   "pseudo_invalide": "Nickname too short (2 characters minimum).",
   "pseudo_deja_pris": "This nickname is already used by another player: choose another one.",
   "initiales_invalides": "Invalid initials (1 to 3 letters or digits).",
   "trop_de_demandes": "Too many requests from this connection. Try again tomorrow.",
   "erreur_serveur": "Server error. Try again later.",
   "acces_refuse": "Wrong admin key (watch out for capital letters added by the phone keyboard).",
   "introuvable": "Page not found.",
   "requete_invalide": "Invalid request.",
   "abonnement_invalide": "Invalid notification subscription.",
   "limite_appareils": "This card is already enabled on five devices."
  },
  "carte_titre": "MY PLAYER CARD",
  "creer_titre": "CREATE MY PLAYER CARD",
  "creer_texte": "Your card keeps all your scores. No e-mail or password: just a recovery code.",
  "pseudo": "Nickname",
  "initiales": "Initials (the same as on the pincab)",
  "creer": "Create my card",
  "code_titre": "YOUR RECOVERY CODE",
  "code_texte": "Write it down or take a photo: it is the only way to get your card back on another phone. Never share it.",
  "code_ok": "I saved my code",
  "restaurer_titre": "RECOVER MY CARD",
  "code": "Recovery code",
  "valider": "Confirm",
  "records": "Records",
  "podiums": "Podiums",
  "liee_a": "Linked to",
  "aucun_pincab": "Not linked to a pincab yet",
  "mes_scores": "MY SCORES",
  "voir_code": "Show my recovery code",
  "oublier": "Remove the card from this phone",
  "oublier_confirm": "Remove the card from this phone? Keep your recovery code to get it back.",
  "lier_titre": "LINK MY CARD TO THIS PINCAB",
  "lier_ok": "CARD LINKED!",
  "lier_ok_texte": "Your card {} is linked to “{}”. Your next scores with the initials {} can be put online.",
  "lier_deja": "Your card is already linked to “{}”.",
  "retour": "Back",
  "joueur": "PLAYER",
  "retour_page": "Back to the previous page",
  "pseudo_modifier": "Change nickname",
  "pseudo_enregistre": "Nickname saved.",
  "delier": "Unlink",
  "delier_confirme": "Unlink this pincab? Existing scores stay in the leaderboards.",
  "compte_supprimer": "Delete my account",
  "compte_supprimer_confirme": "Delete this account? The nickname will be released and scores will remain anonymized in the leaderboards. This cannot be undone.",
  "compte_supprime": "Account deleted. Scores retained in leaderboards are anonymized.",
  "setup_profil_aide": "Create your profile in the pincab Setup, then scan the sign-in QR shown in its settings.",
  "deconnexion": "Sign out on this phone",
  "deconnexion_confirme": "Sign out on this phone? Your profile and scores will not be deleted.",
  "realisations": "ACHIEVEMENTS",
  "aucun_succes": "Keep playing to unlock your first achievements.",
  "voir_joueurs": "See players and achievements",
  "meilleur_score": "Best score",
  "tables_jouees": "Tables played",
  "temps_cumule": "Total play time on this table",
  "duree_partie": "Game duration:",
  "secondes": "sec",
  "joueurs_avec_score": "Players with an online score",
  "aucun_joueur_identifie": "No player identified by a shared score",
  "push_titre": "High-score alerts",
  "push_aide": "Get notified when a player sets a new online record or reaches the Top 3.",
  "push_activer": "Enable notifications on this phone",
  "push_desactiver": "Disable notifications on this phone",
  "push_active": "Notifications are enabled on this phone.",
  "push_inactive": "Notifications are not enabled on this phone.",
  "push_non_supporte": "Notifications are unavailable in this browser. On iPhone, first add the site to your Home Screen.",
  "push_refuse": "Permission denied. Change your browser's notification settings to enable them.",
  "push_erreur": "Could not enable notifications. Check your connection and try again.",
  "succes_premier_score": "First score",
  "succes_cinq_tables": "5 tables played",
  "succes_dix_tables": "10 tables played",
  "succes_premier_podium": "First podium",
  "succes_premier_record": "First record",
  "succes_cent_scores": "100 scores",
  "temps_jeu": "Shared play time",
  "temps_par_table": "PLAY TIME BY TABLE",
  "heures": "h",
  "minutes": "min",
  "donnees_qr": "Only scores scanned from a PincabOS pincab appear here.",
  "admin": "Administration",
  "cle_admin": "Admin key",
  "approuver": "Approve",
  "bloquer": "Block",
  "debloquer": "Unblock",
  "retirer": "Remove",
  "cle_ok": "Key accepted: {} pincab(s) registered.",
  "aucun_pincab_admin": "No pincab registered yet.",
  "en_attente": "Waiting for approval",
  "valide": "Approved",
  "bloque": "Blocked",
  "langue": "Language",
  "suspects_titre": "SCORES UNDER REVIEW",
  "suspects_aide": "Scores held back by the automatic check. Accept: the score enters the leaderboards. Reject: it is deleted.",
  "aucun_suspect": "No score under review.",
  "accepter": "Accept",
  "refuser": "Reject",
  "record_actuel": "Current record: {}",
  "duree": "Length: {}",
  "raisons": {
   "pincab_surveille": "Pincab under watch (several scores pending)",
   "date_future": "Game date in the future",
   "partie_trop_courte": "Game too short",
   "partie_trop_longue": "Game too long",
   "trop_de_scores": "Too many scores in a short time",
   "score_anormal": "Abnormally high score for this table",
   "score_trop_rapide": "Too many points per second for this table"
  }
 },
 "es": {
  "accueil": "Inicio",
  "ma_carte": "Mi tarjeta",
  "chargement": "Cargando…",
  "erreur_reseau": "Sin conexión. Inténtalo de nuevo.",
  "recherche": "Buscar una mesa",
  "pincabs": "Pincabs",
  "joueurs": "Jugadores",
  "scores": "Puntuaciones",
  "derniers": "ÚLTIMAS PUNTUACIONES",
  "aucun": "Todavía no hay puntuaciones.",
  "record": "RÉCORD",
  "top": "TOP {}",
  "score_ajoute": "PUNTUACIÓN AÑADIDA A TU TARJETA",
  "nouveau_record": "¡NUEVO RÉCORD!",
  "ton_score": "TU PUNTUACIÓN",
  "sur_pincab": "En este pincab",
  "tous_pincabs": "Todos los pincabs",
  "place": "{}.º",
  "place1": "1.º",
  "voir_classement": "Ver la clasificación de la mesa",
  "confirmer": "Poner mi puntuación en línea",
  "confirmer_aide": "Esta puntuación aparecerá en la clasificación en línea con tu tarjeta {}.",
  "deja_titre": "ESTA PUNTUACIÓN YA ESTÁ EN LÍNEA",
  "deja_texte": "Este código QR ya se ha escaneado. Cada puntuación solo cuenta una vez.",
  "ajoute_par": "Añadida por",
  "le": "El",
  "table": "Mesa",
  "score": "Puntuación",
  "pas_toi": "¿No eres tú? Solo la tarjeta vinculada al jugador del pincab puede recuperar una puntuación.",
  "besoin_carte": "Para poner esta puntuación en línea necesitas una tarjeta de jugador (gratis, sin e-mail).",
  "creer_carte": "Crear mi tarjeta de jugador",
  "restaurer": "Ya tengo una tarjeta",
  "non_liee_titre": "TU TARJETA NO ESTÁ VINCULADA A ESTE PINCAB",
  "non_liee_texte": "En el pincab: Tabla de puntuaciones > En línea > Vincular un perfil, y escanea el código QR mostrado. Solo una vez.",
  "initiales_diff": "Esta puntuación se hizo con las iniciales {}, tu tarjeta tiene las iniciales {}. Solo la tarjeta {} de este pincab puede recuperarla.",
  "sans_initiales": "Esta puntuación no tiene iniciales: no se puede poner en línea.",
  "erreurs": {
   "qr_illisible": "Este código QR no es un QR PincabOS válido.",
   "signature_invalide": "Código QR rechazado: no lo ha creado un pincab PincabOS.",
   "pincab_inconnu": "Este pincab no está registrado.",
   "pincab_bloque": "Este pincab ya no puede enviar puntuaciones.",
   "qr_mauvais_type": "No es el tipo de código QR correcto.",
   "qr_expire": "Este código QR ha caducado: muestra uno nuevo en el pincab.",
   "score_invalide": "Puntuación no válida.",
   "table_invalide": "Mesa no válida.",
   "duree_invalide": "Duración de partida no válida.",
   "carte_requise": "Se necesita una tarjeta de jugador.",
   "initiales_prises": "Las iniciales {} ya las usa otra tarjeta en este pincab. Crea una tarjeta con otras iniciales.",
   "deja_en_ligne": "Esta puntuación ya está en línea.",
   "code_inconnu": "Código desconocido. Compruébalo e inténtalo de nuevo.",
   "pseudo_invalide": "Seudónimo demasiado corto (mínimo 2 caracteres).",
   "pseudo_deja_pris": "Este seudónimo ya lo usa otro jugador: elige otro.",
   "initiales_invalides": "Iniciales no válidas (1 a 3 letras o cifras).",
   "trop_de_demandes": "Demasiadas solicitudes desde esta conexión. Inténtalo mañana.",
   "erreur_serveur": "Error del servidor. Inténtalo más tarde.",
   "acces_refuse": "Clave de administración incorrecta (cuidado con las mayúsculas que añade el teclado del teléfono).",
   "introuvable": "Página no encontrada.",
   "requete_invalide": "Solicitud no válida.",
   "abonnement_invalide": "Suscripción de notificaciones no válida.",
   "limite_appareils": "Esta tarjeta ya está activada en cinco dispositivos."
  },
  "carte_titre": "MI TARJETA DE JUGADOR",
  "creer_titre": "CREAR MI TARJETA DE JUGADOR",
  "creer_texte": "Tu tarjeta guarda todas tus puntuaciones. Sin e-mail ni contraseña: solo un código de recuperación.",
  "pseudo": "Seudónimo",
  "initiales": "Iniciales (las mismas que en el pincab)",
  "creer": "Crear mi tarjeta",
  "code_titre": "TU CÓDIGO DE RECUPERACIÓN",
  "code_texte": "Anótalo o hazle una foto: es la única forma de recuperar tu tarjeta en otro teléfono. No se lo des a nadie.",
  "code_ok": "He anotado mi código",
  "restaurer_titre": "RECUPERAR MI TARJETA",
  "code": "Código de recuperación",
  "valider": "Validar",
  "records": "Récords",
  "podiums": "Podios",
  "liee_a": "Vinculada a",
  "aucun_pincab": "Aún no vinculada a ningún pincab",
  "mes_scores": "MIS PUNTUACIONES",
  "voir_code": "Mostrar mi código de recuperación",
  "oublier": "Quitar la tarjeta de este teléfono",
  "oublier_confirm": "¿Quitar la tarjeta de este teléfono? Guarda bien tu código de recuperación para recuperarla.",
  "lier_titre": "VINCULAR MI TARJETA A ESTE PINCAB",
  "lier_ok": "¡TARJETA VINCULADA!",
  "lier_ok_texte": "Tu tarjeta {} está vinculada a «{}». Tus próximas puntuaciones con las iniciales {} podrán ponerse en línea.",
  "lier_deja": "Tu tarjeta ya está vinculada a «{}».",
  "retour": "Volver",
  "joueur": "JUGADOR",
  "retour_page": "Volver a la página anterior",
  "pseudo_modifier": "Cambiar el seudónimo",
  "pseudo_enregistre": "Seudónimo guardado.",
  "delier": "Desvincular",
  "delier_confirme": "¿Desvincular este pincab? Las puntuaciones anteriores siguen en las clasificaciones.",
  "compte_supprimer": "Borrar mi cuenta",
  "compte_supprimer_confirme": "¿Borrar esta cuenta? El seudónimo quedará libre y las puntuaciones seguirán anonimizadas en las clasificaciones. Esta acción es definitiva.",
  "compte_supprime": "Cuenta borrada. Las puntuaciones que quedan en las clasificaciones están anonimizadas.",
  "setup_profil_aide": "Crea tu perfil en el Setup del pincab y escanea el QR de conexión que aparece en sus ajustes.",
  "deconnexion": "Desconectar este teléfono",
  "deconnexion_confirme": "¿Desconectar este teléfono? El perfil y las puntuaciones no se borrarán.",
  "realisations": "LOGROS",
  "aucun_succes": "Sigue jugando para desbloquear tus primeros logros.",
  "voir_joueurs": "Ver los jugadores y sus logros",
  "meilleur_score": "Mejor puntuación",
  "tables_jouees": "Mesas jugadas",
  "temps_cumule": "Tiempo de juego acumulado en esta mesa",
  "duree_partie": "Duración de la partida:",
  "secondes": "s",
  "joueurs_avec_score": "Jugadores con una puntuación en línea",
  "aucun_joueur_identifie": "Ningún jugador identificado por una puntuación compartida",
  "push_titre": "Alertas de grandes puntuaciones",
  "push_aide": "Recibe una notificación cuando un jugador bate un récord en línea o entra en el Top 3.",
  "push_activer": "Activar las notificaciones en este teléfono",
  "push_desactiver": "Desactivar las notificaciones en este teléfono",
  "push_active": "Las notificaciones están activadas en este teléfono.",
  "push_inactive": "Las notificaciones no están activadas en este teléfono.",
  "push_non_supporte": "Las notificaciones no están disponibles en este navegador. En iPhone, añade primero el sitio a la pantalla de inicio.",
  "push_refuse": "Permiso denegado. Cambia los ajustes de notificaciones del navegador para activarlas.",
  "push_erreur": "No se pudieron activar las notificaciones. Comprueba la conexión e inténtalo de nuevo.",
  "succes_premier_score": "Primera puntuación",
  "succes_cinq_tables": "5 mesas jugadas",
  "succes_dix_tables": "10 mesas jugadas",
  "succes_premier_podium": "Primer podio",
  "succes_premier_record": "Primer récord",
  "succes_cent_scores": "100 puntuaciones",
  "temps_jeu": "Tiempo de juego compartido",
  "temps_par_table": "TIEMPO DE JUEGO POR MESA",
  "heures": "h",
  "minutes": "min",
  "donnees_qr": "Aquí solo aparecen las puntuaciones enviadas por un pincab PincabOS.",
  "admin": "Administración",
  "cle_admin": "Clave de administración",
  "approuver": "Validar",
  "bloquer": "Bloquear",
  "debloquer": "Desbloquear",
  "retirer": "Retirar",
  "cle_ok": "Clave aceptada: {} pincab(s) registrado(s).",
  "aucun_pincab_admin": "Todavía no hay ningún pincab registrado.",
  "en_attente": "Pendiente de validación",
  "valide": "Validado",
  "bloque": "Bloqueado",
  "langue": "Idioma",
  "suspects_titre": "PUNTUACIONES EN REVISIÓN",
  "suspects_aide": "Puntuaciones apartadas por la verificación automática. Aceptar: la puntuación entra en las clasificaciones. Rechazar: se borra.",
  "aucun_suspect": "Ninguna puntuación en revisión.",
  "accepter": "Aceptar",
  "refuser": "Rechazar",
  "record_actuel": "Récord actual: {}",
  "duree": "Duración: {}",
  "raisons": {
   "pincab_surveille": "Pincab bajo vigilancia (varias puntuaciones pendientes)",
   "date_future": "Fecha de partida en el futuro",
   "partie_trop_courte": "Partida demasiado corta",
   "partie_trop_longue": "Partida demasiado larga",
   "trop_de_scores": "Demasiadas puntuaciones en poco tiempo",
   "score_anormal": "Puntuación anormalmente alta para esta mesa",
   "score_trop_rapide": "Demasiados puntos por segundo para esta mesa"
  }
 },
 "it": {
  "accueil": "Home",
  "ma_carte": "La mia carta",
  "chargement": "Caricamento…",
  "erreur_reseau": "Connessione impossibile. Riprova.",
  "recherche": "Cerca un tavolo",
  "pincabs": "Pincab",
  "joueurs": "Giocatori",
  "scores": "Punteggi",
  "derniers": "ULTIMI PUNTEGGI",
  "aucun": "Ancora nessun punteggio.",
  "record": "RECORD",
  "top": "TOP {}",
  "score_ajoute": "PUNTEGGIO AGGIUNTO ALLA TUA CARTA",
  "nouveau_record": "NUOVO RECORD!",
  "ton_score": "IL TUO PUNTEGGIO",
  "sur_pincab": "Su questo pincab",
  "tous_pincabs": "Tutti i pincab",
  "place": "{}º",
  "place1": "1º",
  "voir_classement": "Vedi la classifica del tavolo",
  "confirmer": "Metti online il mio punteggio",
  "confirmer_aide": "Questo punteggio apparirà nella classifica online con la tua carta {}.",
  "deja_titre": "QUESTO PUNTEGGIO È GIÀ ONLINE",
  "deja_texte": "Questo QR code è già stato scansionato. Ogni punteggio conta una sola volta.",
  "ajoute_par": "Aggiunto da",
  "le": "Il",
  "table": "Tavolo",
  "score": "Punteggio",
  "pas_toi": "Non sei tu? Solo la carta collegata al giocatore del pincab può recuperare un punteggio.",
  "besoin_carte": "Per mettere online questo punteggio ti serve una carta giocatore (gratis, senza e-mail).",
  "creer_carte": "Crea la mia carta giocatore",
  "restaurer": "Ho già una carta",
  "non_liee_titre": "LA TUA CARTA NON È COLLEGATA A QUESTO PINCAB",
  "non_liee_texte": "Sul pincab: Tabellone punteggi > Online > Collega un profilo, poi scansiona il QR code mostrato. Una sola volta.",
  "initiales_diff": "Questo punteggio è stato fatto con le iniziali {}, la tua carta ha le iniziali {}. Solo la carta {} di questo pincab può recuperarlo.",
  "sans_initiales": "Questo punteggio non ha iniziali: non può essere messo online.",
  "erreurs": {
   "qr_illisible": "Questo QR code non è un QR PincabOS valido.",
   "signature_invalide": "QR code rifiutato: non è stato creato da un pincab PincabOS.",
   "pincab_inconnu": "Questo pincab non è registrato.",
   "pincab_bloque": "Questo pincab non può più inviare punteggi.",
   "qr_mauvais_type": "Non è il tipo di QR code giusto.",
   "qr_expire": "Questo QR code è scaduto: mostrane uno nuovo sul pincab.",
   "score_invalide": "Punteggio non valido.",
   "table_invalide": "Tavolo non valido.",
   "duree_invalide": "Durata della partita non valida.",
   "carte_requise": "Serve una carta giocatore.",
   "initiales_prises": "Le iniziali {} sono già usate da un'altra carta su questo pincab. Crea una carta con altre iniziali.",
   "deja_en_ligne": "Questo punteggio è già online.",
   "code_inconnu": "Codice sconosciuto. Controllalo e riprova.",
   "pseudo_invalide": "Pseudonimo troppo corto (minimo 2 caratteri).",
   "pseudo_deja_pris": "Questo pseudonimo è già usato da un altro giocatore: scegline un altro.",
   "initiales_invalides": "Iniziali non valide (da 1 a 3 lettere o cifre).",
   "trop_de_demandes": "Troppe richieste da questa connessione. Riprova domani.",
   "erreur_serveur": "Errore del server. Riprova più tardi.",
   "acces_refuse": "Chiave di amministrazione errata (attenzione alle maiuscole aggiunte dalla tastiera del telefono).",
   "introuvable": "Pagina non trovata.",
   "requete_invalide": "Richiesta non valida.",
   "abonnement_invalide": "Iscrizione alle notifiche non valida.",
   "limite_appareils": "Questa carta è già attiva su cinque dispositivi."
  },
  "carte_titre": "LA MIA CARTA GIOCATORE",
  "creer_titre": "CREA LA MIA CARTA GIOCATORE",
  "creer_texte": "La tua carta conserva tutti i tuoi punteggi. Niente e-mail né password: solo un codice di recupero.",
  "pseudo": "Pseudonimo",
  "initiales": "Iniziali (le stesse del pincab)",
  "creer": "Crea la mia carta",
  "code_titre": "IL TUO CODICE DI RECUPERO",
  "code_texte": "Annotalo o fotografalo: è l'unico modo per ritrovare la tua carta su un altro telefono. Non darlo a nessuno.",
  "code_ok": "Ho annotato il mio codice",
  "restaurer_titre": "RITROVA LA MIA CARTA",
  "code": "Codice di recupero",
  "valider": "Conferma",
  "records": "Record",
  "podiums": "Podi",
  "liee_a": "Collegata a",
  "aucun_pincab": "Non ancora collegata a un pincab",
  "mes_scores": "I MIEI PUNTEGGI",
  "voir_code": "Mostra il mio codice di recupero",
  "oublier": "Togli la carta da questo telefono",
  "oublier_confirm": "Togliere la carta da questo telefono? Conserva bene il codice di recupero per ritrovarla.",
  "lier_titre": "COLLEGA LA MIA CARTA A QUESTO PINCAB",
  "lier_ok": "CARTA COLLEGATA!",
  "lier_ok_texte": "La tua carta {} è collegata a «{}». I tuoi prossimi punteggi con le iniziali {} potranno andare online.",
  "lier_deja": "La tua carta è già collegata a «{}».",
  "retour": "Indietro",
  "joueur": "GIOCATORE",
  "retour_page": "Torna alla pagina precedente",
  "pseudo_modifier": "Cambia pseudonimo",
  "pseudo_enregistre": "Pseudonimo salvato.",
  "delier": "Scollega",
  "delier_confirme": "Scollegare questo pincab? I vecchi punteggi restano nelle classifiche.",
  "compte_supprimer": "Elimina il mio account",
  "compte_supprimer_confirme": "Eliminare questo account? Lo pseudonimo sarà liberato e i punteggi resteranno anonimi nelle classifiche. L'azione è definitiva.",
  "compte_supprime": "Account eliminato. I punteggi rimasti nelle classifiche sono anonimi.",
  "setup_profil_aide": "Crea il tuo profilo nel Setup del pincab, poi scansiona il QR di connessione mostrato nelle sue impostazioni.",
  "deconnexion": "Disconnetti questo telefono",
  "deconnexion_confirme": "Disconnettere questo telefono? Il profilo e i punteggi non saranno eliminati.",
  "realisations": "OBIETTIVI",
  "aucun_succes": "Continua a giocare per sbloccare i tuoi primi obiettivi.",
  "voir_joueurs": "Vedi i giocatori e i loro obiettivi",
  "meilleur_score": "Miglior punteggio",
  "tables_jouees": "Tavoli giocati",
  "temps_cumule": "Tempo di gioco totale su questo tavolo",
  "duree_partie": "Durata della partita:",
  "secondes": "s",
  "joueurs_avec_score": "Giocatori con un punteggio online",
  "aucun_joueur_identifie": "Nessun giocatore identificato da un punteggio condiviso",
  "push_titre": "Avvisi di grandi punteggi",
  "push_aide": "Ricevi una notifica quando un giocatore batte un record online o entra nella Top 3.",
  "push_activer": "Attiva le notifiche su questo telefono",
  "push_desactiver": "Disattiva le notifiche su questo telefono",
  "push_active": "Le notifiche sono attive su questo telefono.",
  "push_inactive": "Le notifiche non sono attive su questo telefono.",
  "push_non_supporte": "Le notifiche non sono disponibili in questo browser. Su iPhone, aggiungi prima il sito alla schermata Home.",
  "push_refuse": "Permesso negato. Cambia le impostazioni delle notifiche del browser per attivarle.",
  "push_erreur": "Impossibile attivare le notifiche. Controlla la connessione e riprova.",
  "succes_premier_score": "Primo punteggio",
  "succes_cinq_tables": "5 tavoli giocati",
  "succes_dix_tables": "10 tavoli giocati",
  "succes_premier_podium": "Primo podio",
  "succes_premier_record": "Primo record",
  "succes_cent_scores": "100 punteggi",
  "temps_jeu": "Tempo di gioco condiviso",
  "temps_par_table": "TEMPO DI GIOCO PER TAVOLO",
  "heures": "h",
  "minutes": "min",
  "donnees_qr": "Qui compaiono solo i punteggi inviati da un pincab PincabOS.",
  "admin": "Amministrazione",
  "cle_admin": "Chiave di amministrazione",
  "approuver": "Approva",
  "bloquer": "Blocca",
  "debloquer": "Sblocca",
  "retirer": "Ritira",
  "cle_ok": "Chiave accettata: {} pincab registrati.",
  "aucun_pincab_admin": "Ancora nessun pincab registrato.",
  "en_attente": "In attesa di approvazione",
  "valide": "Approvato",
  "bloque": "Bloccato",
  "langue": "Lingua",
  "suspects_titre": "PUNTEGGI IN VERIFICA",
  "suspects_aide": "Punteggi messi da parte dalla verifica automatica. Accetta: il punteggio entra nelle classifiche. Rifiuta: viene eliminato.",
  "aucun_suspect": "Nessun punteggio in verifica.",
  "accepter": "Accetta",
  "refuser": "Rifiuta",
  "record_actuel": "Record attuale: {}",
  "duree": "Durata: {}",
  "raisons": {
   "pincab_surveille": "Pincab sotto osservazione (diversi punteggi in attesa)",
   "date_future": "Data della partita nel futuro",
   "partie_trop_courte": "Partita troppo breve",
   "partie_trop_longue": "Partita troppo lunga",
   "trop_de_scores": "Troppi punteggi in poco tempo",
   "score_anormal": "Punteggio anormalmente alto per questo tavolo",
   "score_trop_rapide": "Troppi punti al secondo per questo tavolo"
  }
 },
 "de": {
  "accueil": "Start",
  "ma_carte": "Meine Karte",
  "chargement": "Wird geladen…",
  "erreur_reseau": "Keine Verbindung. Versuche es erneut.",
  "recherche": "Tisch suchen",
  "pincabs": "Pincabs",
  "joueurs": "Spieler",
  "scores": "Punkte",
  "derniers": "NEUESTE PUNKTE",
  "aucun": "Noch keine Punkte.",
  "record": "REKORD",
  "top": "TOP {}",
  "score_ajoute": "PUNKTE ZU DEINER KARTE HINZUGEFÜGT",
  "nouveau_record": "NEUER REKORD!",
  "ton_score": "DEINE PUNKTE",
  "sur_pincab": "Auf diesem Pincab",
  "tous_pincabs": "Alle Pincabs",
  "place": "{}.",
  "place1": "1.",
  "voir_classement": "Rangliste des Tisches ansehen",
  "confirmer": "Meine Punkte online stellen",
  "confirmer_aide": "Diese Punkte erscheinen mit deiner Karte {} in der Online-Rangliste.",
  "deja_titre": "DIESE PUNKTE SIND SCHON ONLINE",
  "deja_texte": "Dieser QR-Code wurde schon gescannt. Jeder Punktestand zählt nur einmal.",
  "ajoute_par": "Hinzugefügt von",
  "le": "Am",
  "table": "Tisch",
  "score": "Punkte",
  "pas_toi": "Das bist nicht du? Nur die mit dem Spieler des Pincabs verbundene Karte kann einen Punktestand übernehmen.",
  "besoin_carte": "Um diese Punkte online zu stellen, brauchst du eine Spielerkarte (kostenlos, ohne E-Mail).",
  "creer_carte": "Meine Spielerkarte erstellen",
  "restaurer": "Ich habe schon eine Karte",
  "non_liee_titre": "DEINE KARTE IST NICHT MIT DIESEM PINCAB VERBUNDEN",
  "non_liee_texte": "Am Pincab: Punktetafel > Online > Profil verbinden, dann den angezeigten QR-Code scannen. Nur einmal nötig.",
  "initiales_diff": "Diese Punkte wurden mit den Initialen {} erzielt, deine Karte hat die Initialen {}. Nur die Karte {} dieses Pincabs kann sie übernehmen.",
  "sans_initiales": "Diese Punkte haben keine Initialen: Sie können nicht online gestellt werden.",
  "erreurs": {
   "qr_illisible": "Dieser QR-Code ist kein gültiger PincabOS-QR-Code.",
   "signature_invalide": "QR-Code abgelehnt: Er wurde nicht von einem PincabOS-Pincab erstellt.",
   "pincab_inconnu": "Dieser Pincab ist nicht registriert.",
   "pincab_bloque": "Dieser Pincab kann keine Punkte mehr senden.",
   "qr_mauvais_type": "Das ist nicht der richtige QR-Code-Typ.",
   "qr_expire": "Dieser QR-Code ist abgelaufen: Lass am Pincab einen neuen anzeigen.",
   "score_invalide": "Ungültiger Punktestand.",
   "table_invalide": "Ungültiger Tisch.",
   "duree_invalide": "Ungültige Spieldauer.",
   "carte_requise": "Spielerkarte erforderlich.",
   "initiales_prises": "Die Initialen {} werden auf diesem Pincab schon von einer anderen Karte verwendet. Erstelle eine Karte mit anderen Initialen.",
   "deja_en_ligne": "Diese Punkte sind schon online.",
   "code_inconnu": "Unbekannter Code. Prüfe ihn und versuche es erneut.",
   "pseudo_invalide": "Spitzname zu kurz (mindestens 2 Zeichen).",
   "pseudo_deja_pris": "Dieser Spitzname wird schon von einem anderen Spieler verwendet: Wähle einen anderen.",
   "initiales_invalides": "Ungültige Initialen (1 bis 3 Buchstaben oder Ziffern).",
   "trop_de_demandes": "Zu viele Anfragen von dieser Verbindung. Versuche es morgen erneut.",
   "erreur_serveur": "Serverfehler. Versuche es später erneut.",
   "acces_refuse": "Falscher Admin-Schlüssel (Vorsicht vor Großbuchstaben, die die Handy-Tastatur einfügt).",
   "introuvable": "Seite nicht gefunden.",
   "requete_invalide": "Ungültige Anfrage.",
   "abonnement_invalide": "Ungültiges Benachrichtigungsabo.",
   "limite_appareils": "Diese Karte ist bereits auf fünf Geräten aktiviert."
  },
  "carte_titre": "MEINE SPIELERKARTE",
  "creer_titre": "MEINE SPIELERKARTE ERSTELLEN",
  "creer_texte": "Deine Karte speichert alle deine Punkte. Keine E-Mail, kein Passwort: nur ein Wiederherstellungscode.",
  "pseudo": "Spitzname",
  "initiales": "Initialen (dieselben wie am Pincab)",
  "creer": "Meine Karte erstellen",
  "code_titre": "DEIN WIEDERHERSTELLUNGSCODE",
  "code_texte": "Schreib ihn auf oder fotografiere ihn: Nur so findest du deine Karte auf einem anderen Handy wieder. Gib ihn niemandem.",
  "code_ok": "Ich habe meinen Code notiert",
  "restaurer_titre": "MEINE KARTE WIEDERHERSTELLEN",
  "code": "Wiederherstellungscode",
  "valider": "Bestätigen",
  "records": "Rekorde",
  "podiums": "Podestplätze",
  "liee_a": "Verbunden mit",
  "aucun_pincab": "Noch mit keinem Pincab verbunden",
  "mes_scores": "MEINE PUNKTE",
  "voir_code": "Meinen Wiederherstellungscode anzeigen",
  "oublier": "Karte von diesem Handy entfernen",
  "oublier_confirm": "Karte von diesem Handy entfernen? Bewahre deinen Wiederherstellungscode gut auf, um sie wiederzufinden.",
  "lier_titre": "MEINE KARTE MIT DIESEM PINCAB VERBINDEN",
  "lier_ok": "KARTE VERBUNDEN!",
  "lier_ok_texte": "Deine Karte {} ist mit „{}“ verbunden. Deine nächsten Punkte mit den Initialen {} können online gestellt werden.",
  "lier_deja": "Deine Karte ist schon mit „{}“ verbunden.",
  "retour": "Zurück",
  "joueur": "SPIELER",
  "retour_page": "Zurück zur vorherigen Seite",
  "pseudo_modifier": "Spitznamen ändern",
  "pseudo_enregistre": "Spitzname gespeichert.",
  "delier": "Trennen",
  "delier_confirme": "Diesen Pincab trennen? Die bisherigen Punkte bleiben in den Ranglisten.",
  "compte_supprimer": "Mein Konto löschen",
  "compte_supprimer_confirme": "Dieses Konto löschen? Der Spitzname wird freigegeben und die Punkte bleiben anonym in den Ranglisten. Das ist endgültig.",
  "compte_supprime": "Konto gelöscht. Die in den Ranglisten verbleibenden Punkte sind anonymisiert.",
  "setup_profil_aide": "Erstelle dein Profil im Setup des Pincabs und scanne dann den Verbindungs-QR-Code in seinen Einstellungen.",
  "deconnexion": "Dieses Handy abmelden",
  "deconnexion_confirme": "Dieses Handy abmelden? Profil und Punkte werden nicht gelöscht.",
  "realisations": "ERFOLGE",
  "aucun_succes": "Spiel weiter, um deine ersten Erfolge freizuschalten.",
  "voir_joueurs": "Spieler und ihre Erfolge ansehen",
  "meilleur_score": "Bester Punktestand",
  "tables_jouees": "Gespielte Tische",
  "temps_cumule": "Gesamte Spielzeit auf diesem Tisch",
  "duree_partie": "Spieldauer:",
  "secondes": "s",
  "joueurs_avec_score": "Spieler mit Online-Punkten",
  "aucun_joueur_identifie": "Kein Spieler durch geteilte Punkte erkannt",
  "push_titre": "Hinweise zu großen Punkteständen",
  "push_aide": "Erhalte eine Benachrichtigung, wenn ein Spieler einen Online-Rekord aufstellt oder in die Top 3 kommt.",
  "push_activer": "Benachrichtigungen auf diesem Handy aktivieren",
  "push_desactiver": "Benachrichtigungen auf diesem Handy deaktivieren",
  "push_active": "Benachrichtigungen sind auf diesem Handy aktiviert.",
  "push_inactive": "Benachrichtigungen sind auf diesem Handy nicht aktiviert.",
  "push_non_supporte": "Benachrichtigungen sind in diesem Browser nicht verfügbar. Auf dem iPhone die Website zuerst zum Home-Bildschirm hinzufügen.",
  "push_refuse": "Berechtigung verweigert. Ändere die Benachrichtigungseinstellungen des Browsers, um sie zu aktivieren.",
  "push_erreur": "Benachrichtigungen konnten nicht aktiviert werden. Prüfe die Verbindung und versuche es erneut.",
  "succes_premier_score": "Erster Punktestand",
  "succes_cinq_tables": "5 Tische gespielt",
  "succes_dix_tables": "10 Tische gespielt",
  "succes_premier_podium": "Erster Podestplatz",
  "succes_premier_record": "Erster Rekord",
  "succes_cent_scores": "100 Punktestände",
  "temps_jeu": "Geteilte Spielzeit",
  "temps_par_table": "SPIELZEIT PRO TISCH",
  "heures": "Std.",
  "minutes": "Min.",
  "donnees_qr": "Hier erscheinen nur Punkte, die von einem PincabOS-Pincab gesendet wurden.",
  "admin": "Verwaltung",
  "cle_admin": "Admin-Schlüssel",
  "approuver": "Freigeben",
  "bloquer": "Sperren",
  "debloquer": "Entsperren",
  "retirer": "Zurückziehen",
  "cle_ok": "Schlüssel akzeptiert: {} Pincab(s) registriert.",
  "aucun_pincab_admin": "Noch kein Pincab registriert.",
  "en_attente": "Wartet auf Freigabe",
  "valide": "Freigegeben",
  "bloque": "Gesperrt",
  "langue": "Sprache",
  "suspects_titre": "PUNKTE IN PRÜFUNG",
  "suspects_aide": "Von der automatischen Prüfung zurückgehaltene Punkte. Annehmen: Der Punktestand kommt in die Ranglisten. Ablehnen: Er wird gelöscht.",
  "aucun_suspect": "Keine Punkte in Prüfung.",
  "accepter": "Annehmen",
  "refuser": "Ablehnen",
  "record_actuel": "Aktueller Rekord: {}",
  "duree": "Dauer: {}",
  "raisons": {
   "pincab_surveille": "Pincab unter Beobachtung (mehrere Punkte in Prüfung)",
   "date_future": "Spieldatum in der Zukunft",
   "partie_trop_courte": "Spiel zu kurz",
   "partie_trop_longue": "Spiel zu lang",
   "trop_de_scores": "Zu viele Punkte in kurzer Zeit",
   "score_anormal": "Ungewöhnlich hoher Punktestand für diesen Tisch",
   "score_trop_rapide": "Zu viele Punkte pro Sekunde für diesen Tisch"
  }
 },
 "pt": {
  "accueil": "Início",
  "ma_carte": "O meu cartão",
  "chargement": "A carregar…",
  "erreur_reseau": "Sem ligação. Tenta outra vez.",
  "recherche": "Procurar uma mesa",
  "pincabs": "Pincabs",
  "joueurs": "Jogadores",
  "scores": "Pontuações",
  "derniers": "ÚLTIMAS PONTUAÇÕES",
  "aucun": "Ainda não há pontuações.",
  "record": "RECORDE",
  "top": "TOP {}",
  "score_ajoute": "PONTUAÇÃO ADICIONADA AO TEU CARTÃO",
  "nouveau_record": "NOVO RECORDE!",
  "ton_score": "A TUA PONTUAÇÃO",
  "sur_pincab": "Neste pincab",
  "tous_pincabs": "Todos os pincabs",
  "place": "{}.º",
  "place1": "1.º",
  "voir_classement": "Ver a classificação da mesa",
  "confirmer": "Colocar a minha pontuação online",
  "confirmer_aide": "Esta pontuação vai aparecer na classificação online com o teu cartão {}.",
  "deja_titre": "ESTA PONTUAÇÃO JÁ ESTÁ ONLINE",
  "deja_texte": "Este código QR já foi digitalizado. Cada pontuação só conta uma vez.",
  "ajoute_par": "Adicionada por",
  "le": "Em",
  "table": "Mesa",
  "score": "Pontuação",
  "pas_toi": "Não és tu? Só o cartão associado ao jogador do pincab pode recuperar uma pontuação.",
  "besoin_carte": "Para colocar esta pontuação online precisas de um cartão de jogador (grátis, sem e-mail).",
  "creer_carte": "Criar o meu cartão de jogador",
  "restaurer": "Já tenho um cartão",
  "non_liee_titre": "O TEU CARTÃO NÃO ESTÁ ASSOCIADO A ESTE PINCAB",
  "non_liee_texte": "No pincab: Quadro de pontuações > Online > Associar um perfil e digitaliza o código QR mostrado. Só uma vez.",
  "initiales_diff": "Esta pontuação foi feita com as iniciais {}, o teu cartão tem as iniciais {}. Só o cartão {} deste pincab a pode recuperar.",
  "sans_initiales": "Esta pontuação não tem iniciais: não pode ser colocada online.",
  "erreurs": {
   "qr_illisible": "Este código QR não é um QR PincabOS válido.",
   "signature_invalide": "Código QR recusado: não foi criado por um pincab PincabOS.",
   "pincab_inconnu": "Este pincab não está registado.",
   "pincab_bloque": "Este pincab já não pode enviar pontuações.",
   "qr_mauvais_type": "Não é o tipo de código QR certo.",
   "qr_expire": "Este código QR expirou: mostra um novo no pincab.",
   "score_invalide": "Pontuação inválida.",
   "table_invalide": "Mesa inválida.",
   "duree_invalide": "Duração da partida inválida.",
   "carte_requise": "É preciso um cartão de jogador.",
   "initiales_prises": "As iniciais {} já são usadas por outro cartão neste pincab. Cria um cartão com outras iniciais.",
   "deja_en_ligne": "Esta pontuação já está online.",
   "code_inconnu": "Código desconhecido. Verifica-o e tenta outra vez.",
   "pseudo_invalide": "Alcunha demasiado curta (mínimo 2 caracteres).",
   "pseudo_deja_pris": "Esta alcunha já é usada por outro jogador: escolhe outra.",
   "initiales_invalides": "Iniciais inválidas (1 a 3 letras ou algarismos).",
   "trop_de_demandes": "Demasiados pedidos a partir desta ligação. Tenta amanhã.",
   "erreur_serveur": "Erro do servidor. Tenta mais tarde.",
   "acces_refuse": "Chave de administração incorreta (cuidado com as maiúsculas que o teclado do telemóvel adiciona).",
   "introuvable": "Página não encontrada.",
   "requete_invalide": "Pedido inválido.",
   "abonnement_invalide": "Subscrição de notificações inválida.",
   "limite_appareils": "Este cartão já está ativado em cinco aparelhos."
  },
  "carte_titre": "O MEU CARTÃO DE JOGADOR",
  "creer_titre": "CRIAR O MEU CARTÃO DE JOGADOR",
  "creer_texte": "O teu cartão guarda todas as tuas pontuações. Sem e-mail nem palavra-passe: só um código de recuperação.",
  "pseudo": "Alcunha",
  "initiales": "Iniciais (as mesmas do pincab)",
  "creer": "Criar o meu cartão",
  "code_titre": "O TEU CÓDIGO DE RECUPERAÇÃO",
  "code_texte": "Anota-o ou tira-lhe uma fotografia: é a única forma de recuperar o teu cartão noutro telemóvel. Não o dês a ninguém.",
  "code_ok": "Anotei o meu código",
  "restaurer_titre": "RECUPERAR O MEU CARTÃO",
  "code": "Código de recuperação",
  "valider": "Validar",
  "records": "Recordes",
  "podiums": "Pódios",
  "liee_a": "Associado a",
  "aucun_pincab": "Ainda não associado a nenhum pincab",
  "mes_scores": "AS MINHAS PONTUAÇÕES",
  "voir_code": "Mostrar o meu código de recuperação",
  "oublier": "Retirar o cartão deste telemóvel",
  "oublier_confirm": "Retirar o cartão deste telemóvel? Guarda bem o teu código de recuperação para o recuperar.",
  "lier_titre": "ASSOCIAR O MEU CARTÃO A ESTE PINCAB",
  "lier_ok": "CARTÃO ASSOCIADO!",
  "lier_ok_texte": "O teu cartão {} está associado a «{}». As tuas próximas pontuações com as iniciais {} poderão ir para online.",
  "lier_deja": "O teu cartão já está associado a «{}».",
  "retour": "Voltar",
  "joueur": "JOGADOR",
  "retour_page": "Voltar à página anterior",
  "pseudo_modifier": "Mudar a alcunha",
  "pseudo_enregistre": "Alcunha guardada.",
  "delier": "Desassociar",
  "delier_confirme": "Desassociar este pincab? As pontuações anteriores ficam nas classificações.",
  "compte_supprimer": "Apagar a minha conta",
  "compte_supprimer_confirme": "Apagar esta conta? A alcunha fica livre e as pontuações ficam anónimas nas classificações. Esta ação é definitiva.",
  "compte_supprime": "Conta apagada. As pontuações que ficam nas classificações estão anonimizadas.",
  "setup_profil_aide": "Cria o teu perfil no Setup do pincab e digitaliza o QR de ligação mostrado nas definições.",
  "deconnexion": "Desligar este telemóvel",
  "deconnexion_confirme": "Desligar este telemóvel? O perfil e as pontuações não serão apagados.",
  "realisations": "CONQUISTAS",
  "aucun_succes": "Continua a jogar para desbloquear as tuas primeiras conquistas.",
  "voir_joueurs": "Ver os jogadores e as suas conquistas",
  "meilleur_score": "Melhor pontuação",
  "tables_jouees": "Mesas jogadas",
  "temps_cumule": "Tempo de jogo acumulado nesta mesa",
  "duree_partie": "Duração da partida:",
  "secondes": "s",
  "joueurs_avec_score": "Jogadores com uma pontuação online",
  "aucun_joueur_identifie": "Nenhum jogador identificado por uma pontuação partilhada",
  "push_titre": "Alertas de grandes pontuações",
  "push_aide": "Recebe uma notificação quando um jogador bate um recorde online ou entra no Top 3.",
  "push_activer": "Ativar as notificações neste telemóvel",
  "push_desactiver": "Desativar as notificações neste telemóvel",
  "push_active": "As notificações estão ativadas neste telemóvel.",
  "push_inactive": "As notificações não estão ativadas neste telemóvel.",
  "push_non_supporte": "As notificações não estão disponíveis neste navegador. No iPhone, adiciona primeiro o site ao ecrã principal.",
  "push_refuse": "Permissão recusada. Muda as definições de notificações do navegador para as ativar.",
  "push_erreur": "Não foi possível ativar as notificações. Verifica a ligação e tenta outra vez.",
  "succes_premier_score": "Primeira pontuação",
  "succes_cinq_tables": "5 mesas jogadas",
  "succes_dix_tables": "10 mesas jogadas",
  "succes_premier_podium": "Primeiro pódio",
  "succes_premier_record": "Primeiro recorde",
  "succes_cent_scores": "100 pontuações",
  "temps_jeu": "Tempo de jogo partilhado",
  "temps_par_table": "TEMPO DE JOGO POR MESA",
  "heures": "h",
  "minutes": "min",
  "donnees_qr": "Aqui só aparecem pontuações enviadas por um pincab PincabOS.",
  "admin": "Administração",
  "cle_admin": "Chave de administração",
  "approuver": "Validar",
  "bloquer": "Bloquear",
  "debloquer": "Desbloquear",
  "retirer": "Retirar",
  "cle_ok": "Chave aceite: {} pincab(s) registado(s).",
  "aucun_pincab_admin": "Ainda não há nenhum pincab registado.",
  "en_attente": "A aguardar validação",
  "valide": "Validado",
  "bloque": "Bloqueado",
  "langue": "Idioma",
  "suspects_titre": "PONTUAÇÕES EM VERIFICAÇÃO",
  "suspects_aide": "Pontuações postas de lado pela verificação automática. Aceitar: a pontuação entra nas classificações. Recusar: é apagada.",
  "aucun_suspect": "Nenhuma pontuação em verificação.",
  "accepter": "Aceitar",
  "refuser": "Recusar",
  "record_actuel": "Recorde atual: {}",
  "duree": "Duração: {}",
  "raisons": {
   "pincab_surveille": "Pincab sob vigilância (várias pontuações pendentes)",
   "date_future": "Data da partida no futuro",
   "partie_trop_courte": "Partida demasiado curta",
   "partie_trop_longue": "Partida demasiado longa",
   "trop_de_scores": "Demasiadas pontuações em pouco tempo",
   "score_anormal": "Pontuação anormalmente alta para esta mesa",
   "score_trop_rapide": "Demasiados pontos por segundo para esta mesa"
  }
 },
 "ja": {
  "accueil": "ホーム",
  "ma_carte": "マイカード",
  "chargement": "読み込み中…",
  "erreur_reseau": "接続できません。もう一度お試しください。",
  "recherche": "テーブルを検索",
  "pincabs": "pincab",
  "joueurs": "プレイヤー",
  "scores": "スコア",
  "derniers": "最新のスコア",
  "aucun": "まだスコアはありません。",
  "record": "記録",
  "top": "トップ {}",
  "score_ajoute": "スコアをカードに追加しました",
  "nouveau_record": "新記録!",
  "ton_score": "あなたのスコア",
  "sur_pincab": "この pincab で",
  "tous_pincabs": "すべての pincab",
  "place": "{}位",
  "place1": "1位",
  "voir_classement": "テーブルのランキングを見る",
  "confirmer": "スコアを公開する",
  "confirmer_aide": "このスコアはカード {} とともにオンラインランキングに表示されます。",
  "deja_titre": "このスコアはすでに公開済みです",
  "deja_texte": "この QR コードはすでに読み取られています。各スコアは1回しか数えられません。",
  "ajoute_par": "追加した人",
  "le": "日時",
  "table": "テーブル",
  "score": "スコア",
  "pas_toi": "あなたではありませんか?スコアを受け取れるのは、pincab のプレイヤーに登録されたカードだけです。",
  "besoin_carte": "このスコアを公開するにはプレイヤーカードが必要です(無料、メール不要)。",
  "creer_carte": "プレイヤーカードを作成",
  "restaurer": "カードを持っています",
  "non_liee_titre": "カードがこの pincab に登録されていません",
  "non_liee_texte": "pincab で:スコアボード > オンライン > プロフィールを登録 を開き、表示された QR コードを読み取ってください。1回だけで大丈夫です。",
  "initiales_diff": "このスコアはイニシャル {} で記録されましたが、あなたのカードのイニシャルは {} です。このスコアを受け取れるのは、この pincab のカード {} だけです。",
  "sans_initiales": "このスコアにはイニシャルがないため、公開できません。",
  "erreurs": {
   "qr_illisible": "この QR コードは有効な PincabOS の QR ではありません。",
   "signature_invalide": "QR コードが拒否されました:PincabOS の pincab で作成されたものではありません。",
   "pincab_inconnu": "この pincab は登録されていません。",
   "pincab_bloque": "この pincab はスコアを送信できなくなっています。",
   "qr_mauvais_type": "QR コードの種類が違います。",
   "qr_expire": "この QR コードは期限切れです。pincab で新しいものを表示してください。",
   "score_invalide": "無効なスコアです。",
   "table_invalide": "無効なテーブルです。",
   "duree_invalide": "無効なゲーム時間です。",
   "carte_requise": "プレイヤーカードが必要です。",
   "initiales_prises": "イニシャル {} はこの pincab の別のカードで使われています。別のイニシャルでカードを作成してください。",
   "deja_en_ligne": "このスコアはすでに公開済みです。",
   "code_inconnu": "不明なコードです。確認してもう一度お試しください。",
   "pseudo_invalide": "ニックネームが短すぎます(2文字以上)。",
   "pseudo_deja_pris": "このニックネームは別のプレイヤーが使っています。別のものを選んでください。",
   "initiales_invalides": "無効なイニシャルです(英字または数字1〜3文字)。",
   "trop_de_demandes": "この接続からのリクエストが多すぎます。明日もう一度お試しください。",
   "erreur_serveur": "サーバーエラーです。しばらくしてからお試しください。",
   "acces_refuse": "管理キーが正しくありません(スマホのキーボードが自動で付ける大文字に注意)。",
   "introuvable": "ページが見つかりません。",
   "requete_invalide": "無効なリクエストです。",
   "abonnement_invalide": "無効な通知の登録です。",
   "limite_appareils": "このカードはすでに5台の端末で有効になっています。"
  },
  "carte_titre": "マイプレイヤーカード",
  "creer_titre": "プレイヤーカードを作成",
  "creer_texte": "カードにはあなたのすべてのスコアが保存されます。メールもパスワードも不要で、復元コードだけです。",
  "pseudo": "ニックネーム",
  "initiales": "イニシャル(pincab と同じもの)",
  "creer": "カードを作成",
  "code_titre": "あなたの復元コード",
  "code_texte": "メモするか写真を撮ってください。別のスマホでカードを復元する唯一の方法です。誰にも教えないでください。",
  "code_ok": "コードをメモしました",
  "restaurer_titre": "カードを復元",
  "code": "復元コード",
  "valider": "確定",
  "records": "記録",
  "podiums": "表彰台",
  "liee_a": "登録先",
  "aucun_pincab": "まだどの pincab にも登録されていません",
  "mes_scores": "マイスコア",
  "voir_code": "復元コードを表示",
  "oublier": "このスマホからカードを外す",
  "oublier_confirm": "このスマホからカードを外しますか?復元できるよう、復元コードを大切に保管してください。",
  "lier_titre": "カードをこの pincab に登録",
  "lier_ok": "登録しました!",
  "lier_ok_texte": "カード {} を「{}」に登録しました。今後イニシャル {} で出したスコアを公開できます。",
  "lier_deja": "カードはすでに「{}」に登録されています。",
  "retour": "戻る",
  "joueur": "プレイヤー",
  "retour_page": "前のページに戻る",
  "pseudo_modifier": "ニックネームを変更",
  "pseudo_enregistre": "ニックネームを保存しました。",
  "delier": "登録解除",
  "delier_confirme": "この pincab の登録を解除しますか?これまでのスコアはランキングに残ります。",
  "compte_supprimer": "アカウントを削除",
  "compte_supprimer_confirme": "このアカウントを削除しますか?ニックネームは解放され、スコアは匿名でランキングに残ります。この操作は取り消せません。",
  "compte_supprime": "アカウントを削除しました。ランキングに残るスコアは匿名になっています。",
  "setup_profil_aide": "pincab の Setup でプロフィールを作成し、設定に表示される接続用 QR を読み取ってください。",
  "deconnexion": "このスマホの接続を解除",
  "deconnexion_confirme": "このスマホの接続を解除しますか?プロフィールとスコアは削除されません。",
  "realisations": "実績",
  "aucun_succes": "プレイを続けて最初の実績を解除しましょう。",
  "voir_joueurs": "プレイヤーと実績を見る",
  "meilleur_score": "ベストスコア",
  "tables_jouees": "プレイしたテーブル",
  "temps_cumule": "このテーブルの累計プレイ時間",
  "duree_partie": "ゲーム時間:",
  "secondes": "秒",
  "joueurs_avec_score": "オンラインスコアのあるプレイヤー",
  "aucun_joueur_identifie": "共有スコアで特定されたプレイヤーはいません",
  "push_titre": "大きなスコアのお知らせ",
  "push_aide": "プレイヤーがオンライン記録を出したり、トップ3に入ったりしたときに通知を受け取れます。",
  "push_activer": "このスマホで通知をオンにする",
  "push_desactiver": "このスマホで通知をオフにする",
  "push_active": "このスマホでは通知がオンです。",
  "push_inactive": "このスマホでは通知がオフです。",
  "push_non_supporte": "このブラウザーでは通知を利用できません。iPhone では、先にサイトをホーム画面に追加してください。",
  "push_refuse": "許可されませんでした。通知を使うにはブラウザーの通知設定を変更してください。",
  "push_erreur": "通知をオンにできませんでした。接続を確認してもう一度お試しください。",
  "succes_premier_score": "初スコア",
  "succes_cinq_tables": "5テーブルをプレイ",
  "succes_dix_tables": "10テーブルをプレイ",
  "succes_premier_podium": "初の表彰台",
  "succes_premier_record": "初の記録",
  "succes_cent_scores": "100スコア",
  "temps_jeu": "共有プレイ時間",
  "temps_par_table": "テーブル別プレイ時間",
  "heures": "時間",
  "minutes": "分",
  "donnees_qr": "ここには PincabOS の pincab から送られたスコアだけが表示されます。",
  "admin": "管理",
  "cle_admin": "管理キー",
  "approuver": "承認",
  "bloquer": "ブロック",
  "debloquer": "ブロック解除",
  "retirer": "取り消す",
  "cle_ok": "キーを確認しました:登録済み pincab {} 台。",
  "aucun_pincab_admin": "登録されている pincab はまだありません。",
  "en_attente": "承認待ち",
  "valide": "承認済み",
  "bloque": "ブロック中",
  "langue": "言語",
  "suspects_titre": "確認中のスコア",
  "suspects_aide": "自動チェックで保留されたスコアです。承認:スコアがランキングに入ります。拒否:削除されます。",
  "aucun_suspect": "確認中のスコアはありません。",
  "accepter": "承認",
  "refuser": "拒否",
  "record_actuel": "現在の記録:{}",
  "duree": "時間:{}",
  "raisons": {
   "pincab_surveille": "監視中の pincab(保留中のスコアが複数)",
   "date_future": "ゲームの日付が未来",
   "partie_trop_courte": "ゲームが短すぎる",
   "partie_trop_longue": "ゲームが長すぎる",
   "trop_de_scores": "短時間にスコアが多すぎる",
   "score_anormal": "このテーブルとしては異常に高いスコア",
   "score_trop_rapide": "このテーブルとしては1秒あたりの得点が多すぎる"
  }
 },
 "zh": {
  "accueil": "首页",
  "ma_carte": "我的卡",
  "chargement": "加载中…",
  "erreur_reseau": "无法连接,请重试。",
  "recherche": "搜索台",
  "pincabs": "pincab",
  "joueurs": "玩家",
  "scores": "分数",
  "derniers": "最新分数",
  "aucun": "暂无分数。",
  "record": "纪录",
  "top": "前 {} 名",
  "score_ajoute": "分数已添加到你的卡",
  "nouveau_record": "新纪录!",
  "ton_score": "你的分数",
  "sur_pincab": "在此 pincab",
  "tous_pincabs": "所有 pincab",
  "place": "第 {} 名",
  "place1": "第 1 名",
  "voir_classement": "查看该台排行榜",
  "confirmer": "发布我的分数",
  "confirmer_aide": "此分数将以你的卡 {} 显示在在线排行榜中。",
  "deja_titre": "此分数已在线",
  "deja_texte": "此二维码已被扫描。每个分数只计一次。",
  "ajoute_par": "添加者",
  "le": "时间",
  "table": "台",
  "score": "分数",
  "pas_toi": "不是你?只有绑定到该 pincab 玩家的卡才能领取分数。",
  "besoin_carte": "要发布此分数,你需要一张玩家卡(免费,无需邮箱)。",
  "creer_carte": "创建我的玩家卡",
  "restaurer": "我已经有卡了",
  "non_liee_titre": "你的卡未绑定到此 pincab",
  "non_liee_texte": "在 pincab 上:记分板 > 在线 > 绑定资料,然后扫描显示的二维码。只需一次。",
  "initiales_diff": "此分数使用缩写 {},你的卡缩写为 {}。只有此 pincab 上的 {} 卡才能领取。",
  "sans_initiales": "此分数没有缩写,无法发布。",
  "erreurs": {
   "qr_illisible": "此二维码不是有效的 PincabOS 二维码。",
   "signature_invalide": "二维码被拒绝:它不是由 PincabOS pincab 生成的。",
   "pincab_inconnu": "此 pincab 未注册。",
   "pincab_bloque": "此 pincab 已不能再发送分数。",
   "qr_mauvais_type": "二维码类型不对。",
   "qr_expire": "此二维码已过期:请在 pincab 上显示新的。",
   "score_invalide": "分数无效。",
   "table_invalide": "台无效。",
   "duree_invalide": "游戏时长无效。",
   "carte_requise": "需要玩家卡。",
   "initiales_prises": "缩写 {} 已被此 pincab 上的另一张卡使用。请用其他缩写创建卡。",
   "deja_en_ligne": "此分数已在线。",
   "code_inconnu": "未知代码,请检查后重试。",
   "pseudo_invalide": "昵称太短(至少 2 个字符)。",
   "pseudo_deja_pris": "此昵称已被其他玩家使用,请另选一个。",
   "initiales_invalides": "缩写无效(1 到 3 个字母或数字)。",
   "trop_de_demandes": "此连接的请求过多,请明天再试。",
   "erreur_serveur": "服务器错误,请稍后再试。",
   "acces_refuse": "管理密钥错误(注意手机键盘自动添加的大写字母)。",
   "introuvable": "页面不存在。",
   "requete_invalide": "请求无效。",
   "abonnement_invalide": "通知订阅无效。",
   "limite_appareils": "此卡已在五台设备上启用。"
  },
  "carte_titre": "我的玩家卡",
  "creer_titre": "创建我的玩家卡",
  "creer_texte": "你的卡会保存你所有的分数。无需邮箱和密码:只有一个恢复码。",
  "pseudo": "昵称",
  "initiales": "缩写(与 pincab 上相同)",
  "creer": "创建我的卡",
  "code_titre": "你的恢复码",
  "code_texte": "记下来或拍照保存:这是在另一部手机上找回卡的唯一方法。不要告诉任何人。",
  "code_ok": "我已记下恢复码",
  "restaurer_titre": "找回我的卡",
  "code": "恢复码",
  "valider": "确认",
  "records": "纪录",
  "podiums": "领奖台",
  "liee_a": "已绑定",
  "aucun_pincab": "尚未绑定任何 pincab",
  "mes_scores": "我的分数",
  "voir_code": "显示我的恢复码",
  "oublier": "从此手机移除卡",
  "oublier_confirm": "从此手机移除卡?请保管好恢复码以便找回。",
  "lier_titre": "将我的卡绑定到此 pincab",
  "lier_ok": "卡已绑定!",
  "lier_ok_texte": "你的卡 {} 已绑定到“{}”。之后使用缩写 {} 的分数可以发布到网上。",
  "lier_deja": "你的卡已绑定到“{}”。",
  "retour": "返回",
  "joueur": "玩家",
  "retour_page": "返回上一页",
  "pseudo_modifier": "修改昵称",
  "pseudo_enregistre": "昵称已保存。",
  "delier": "解除绑定",
  "delier_confirme": "解除与此 pincab 的绑定?以前的分数会保留在排行榜中。",
  "compte_supprimer": "删除我的账号",
  "compte_supprimer_confirme": "删除此账号?昵称将被释放,分数会以匿名形式保留在排行榜中。此操作不可撤销。",
  "compte_supprime": "账号已删除。保留在排行榜中的分数已匿名化。",
  "setup_profil_aide": "在 pincab 的 Setup 中创建你的资料,然后扫描其设置中显示的连接二维码。",
  "deconnexion": "断开此手机",
  "deconnexion_confirme": "断开此手机?资料和分数不会被删除。",
  "realisations": "成就",
  "aucun_succes": "继续游戏,解锁你的第一个成就。",
  "voir_joueurs": "查看玩家及其成就",
  "meilleur_score": "最高分",
  "tables_jouees": "玩过的台",
  "temps_cumule": "此台的累计游戏时间",
  "duree_partie": "游戏时长:",
  "secondes": "秒",
  "joueurs_avec_score": "有在线分数的玩家",
  "aucun_joueur_identifie": "没有通过共享分数识别出的玩家",
  "push_titre": "高分提醒",
  "push_aide": "当有玩家创造在线纪录或进入前 3 名时收到通知。",
  "push_activer": "在此手机上开启通知",
  "push_desactiver": "在此手机上关闭通知",
  "push_active": "此手机已开启通知。",
  "push_inactive": "此手机未开启通知。",
  "push_non_supporte": "此浏览器不支持通知。在 iPhone 上,请先把网站添加到主屏幕。",
  "push_refuse": "权限被拒绝。请在浏览器的通知设置中开启。",
  "push_erreur": "无法开启通知。请检查网络后重试。",
  "succes_premier_score": "第一个分数",
  "succes_cinq_tables": "玩过 5 张台",
  "succes_dix_tables": "玩过 10 张台",
  "succes_premier_podium": "首次登上领奖台",
  "succes_premier_record": "首个纪录",
  "succes_cent_scores": "100 个分数",
  "temps_jeu": "共享游戏时间",
  "temps_par_table": "各台游戏时间",
  "heures": "小时",
  "minutes": "分钟",
  "donnees_qr": "这里只显示由 PincabOS pincab 发送的分数。",
  "admin": "管理",
  "cle_admin": "管理密钥",
  "approuver": "批准",
  "bloquer": "封禁",
  "debloquer": "解封",
  "retirer": "撤销",
  "cle_ok": "密钥正确:已注册 {} 台 pincab。",
  "aucun_pincab_admin": "还没有注册任何 pincab。",
  "en_attente": "等待批准",
  "valide": "已批准",
  "bloque": "已封禁",
  "langue": "语言",
  "suspects_titre": "待审核的分数",
  "suspects_aide": "被自动检查暂扣的分数。接受:分数进入排行榜。拒绝:分数被删除。",
  "aucun_suspect": "没有待审核的分数。",
  "accepter": "接受",
  "refuser": "拒绝",
  "record_actuel": "当前纪录:{}",
  "duree": "时长:{}",
  "raisons": {
   "pincab_surveille": "pincab 被监控(多个分数待审核)",
   "date_future": "游戏日期在未来",
   "partie_trop_courte": "游戏时间太短",
   "partie_trop_longue": "游戏时间太长",
   "trop_de_scores": "短时间内分数太多",
   "score_anormal": "对此台来说分数异常地高",
   "score_trop_rapide": "对此台来说每秒得分过多"
  }
 },
 "ru": {
  "accueil": "Главная",
  "ma_carte": "Моя карта",
  "chargement": "Загрузка…",
  "erreur_reseau": "Нет соединения. Попробуйте ещё раз.",
  "recherche": "Найти стол",
  "pincabs": "Pincab",
  "joueurs": "Игроки",
  "scores": "Очки",
  "derniers": "ПОСЛЕДНИЕ РЕЗУЛЬТАТЫ",
  "aucun": "Пока нет результатов.",
  "record": "РЕКОРД",
  "top": "ТОП {}",
  "score_ajoute": "РЕЗУЛЬТАТ ДОБАВЛЕН НА ВАШУ КАРТУ",
  "nouveau_record": "НОВЫЙ РЕКОРД!",
  "ton_score": "ВАШ РЕЗУЛЬТАТ",
  "sur_pincab": "На этом pincab",
  "tous_pincabs": "Все pincab",
  "place": "{}-е",
  "place1": "1-е",
  "voir_classement": "Таблица рекордов стола",
  "confirmer": "Опубликовать мой результат",
  "confirmer_aide": "Этот результат появится в онлайн-таблице с вашей картой {}.",
  "deja_titre": "ЭТОТ РЕЗУЛЬТАТ УЖЕ ОПУБЛИКОВАН",
  "deja_texte": "Этот QR-код уже сканировали. Каждый результат засчитывается только один раз.",
  "ajoute_par": "Добавил",
  "le": "Дата",
  "table": "Стол",
  "score": "Очки",
  "pas_toi": "Это не вы? Забрать результат может только карта, привязанная к игроку этого pincab.",
  "besoin_carte": "Чтобы опубликовать результат, нужна карта игрока (бесплатно, без e-mail).",
  "creer_carte": "Создать карту игрока",
  "restaurer": "У меня уже есть карта",
  "non_liee_titre": "ВАША КАРТА НЕ ПРИВЯЗАНА К ЭТОМУ PINCAB",
  "non_liee_texte": "На pincab: Таблица рекордов > Онлайн > Привязать профиль, затем отсканируйте показанный QR-код. Нужно сделать один раз.",
  "initiales_diff": "Этот результат набран с инициалами {}, а у вашей карты инициалы {}. Забрать его может только карта {} этого pincab.",
  "sans_initiales": "У этого результата нет инициалов: его нельзя опубликовать.",
  "erreurs": {
   "qr_illisible": "Это не действительный QR-код PincabOS.",
   "signature_invalide": "QR-код отклонён: он создан не pincab PincabOS.",
   "pincab_inconnu": "Этот pincab не зарегистрирован.",
   "pincab_bloque": "Этот pincab больше не может отправлять результаты.",
   "qr_mauvais_type": "Не тот тип QR-кода.",
   "qr_expire": "Срок действия QR-кода истёк: покажите новый на pincab.",
   "score_invalide": "Недопустимый результат.",
   "table_invalide": "Недопустимый стол.",
   "duree_invalide": "Недопустимая длительность игры.",
   "carte_requise": "Нужна карта игрока.",
   "initiales_prises": "Инициалы {} уже использует другая карта на этом pincab. Создайте карту с другими инициалами.",
   "deja_en_ligne": "Этот результат уже опубликован.",
   "code_inconnu": "Неизвестный код. Проверьте его и попробуйте ещё раз.",
   "pseudo_invalide": "Псевдоним слишком короткий (минимум 2 символа).",
   "pseudo_deja_pris": "Этот псевдоним уже занят другим игроком: выберите другой.",
   "initiales_invalides": "Недопустимые инициалы (от 1 до 3 букв или цифр).",
   "trop_de_demandes": "Слишком много запросов с этого подключения. Попробуйте завтра.",
   "erreur_serveur": "Ошибка сервера. Попробуйте позже.",
   "acces_refuse": "Неверный ключ администратора (осторожно с заглавными буквами, которые добавляет клавиатура телефона).",
   "introuvable": "Страница не найдена.",
   "requete_invalide": "Недопустимый запрос.",
   "abonnement_invalide": "Недопустимая подписка на уведомления.",
   "limite_appareils": "Эта карта уже активирована на пяти устройствах."
  },
  "carte_titre": "МОЯ КАРТА ИГРОКА",
  "creer_titre": "СОЗДАТЬ КАРТУ ИГРОКА",
  "creer_texte": "Ваша карта хранит все ваши результаты. Без e-mail и пароля: только код восстановления.",
  "pseudo": "Псевдоним",
  "initiales": "Инициалы (те же, что на pincab)",
  "creer": "Создать карту",
  "code_titre": "ВАШ КОД ВОССТАНОВЛЕНИЯ",
  "code_texte": "Запишите или сфотографируйте его: это единственный способ вернуть карту на другом телефоне. Никому его не давайте.",
  "code_ok": "Я записал код",
  "restaurer_titre": "ВОССТАНОВИТЬ КАРТУ",
  "code": "Код восстановления",
  "valider": "Подтвердить",
  "records": "Рекорды",
  "podiums": "Пьедесталы",
  "liee_a": "Привязана к",
  "aucun_pincab": "Пока не привязана ни к одному pincab",
  "mes_scores": "МОИ РЕЗУЛЬТАТЫ",
  "voir_code": "Показать код восстановления",
  "oublier": "Убрать карту с этого телефона",
  "oublier_confirm": "Убрать карту с этого телефона? Сохраните код восстановления, чтобы вернуть её.",
  "lier_titre": "ПРИВЯЗАТЬ КАРТУ К ЭТОМУ PINCAB",
  "lier_ok": "КАРТА ПРИВЯЗАНА!",
  "lier_ok_texte": "Ваша карта {} привязана к «{}». Ваши следующие результаты с инициалами {} можно будет опубликовать.",
  "lier_deja": "Ваша карта уже привязана к «{}».",
  "retour": "Назад",
  "joueur": "ИГРОК",
  "retour_page": "Вернуться на предыдущую страницу",
  "pseudo_modifier": "Изменить псевдоним",
  "pseudo_enregistre": "Псевдоним сохранён.",
  "delier": "Отвязать",
  "delier_confirme": "Отвязать этот pincab? Прежние результаты останутся в таблицах.",
  "compte_supprimer": "Удалить мой аккаунт",
  "compte_supprimer_confirme": "Удалить этот аккаунт? Псевдоним освободится, а результаты останутся в таблицах анонимно. Это действие необратимо.",
  "compte_supprime": "Аккаунт удалён. Оставшиеся в таблицах результаты анонимизированы.",
  "setup_profil_aide": "Создайте профиль в Setup pincab, затем отсканируйте QR-код подключения в его настройках.",
  "deconnexion": "Отключить этот телефон",
  "deconnexion_confirme": "Отключить этот телефон? Профиль и результаты не будут удалены.",
  "realisations": "ДОСТИЖЕНИЯ",
  "aucun_succes": "Играйте дальше, чтобы открыть первые достижения.",
  "voir_joueurs": "Игроки и их достижения",
  "meilleur_score": "Лучший результат",
  "tables_jouees": "Сыгранные столы",
  "temps_cumule": "Общее время игры на этом столе",
  "duree_partie": "Длительность игры:",
  "secondes": "с",
  "joueurs_avec_score": "Игроки с онлайн-результатом",
  "aucun_joueur_identifie": "Нет игроков, опознанных по общим результатам",
  "push_titre": "Оповещения о больших результатах",
  "push_aide": "Получайте уведомление, когда игрок ставит онлайн-рекорд или входит в Топ-3.",
  "push_activer": "Включить уведомления на этом телефоне",
  "push_desactiver": "Выключить уведомления на этом телефоне",
  "push_active": "Уведомления на этом телефоне включены.",
  "push_inactive": "Уведомления на этом телефоне не включены.",
  "push_non_supporte": "Уведомления недоступны в этом браузере. На iPhone сначала добавьте сайт на экран «Домой».",
  "push_refuse": "Доступ запрещён. Измените настройки уведомлений браузера, чтобы включить их.",
  "push_erreur": "Не удалось включить уведомления. Проверьте соединение и попробуйте ещё раз.",
  "succes_premier_score": "Первый результат",
  "succes_cinq_tables": "5 сыгранных столов",
  "succes_dix_tables": "10 сыгранных столов",
  "succes_premier_podium": "Первый пьедестал",
  "succes_premier_record": "Первый рекорд",
  "succes_cent_scores": "100 результатов",
  "temps_jeu": "Общее время игры",
  "temps_par_table": "ВРЕМЯ ИГРЫ ПО СТОЛАМ",
  "heures": "ч",
  "minutes": "мин",
  "donnees_qr": "Здесь показаны только результаты, отправленные pincab PincabOS.",
  "admin": "Администрирование",
  "cle_admin": "Ключ администратора",
  "approuver": "Одобрить",
  "bloquer": "Заблокировать",
  "debloquer": "Разблокировать",
  "retirer": "Отозвать",
  "cle_ok": "Ключ принят: зарегистрировано pincab: {}.",
  "aucun_pincab_admin": "Пока нет зарегистрированных pincab.",
  "en_attente": "Ожидает одобрения",
  "valide": "Одобрен",
  "bloque": "Заблокирован",
  "langue": "Язык",
  "suspects_titre": "РЕЗУЛЬТАТЫ НА ПРОВЕРКЕ",
  "suspects_aide": "Результаты, задержанные автоматической проверкой. Принять: результат попадает в таблицы. Отклонить: он удаляется.",
  "aucun_suspect": "Нет результатов на проверке.",
  "accepter": "Принять",
  "refuser": "Отклонить",
  "record_actuel": "Текущий рекорд: {}",
  "duree": "Длительность: {}",
  "raisons": {
   "pincab_surveille": "Pincab под наблюдением (несколько результатов на проверке)",
   "date_future": "Дата игры в будущем",
   "partie_trop_courte": "Слишком короткая игра",
   "partie_trop_longue": "Слишком длинная игра",
   "trop_de_scores": "Слишком много результатов за короткое время",
   "score_anormal": "Аномально высокий результат для этого стола",
   "score_trop_rapide": "Слишком много очков в секунду для этого стола"
  }
 },
 "ar": {
  "accueil": "الرئيسية",
  "ma_carte": "بطاقتي",
  "chargement": "جارٍ التحميل…",
  "erreur_reseau": "تعذّر الاتصال. حاول مرة أخرى.",
  "recherche": "ابحث عن طاولة",
  "pincabs": "الـ pincab",
  "joueurs": "اللاعبون",
  "scores": "النتائج",
  "derniers": "آخر النتائج",
  "aucun": "لا توجد نتائج بعد.",
  "record": "رقم قياسي",
  "top": "أفضل {}",
  "score_ajoute": "أُضيفت النتيجة إلى بطاقتك",
  "nouveau_record": "رقم قياسي جديد!",
  "ton_score": "نتيجتك",
  "sur_pincab": "على هذا الـ pincab",
  "tous_pincabs": "كل الـ pincab",
  "place": "المركز {}",
  "place1": "المركز 1",
  "voir_classement": "عرض ترتيب الطاولة",
  "confirmer": "نشر نتيجتي",
  "confirmer_aide": "ستظهر هذه النتيجة في الترتيب عبر الإنترنت مع بطاقتك {}.",
  "deja_titre": "هذه النتيجة منشورة بالفعل",
  "deja_texte": "تم مسح رمز QR هذا من قبل. كل نتيجة تُحتسب مرة واحدة فقط.",
  "ajoute_par": "أضافها",
  "le": "في",
  "table": "الطاولة",
  "score": "النتيجة",
  "pas_toi": "لست أنت؟ لا يمكن استرداد النتيجة إلا بالبطاقة المرتبطة بلاعب هذا الـ pincab.",
  "besoin_carte": "لنشر هذه النتيجة تحتاج إلى بطاقة لاعب (مجانية، دون بريد إلكتروني).",
  "creer_carte": "إنشاء بطاقة اللاعب",
  "restaurer": "لدي بطاقة بالفعل",
  "non_liee_titre": "بطاقتك غير مرتبطة بهذا الـ pincab",
  "non_liee_texte": "على الـ pincab: لوحة النتائج > عبر الإنترنت > ربط ملف، ثم امسح رمز QR المعروض. مرة واحدة فقط.",
  "initiales_diff": "سُجلت هذه النتيجة بالأحرف الأولى {}، وبطاقتك تحمل الأحرف الأولى {}. لا يمكن استردادها إلا ببطاقة {} على هذا الـ pincab.",
  "sans_initiales": "هذه النتيجة بلا أحرف أولى: لا يمكن نشرها.",
  "erreurs": {
   "qr_illisible": "رمز QR هذا ليس رمز PincabOS صالحًا.",
   "signature_invalide": "تم رفض رمز QR: لم يُنشأ بواسطة pincab يعمل بـ PincabOS.",
   "pincab_inconnu": "هذا الـ pincab غير مسجّل.",
   "pincab_bloque": "لم يعد بإمكان هذا الـ pincab إرسال النتائج.",
   "qr_mauvais_type": "هذا ليس النوع الصحيح من رموز QR.",
   "qr_expire": "انتهت صلاحية رمز QR: اعرض رمزًا جديدًا على الـ pincab.",
   "score_invalide": "نتيجة غير صالحة.",
   "table_invalide": "طاولة غير صالحة.",
   "duree_invalide": "مدة لعب غير صالحة.",
   "carte_requise": "بطاقة اللاعب مطلوبة.",
   "initiales_prises": "الأحرف الأولى {} مستخدمة من بطاقة أخرى على هذا الـ pincab. أنشئ بطاقة بأحرف أولى أخرى.",
   "deja_en_ligne": "هذه النتيجة منشورة بالفعل.",
   "code_inconnu": "رمز غير معروف. تحقق منه وحاول مرة أخرى.",
   "pseudo_invalide": "الاسم المستعار قصير جدًا (حرفان على الأقل).",
   "pseudo_deja_pris": "هذا الاسم المستعار يستخدمه لاعب آخر: اختر اسمًا آخر.",
   "initiales_invalides": "أحرف أولى غير صالحة (من 1 إلى 3 أحرف أو أرقام).",
   "trop_de_demandes": "طلبات كثيرة جدًا من هذا الاتصال. حاول غدًا.",
   "erreur_serveur": "خطأ في الخادم. حاول لاحقًا.",
   "acces_refuse": "مفتاح الإدارة غير صحيح (انتبه للأحرف الكبيرة التي تضيفها لوحة مفاتيح الهاتف).",
   "introuvable": "الصفحة غير موجودة.",
   "requete_invalide": "طلب غير صالح.",
   "abonnement_invalide": "اشتراك إشعارات غير صالح.",
   "limite_appareils": "هذه البطاقة مفعّلة بالفعل على خمسة أجهزة."
  },
  "carte_titre": "بطاقة اللاعب",
  "creer_titre": "إنشاء بطاقة اللاعب",
  "creer_texte": "تحفظ بطاقتك كل نتائجك. دون بريد إلكتروني أو كلمة مرور: رمز استرداد فقط.",
  "pseudo": "الاسم المستعار",
  "initiales": "الأحرف الأولى (نفسها على الـ pincab)",
  "creer": "إنشاء بطاقتي",
  "code_titre": "رمز الاسترداد الخاص بك",
  "code_texte": "دوّنه أو صوّره: إنه الطريقة الوحيدة لاستعادة بطاقتك على هاتف آخر. لا تعطه لأحد.",
  "code_ok": "دوّنت الرمز",
  "restaurer_titre": "استعادة بطاقتي",
  "code": "رمز الاسترداد",
  "valider": "تأكيد",
  "records": "الأرقام القياسية",
  "podiums": "منصات التتويج",
  "liee_a": "مرتبطة بـ",
  "aucun_pincab": "غير مرتبطة بأي pincab بعد",
  "mes_scores": "نتائجي",
  "voir_code": "عرض رمز الاسترداد",
  "oublier": "إزالة البطاقة من هذا الهاتف",
  "oublier_confirm": "إزالة البطاقة من هذا الهاتف؟ احتفظ برمز الاسترداد جيدًا لاستعادتها.",
  "lier_titre": "ربط بطاقتي بهذا الـ pincab",
  "lier_ok": "تم ربط البطاقة!",
  "lier_ok_texte": "بطاقتك {} مرتبطة بـ «{}». يمكن نشر نتائجك القادمة بالأحرف الأولى {}.",
  "lier_deja": "بطاقتك مرتبطة بالفعل بـ «{}».",
  "retour": "رجوع",
  "joueur": "اللاعب",
  "retour_page": "العودة إلى الصفحة السابقة",
  "pseudo_modifier": "تغيير الاسم المستعار",
  "pseudo_enregistre": "تم حفظ الاسم المستعار.",
  "delier": "فك الربط",
  "delier_confirme": "فك الربط مع هذا الـ pincab؟ تبقى النتائج السابقة في الترتيب.",
  "compte_supprimer": "حذف حسابي",
  "compte_supprimer_confirme": "حذف هذا الحساب؟ سيُحرَّر الاسم المستعار وتبقى النتائج مجهولة الهوية في الترتيب. لا يمكن التراجع عن ذلك.",
  "compte_supprime": "تم حذف الحساب. النتائج الباقية في الترتيب مجهولة الهوية.",
  "setup_profil_aide": "أنشئ ملفك في Setup الخاص بالـ pincab، ثم امسح رمز QR للاتصال المعروض في إعداداته.",
  "deconnexion": "فصل هذا الهاتف",
  "deconnexion_confirme": "فصل هذا الهاتف؟ لن يُحذف الملف ولا النتائج.",
  "realisations": "الإنجازات",
  "aucun_succes": "واصل اللعب لفتح أولى إنجازاتك.",
  "voir_joueurs": "عرض اللاعبين وإنجازاتهم",
  "meilleur_score": "أفضل نتيجة",
  "tables_jouees": "الطاولات التي لُعبت",
  "temps_cumule": "إجمالي وقت اللعب على هذه الطاولة",
  "duree_partie": "مدة اللعبة:",
  "secondes": "ث",
  "joueurs_avec_score": "لاعبون لديهم نتيجة عبر الإنترنت",
  "aucun_joueur_identifie": "لا يوجد لاعب معروف من خلال نتيجة مشتركة",
  "push_titre": "تنبيهات النتائج الكبيرة",
  "push_aide": "تلقَّ إشعارًا عندما يحقق لاعب رقمًا قياسيًا عبر الإنترنت أو يدخل المراكز الثلاثة الأولى.",
  "push_activer": "تفعيل الإشعارات على هذا الهاتف",
  "push_desactiver": "إيقاف الإشعارات على هذا الهاتف",
  "push_active": "الإشعارات مفعّلة على هذا الهاتف.",
  "push_inactive": "الإشعارات غير مفعّلة على هذا الهاتف.",
  "push_non_supporte": "الإشعارات غير متاحة في هذا المتصفح. على iPhone أضف الموقع أولًا إلى الشاشة الرئيسية.",
  "push_refuse": "تم رفض الإذن. غيّر إعدادات الإشعارات في المتصفح لتفعيلها.",
  "push_erreur": "تعذّر تفعيل الإشعارات. تحقق من الاتصال وحاول مرة أخرى.",
  "succes_premier_score": "أول نتيجة",
  "succes_cinq_tables": "5 طاولات",
  "succes_dix_tables": "10 طاولات",
  "succes_premier_podium": "أول منصة تتويج",
  "succes_premier_record": "أول رقم قياسي",
  "succes_cent_scores": "100 نتيجة",
  "temps_jeu": "وقت اللعب المشترك",
  "temps_par_table": "وقت اللعب لكل طاولة",
  "heures": "س",
  "minutes": "د",
  "donnees_qr": "تظهر هنا فقط النتائج المرسلة من pincab يعمل بـ PincabOS.",
  "admin": "الإدارة",
  "cle_admin": "مفتاح الإدارة",
  "approuver": "اعتماد",
  "bloquer": "حظر",
  "debloquer": "إلغاء الحظر",
  "retirer": "سحب",
  "cle_ok": "تم قبول المفتاح: {} pincab مسجّل.",
  "aucun_pincab_admin": "لا يوجد أي pincab مسجّل بعد.",
  "en_attente": "بانتظار الاعتماد",
  "valide": "معتمد",
  "bloque": "محظور",
  "langue": "اللغة",
  "suspects_titre": "نتائج قيد المراجعة",
  "suspects_aide": "نتائج أوقفها الفحص التلقائي. قبول: تدخل النتيجة في الترتيب. رفض: تُحذف.",
  "aucun_suspect": "لا توجد نتائج قيد المراجعة.",
  "accepter": "قبول",
  "refuser": "رفض",
  "record_actuel": "الرقم القياسي الحالي: {}",
  "duree": "المدة: {}",
  "raisons": {
   "pincab_surveille": "pincab تحت المراقبة (عدة نتائج معلّقة)",
   "date_future": "تاريخ اللعبة في المستقبل",
   "partie_trop_courte": "لعبة قصيرة جدًا",
   "partie_trop_longue": "لعبة طويلة جدًا",
   "trop_de_scores": "نتائج كثيرة جدًا في وقت قصير",
   "score_anormal": "نتيجة مرتفعة بشكل غير طبيعي لهذه الطاولة",
   "score_trop_rapide": "نقاط كثيرة جدًا في الثانية لهذه الطاولة"
  }
 }
};
var LANGUES = [["fr", "Français", "fr"], ["en", "English", "gb"], ["es", "Español", "es"], ["it", "Italiano", "it"],
  ["de", "Deutsch", "de"], ["pt", "Português", "pt"], ["ja", "日本語", "jp"], ["zh", "中文", "cn"],
  ["ru", "Русский", "ru"], ["ar", "العربية", "ar"]];
var LANGUE = "fr";
try { var choisie = localStorage.getItem("pincabos_langue"); if (choisie && TEXTES[choisie]) LANGUE = choisie; } catch (e) {}
var T = TEXTES[LANGUE];
document.documentElement.lang = LANGUE;
document.documentElement.dir = LANGUE === "ar" ? "rtl" : "ltr";
var LOCALE = LANGUE === "ar" ? "ar-u-nu-latn" : LANGUE;   // chiffres occidentaux pour les scores
function t(cle) {
  var v = cle.indexOf("erreurs.") === 0 ? (T.erreurs[cle.slice(8)] || T.erreurs.erreur_serveur) : (T[cle] || cle);
  for (var i = 1; i < arguments.length; i++) v = v.replace("{}", arguments[i]);
  return v;
}
function nombre(n) { try { return new Intl.NumberFormat(LOCALE).format(n); } catch (e) { return String(n); } }
function dureeTexte(secondes) {
  secondes = Math.max(0, Number(secondes) || 0);
  var h = Math.floor(secondes / 3600), m = Math.floor((secondes % 3600) / 60);
  return h ? h + " " + T.heures + " " + m + " " + T.minutes : m + " " + T.minutes;
}
function dureePartieTexte(secondes) {
  secondes = Math.max(0, Number(secondes) || 0);
  if (!secondes) return "";
  var texte = secondes < 60 ? Math.round(secondes) + " " + T.secondes : dureeTexte(secondes);
  return " · " + T.duree_partie + " " + texte;
}
function date(iso) {
  try { return new Date(iso).toLocaleString(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
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
    el("div", { class: "entete-droite" }, choixLangue(),
      el("a", { class: "pastille avec-ico", href: "/carte", "aria-label": T.ma_carte, style: "gap:6px;padding:0 12px 0 8px" },
        el("img", { src: "/images/carte.png", alt: "", "aria-hidden": "true", class: "ico" }),
        el("span", { class: "pastille-texte" + (code && window.INITIALES ? "" : " long") },
          code ? (window.INITIALES || T.ma_carte) : T.ma_carte))));
}
// NOUVEAU : menu déroulant des langues, avec le drapeau de chaque langue
function drapeau(l) { return el("img", { src: "/images/drapeaux/" + l[2] + ".svg", alt: "", "aria-hidden": "true", class: "drapeau" }); }
function choixLangue() {
  var actuelle = LANGUES.filter(function (l) { return l[0] === LANGUE; })[0] || LANGUES[0];
  var menu = el("ul", { class: "langue-menu", role: "listbox", "aria-label": T.langue, hidden: "hidden" });
  var bouton = el("button", { type: "button", class: "langue-bouton", "aria-haspopup": "listbox", "aria-expanded": "false",
                              "aria-label": T.langue + " : " + actuelle[1] }, drapeau(actuelle), el("span", { class: "fleche" }, "▾"));
  function fermer() { menu.hidden = true; bouton.setAttribute("aria-expanded", "false"); }
  bouton.addEventListener("click", function (ev) {
    ev.stopPropagation();
    menu.hidden = !menu.hidden;
    bouton.setAttribute("aria-expanded", menu.hidden ? "false" : "true");
  });
  document.addEventListener("click", fermer);
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") fermer(); });
  LANGUES.forEach(function (l) {
    ajouter(menu, el("li", {}, el("button", { type: "button", role: "option", lang: l[0], "aria-selected": l[0] === LANGUE ? "true" : "false",
      class: l[0] === LANGUE ? "actif" : "", onclick: function () {
        try { localStorage.setItem("pincabos_langue", l[0]); } catch (e) {}
        location.reload();
      } }, drapeau(l), el("span", {}, l[1]))));
  });
  return el("div", { class: "langue" }, bouton, menu);
}
function chargement() { afficher(entete(), el("div", { class: "chargement" }, T.chargement)); }
function blocErreur(texte) {
  return el("div", { class: "bloc", style: "align-items:center;text-align:center" },
    el("span", { class: "badge erreur" }, "!"), el("div", {}, texte));
}
function ligneScore(rang, haut, bas, droite, lien, moi, nomTable) {
  var couleur = rang <= 5 ? COULEURS_PLACE[rang - 1] : "#8F9CC8";
  return el(lien ? "a" : "div", { class: "ligne score-rgb" + (moi ? " moi" : ""), href: lien || null },
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
      return ligneScore(s.place, s.table_nom, s.initiales + " · " + s.pincab + " · " + date(s.ajoute) + dureePartieTexte(s.duree_partie),
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
      el("div", { class: "section" }, T.temps_par_table),
      (r.temps_tables || []).length ? el("div", { class: "liste" }, (r.temps_tables || []).map(function (tb) {
        var joueurs = (tb.joueurs || []).map(function (j) { return (j.initiales ? j.initiales + " " : "") + j.pseudo; });
        if (Number(tb.nb_joueurs_identifies || 0) > joueurs.length)
          joueurs.push("+ " + (Number(tb.nb_joueurs_identifies) - joueurs.length));
        return el("a", { class: "ligne", href: tb.table_cle ? "/table?cle=" + encodeURIComponent(tb.table_cle) : null }, wheel(tb.table_nom),
          el("div", { class: "milieu" }, el("b", {}, tb.table_nom),
            el("span", { class: "petit" }, T.temps_cumule),
            el("span", { class: "petit" }, T.joueurs_avec_score + " : " + (joueurs.join(", ") || T.aucun_joueur_identifie))),
          el("div", { class: "droite" }, dureeTexte(tb.temps_jeu)));
      })) : el("div", { class: "vide" }, T.aucun),
      el("div", { class: "pied" }, T.donnees_qr));
  });
}

function carteScore(s, badge) {
  return el("div", { class: "cadre" }, el("div", { class: "bloc" },
    badge,
    wheel(s.table, "grande"),
    el("div", { style: "font-weight:800;font-size:18px" }, s.table),
    el("div", { class: "petit" }, systeme(s.systeme), " · " + s.pincab + (s.date ? " · " + date(s.date) : ""),
      dureePartieTexte(s.duree_partie)),
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
      return ligneScore(s.place, s.table_nom, s.pincab + " · " + date(s.ajoute) + dureePartieTexte(s.duree_partie), nombre(s.score),
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
    var pushEtat = el("div", { class: "petit" }, T.push_inactive);
    var pushBouton = el("button", { type: "button", class: "second", onclick: gererNotificationsPush }, T.push_activer);
    var registrationPush = null, abonnementPush = null;
    var blocPush = el("div", { class: "bloc" }, el("b", {}, T.push_titre),
      el("div", { class: "petit" }, T.push_aide), pushEtat, pushBouton);
    function afficherEtatPush(actif) {
      abonnementPush = actif || null;
      pushBouton.textContent = actif ? T.push_desactiver : T.push_activer;
      pushEtat.textContent = actif ? T.push_active : T.push_inactive;
      pushBouton.disabled = false;
    }
    function inscriptionPush() {
      if (!registrationPush) registrationPush = navigator.serviceWorker.register("/sw.js");
      return registrationPush;
    }
    if (window.isSecureContext && "serviceWorker" in navigator && "PushManager" in window) {
      inscriptionPush().then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
        afficherEtatPush(sub);
        if (sub) {
          var donnees = sub.toJSON();
          api("POST", "/api/push/subscribe", { endpoint: donnees.endpoint,
            p256dh: donnees.keys && donnees.keys.p256dh, auth: donnees.keys && donnees.keys.auth });
        }
      }).catch(function () { pushEtat.textContent = T.push_erreur; });
    } else {
      pushEtat.textContent = T.push_non_supporte;
      pushBouton.disabled = true;
    }
    async function gererNotificationsPush() {
      if (!window.isSecureContext || !("serviceWorker" in navigator) || !("PushManager" in window) || !window.Notification) {
        pushEtat.textContent = T.push_non_supporte; return;
      }
      pushBouton.disabled = true;
      try {
        if (abonnementPush) {
          var resultatSuppression = await api("POST", "/api/push/unsubscribe", { endpoint: abonnementPush.endpoint });
          if (!resultatSuppression.ok) throw new Error(messageErreur(resultatSuppression));
          await abonnementPush.unsubscribe();
          afficherEtatPush(null); return;
        }
        // La demande de permission démarre directement dans le clic, comme l'exigent les navigateurs.
        var permission = window.Notification.permission === "granted" ? Promise.resolve("granted") : window.Notification.requestPermission();
        var autorisation = await permission;
        if (autorisation !== "granted") { pushEtat.textContent = T.push_refuse; pushBouton.disabled = false; return; }
        var configuration = await api("GET", "/api/push/config");
        if (!configuration.ok || !configuration.public_key) throw new Error(T.push_erreur);
        var reg = await inscriptionPush();
        var sub = await reg.pushManager.getSubscription();
        if (!sub) {
          var cle = configuration.public_key.replace(/-/g, "+").replace(/_/g, "/");
          var octets = Uint8Array.from(atob(cle + "=".repeat((4 - cle.length % 4) % 4)), function (c) { return c.charCodeAt(0); });
          sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: octets });
        }
        var jsonSub = sub.toJSON();
        var resultat = await api("POST", "/api/push/subscribe", { endpoint: jsonSub.endpoint,
          p256dh: jsonSub.keys && jsonSub.keys.p256dh, auth: jsonSub.keys && jsonSub.keys.auth });
        if (!resultat.ok) throw new Error(messageErreur(resultat));
        afficherEtatPush(sub);
      } catch (e) {
        pushEtat.textContent = e && e.message ? e.message : T.push_erreur;
        pushBouton.disabled = false;
      }
    }
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
    var nomsRealisations = {   // NOUVEAU : noms des succès dans la langue choisie
      premier_score: T.succes_premier_score, cinq_tables: T.succes_cinq_tables, dix_tables: T.succes_dix_tables,
      premier_podium: T.succes_premier_podium, premier_record: T.succes_premier_record, cent_scores: T.succes_cent_scores
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
          el("div", {}, mi(ico("trophee", "moyenne")), mt(el("div", { class: "grand", style: "color:#FFE27A" }, String(r.stats.records))), el("div", { class: "petit" }, T.records)),
          el("div", {}, mi(ico("podium", "moyenne")), mt(el("div", { class: "grand", style: "color:#FFC83D" }, String(r.stats.podiums))), el("div", { class: "petit" }, T.podiums)),
          el("div", {}, mi(ico("meilleur-score", "moyenne")), mt(el("div", { class: "grand", style: "color:#FFB347" }, String(r.stats.scores))), el("div", { class: "petit" }, T.scores))),
        el("div", { class: "petit avec-ico", style: "justify-content:flex-start;gap:6px" }, mi(ico("table", "petite")), mt(el("span", {}, r.pincabs.length ? T.liee_a + " : " + r.pincabs.map(function (x) { return x.nom; }).join(", ") : T.aucun_pincab))))),
      formPseudo, blocPush, zoneLiens,
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
      return ligneScore(i + 1, l.initiales + "  " + l.pseudo,
        (l.pincab || "") + " · " + date(l.ajoute) + dureePartieTexte(l.duree_partie), nombre(l.score), null,
          window.INITIALES && l.initiales === window.INITIALES && codeCarte());
      });
      afficher(entete(),
        el("div", { style: "display:flex;align-items:center;gap:14px" }, wheel(r.table, "moyenne"),
          el("div", {}, el("h1", { class: "titre", style: "font-size:26px" }, r.table),
            el("div", { class: "petit" }, systeme(r.systeme), vue === "pincab" && r.pincab ? " · " + r.pincab : ""))),
        el("div", { class: "bloc", style: "flex-direction:row;align-items:center;justify-content:space-between" },
          el("span", { class: "petit" }, T.temps_cumule),
          mt(el("span", { class: "grand or" }, dureeTexte(r.temps_jeu)))),
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
      return ligneScore(x.rang, x.table_nom,
        (x.pincab || "") + (x.ajoute ? " · " + date(x.ajoute) : "") + dureePartieTexte(x.duree_partie), nombre(x.score),
        "/table?cle=" + encodeURIComponent(x.table_cle), false, x.table_nom);
    });
    afficher(entete(),
      el("div", { class: "carte-joueur" }, el("div", {}, mt(el("div", { class: "ini" }, r.initiales || "★")),
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
      chargerSuspects();
    });
  }
  // NOUVEAU : scores mis de côté par la vérification automatique (accepter / refuser)
  function chargerSuspects() {
    api("GET", "/api/admin/suspects").then(function (r) {
      if (!r.ok) return;
      ajouter(zone, el("div", { class: "section" }, T.suspects_titre + " (" + r.suspects.length + ")"),
        el("div", { class: "petit" }, T.suspects_aide));
      if (!r.suspects.length) { ajouter(zone, el("div", { class: "vide" }, T.aucun_suspect)); return; }
      r.suspects.forEach(function (x) {
        function decider(accepter) { api("POST", "/api/admin/suspect", { id: x.id, accepter: accepter }).then(charger); }
        ajouter(zone, el("div", { class: "bloc", style: "padding:12px" },
          el("b", {}, x.table_nom),
          el("span", { class: "petit", style: "font-weight:800;color:#FFC83D" }, (T.raisons[x.raison] || x.raison)),
          el("span", { class: "or", style: "font-family:Anton,Impact,sans-serif;font-size:22px" }, nombre(x.score)),
          el("span", { class: "petit" }, (x.pseudo || "") + " (" + x.initiales + ") · " + x.pincab + " · " + date(x.recu)),
          el("span", { class: "petit" }, t("record_actuel", x.record ? nombre(x.record) : "—") +
            dureePartieTexte(x.duree_partie)),
          el("div", { class: "deux" },
            el("button", { type: "button", onclick: function () { decider(true); } }, T.accepter),
            el("button", { type: "button", class: "second", onclick: function () { decider(false); } }, T.refuser))));
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
