# NOUVEAU : vérifications des images de profil (site lancé en local : npx wrangler dev --local)
import io, json, hmac, hashlib, base64, sys, time, uuid, urllib.request, urllib.error
from PIL import Image

BASE = "http://127.0.0.1:8787"
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
ESSAI = uuid.uuid4().hex[:5]
ECHECS = []


def b64(o): return base64.urlsafe_b64encode(o).rstrip(b"=").decode()
def signer(secret, donnees):
    p = b64(json.dumps(donnees, separators=(",", ":"), ensure_ascii=False).encode())
    g = b64(hmac.new(secret.encode(), p.encode(), hashlib.sha256).digest()[:16])
    return p, g
def appel(meth, chemin, corps=None, code=None):
    req = urllib.request.Request(BASE + chemin, method=meth, data=json.dumps(corps).encode() if corps is not None else None,
                                 headers={"content-type": "application/json"})
    if code: req.add_header("authorization", "Bearer " + code)
    try:
        with urllib.request.urlopen(req) as r: return json.load(r)
    except urllib.error.HTTPError as e: return json.load(e)
def lire(chemin):
    with urllib.request.urlopen(BASE + chemin) as r:
        return r.status, r.headers.get("content-type"), r.headers.get("cache-control"), r.read()
def ok(nom, cond, detail=""):
    print(("OK   " if cond else "ÉCHEC"), nom, detail if not cond else "")
    if not cond: ECHECS.append(nom)
def image(format_, taille=(300, 200), images=1):
    tampon = io.BytesIO()
    if images > 1:
        cadres = [Image.new("RGB", taille, (40 * i, 120, 200)) for i in range(images)]
        cadres[0].save(tampon, format_, save_all=True, append_images=cadres[1:], duration=100, loop=0)
    else:
        Image.new("RGB", taille, (200, 60, 30)).save(tampon, format_)
    return tampon.getvalue()


pc = appel("POST", "/api/pincab/activer", {"nom": "Pincab avatar " + ESSAI})
joueur = appel("POST", "/api/carte", {"pseudo": "Avatar " + ESSAI, "initiales": "AVA"})
ok("carte créée", joueur.get("ok") and pc.get("ok"), joueur)
code, cid = joueur["code"], joueur["id"]
ok("pas d'image au départ", appel("GET", "/api/carte", code=code).get("av") is None)
ok("envoi refusé sans carte", appel("POST", "/api/carte/avatar", {"img": b64(image("PNG"))}).get("erreur") == "carte_requise")
ok("fichier qui n'est pas une image refusé",
   appel("POST", "/api/carte/avatar", {"img": b64(b"<html>pas une image</html>")}, code).get("erreur") == "avatar_invalide")
ok("image trop lourde refusée",
   appel("POST", "/api/carte/avatar", {"img": b64(b"\x89PNG" + b"0" * 1300000)}, code).get("erreur") == "avatar_trop_lourde")
for fmt in ("PNG", "JPEG", "WEBP", "AVIF"):
    r = appel("POST", "/api/carte/avatar", {"img": b64(image(fmt))}, code)
    ok("envoi " + fmt, r.get("ok") and r.get("av"), r)
gif = image("GIF", (256, 256), images=6)
r = appel("POST", "/api/carte/avatar", {"img": b64(gif)}, code)
ok("envoi GIF animé", r.get("ok"), r)
av = r.get("av")
ok("la carte connaît la version", appel("GET", "/api/carte", code=code).get("av") == av)
ok("« existe » donne la version (pour le Setup / Frontend)", appel("POST", "/api/carte/existe", {}, code).get("av") == av)
ok("fiche publique du joueur", appel("GET", "/api/joueur?id=" + cid).get("av") == av)
statut, type_, garde, octets = lire("/api/avatar?id=" + cid + "&v=" + av)
ok("image servie telle quelle (animation gardée)", statut == 200 and type_ == "image/gif" and octets == gif, (statut, type_))
ok("gardée un an quand la version est donnée", "immutable" in (garde or ""), garde)
# un score partagé -> l'image apparaît dans le classement de la table et la liste des joueurs
p, g = signer(pc["secret"], {"v": 1, "pc": pc["id"], "k": "lien", "x": int(time.time()) + 600})
ok("carte liée au pincab", appel("POST", "/api/lier", {"p": p, "g": g}, code).get("ok"))
table = "VPX:avatar_" + ESSAI
p, g = signer(pc["secret"], {"v": 1, "pc": pc["id"], "t": table, "n": "Avatar " + ESSAI, "sy": "VPX", "sc": 4242420,
                             "i": "AVA", "d": "2026-11-12T13:12", "u": uuid.uuid4().hex[:20]})
ok("score partagé", appel("POST", "/api/score", {"p": p, "g": g}, code).get("ok"))
lignes = appel("GET", "/api/table?cle=" + table).get("lignes") or []
ok("classement de la table : version de l'image", any(l.get("carte_id") == cid and l.get("av") == av for l in lignes), lignes)
joueurs = appel("GET", "/api/joueurs").get("joueurs") or []
ok("liste des joueurs : version de l'image", any(j.get("carte_id") == cid and j.get("av") == av for j in joueurs))
ok("admin : liste refusée sans clé", appel("GET", "/api/admin/avatars").get("erreur") == "acces_refuse")
ok("admin : retrait refusé sans clé", appel("POST", "/api/admin/avatar/retirer", {"id": cid}).get("erreur") == "acces_refuse")
ok("retrait de l'image", appel("POST", "/api/carte/avatar/retirer", {}, code).get("ok"))
ok("plus de version après retrait", appel("GET", "/api/carte", code=code).get("av") is None)
try:
    lire("/api/avatar?id=" + cid)
    ok("image introuvable après retrait", False)
except urllib.error.HTTPError as e:
    ok("image introuvable après retrait", e.code == 404)
appel("POST", "/api/carte/avatar", {"img": b64(image("PNG"))}, code)
ok("effacement du profil", appel("POST", "/api/carte/effacer", {}, code).get("ok"))
try:
    lire("/api/avatar?id=" + cid)
    ok("image effacée avec le profil", False)
except urllib.error.HTTPError as e:
    ok("image effacée avec le profil", e.code == 404)
print("Toutes les vérifications sont OK" if not ECHECS else f"{len(ECHECS)} échec(s)")
sys.exit(1 if ECHECS else 0)
