import json, hmac, hashlib, base64, time, urllib.request, uuid
BASE = "http://127.0.0.1:8787"

def b64(o): return base64.urlsafe_b64encode(o).rstrip(b"=").decode()
def signer(secret, donnees):      # exactement ce que fera PincabOS
    p = b64(json.dumps(donnees, separators=(",", ":"), ensure_ascii=False).encode())
    g = b64(hmac.new(secret.encode(), p.encode(), hashlib.sha256).digest()[:16])
    return p, g
def appel(meth, chemin, corps=None, code=None, admin=None):
    req = urllib.request.Request(BASE + chemin, method=meth, data=json.dumps(corps).encode() if corps is not None else None,
                                 headers={"content-type": "application/json"})
    if code: req.add_header("authorization", "Bearer " + code)
    if admin: req.add_header("x-admin-cle", admin)
    try:
        with urllib.request.urlopen(req) as r: return json.load(r)
    except urllib.error.HTTPError as e: return json.load(e)
def score_qr(pc, ini, sc, table="VPX:afm_113b", nom="Attack from Mars"):
    return signer(pc["secret"], {"v": 1, "pc": pc["id"], "t": table, "n": nom, "sy": "VPX", "sc": sc, "i": ini,
                                 "d": "2026-11-02T13:12", "u": uuid.uuid4().hex[:20]})
def lien_qr(pc, duree=600):
    return signer(pc["secret"], {"v": 1, "pc": pc["id"], "k": "lien", "x": int(time.time()) + duree})
def ok(nom, cond, detail=""): print(("OK   " if cond else "ÉCHEC"), nom, detail if not cond else "")

A = appel("POST", "/api/pincab/activer", {"nom": "Pincab de Daniel"})
B = appel("POST", "/api/pincab/activer", {"nom": "Pincab de Kris"})
ok("activation des pincabs", A["ok"] and B["ok"])
dan = appel("POST", "/api/carte", {"pseudo": "Daniel", "initiales": "dan"})
bob = appel("POST", "/api/carte", {"pseudo": "Bobby", "initiales": "BOB"})
dan2 = appel("POST", "/api/carte", {"pseudo": "Dan l'autre", "initiales": "DAN"})
krs = appel("POST", "/api/carte", {"pseudo": "Kris", "initiales": "KRS"})
ok("création des cartes (initiales mises en majuscules)", dan["ok"] and dan["initiales"] == "DAN", dan)
ok("restauration avec le code de secours", appel("POST", "/api/carte/restaurer", {"code": dan["code"].lower()})["ok"])
ok("code faux refusé", appel("POST", "/api/carte/restaurer", {"code": "AAAA-BBBB-CCCC-DDDD-EEEE-FFFF"})["erreur"] == "code_inconnu")

p, g = lien_qr(A)
ok("DAN lie sa carte au pincab A", appel("POST", "/api/lier", {"p": p, "g": g}, dan["code"]).get("ok"))
ok("BOB lie sa carte au pincab A", appel("POST", "/api/lier", {"p": p, "g": g}, bob["code"]).get("ok"))
r = appel("POST", "/api/lier", {"p": p, "g": g}, dan2["code"])
ok("un 2e DAN ne peut pas se lier au même pincab", r.get("erreur") == "initiales_prises", r)
p2, g2 = lien_qr(B)
ok("le 2e DAN peut se lier à un AUTRE pincab", appel("POST", "/api/lier", {"p": p2, "g": g2}, dan2["code"]).get("ok"))
ok("KRS se lie au pincab B", appel("POST", "/api/lier", {"p": p2, "g": g2}, krs["code"]).get("ok"))
pe, ge = lien_qr(A, duree=-10)
ok("QR de liaison expiré refusé", appel("POST", "/api/lier", {"p": pe, "g": ge}, krs["code"]).get("erreur") == "qr_expire")

# --- scores
p, g = score_qr(A, "DAN", 4875320150)
u_dan = json.loads(base64.urlsafe_b64decode(p + "=" * (-len(p) % 4)))["u"]
v = appel("POST", "/api/verifier", {"p": p, "g": g})
ok("scan sans carte : score affiché, rien de publié", v["ok"] and v["carte"] is None and v["deja"] is None, v)
r = appel("POST", "/api/score", {"p": p, "g": g}, bob["code"])
ok("BOB ne peut pas prendre le score de DAN", r.get("erreur") == "initiales_differentes", r)
r = appel("POST", "/api/score", {"p": p, "g": g}, dan2["code"])
ok("le DAN d'un autre pincab ne peut pas le prendre", r.get("erreur") == "carte_non_liee", r)
r = appel("POST", "/api/score", {"p": p, "g": g}, dan["code"])
ok("DAN confirme : score en ligne", r.get("ok"), r)
r = appel("POST", "/api/score", {"p": p, "g": g}, dan["code"])
ok("2e scan du même QR refusé", r.get("erreur") == "deja_en_ligne", r)
v = appel("POST", "/api/verifier", {"p": p, "g": g})
ok("2e scan : « déjà en ligne, par DAN »", v["deja"] and v["deja"]["initiales"] == "DAN", v)

# --- triche
d = json.loads(base64.urlsafe_b64decode(p + "=" * (-len(p) % 4)))
d["sc"] = 99999999999; d["u"] = "triche-123456"
pt = b64(json.dumps(d, separators=(",", ":")).encode())
r = appel("POST", "/api/verifier", {"p": pt, "g": g})
ok("QR modifié à la main (score gonflé) refusé", r.get("erreur") == "signature_invalide", r)
faux = {"id": A["id"], "secret": "je-devine-la-cle"}
pf, gf = score_qr(faux, "DAN", 123)
ok("QR signé avec une fausse clé refusé", appel("POST", "/api/verifier", {"p": pf, "g": gf}).get("erreur") == "signature_invalide")
p0, g0 = score_qr(A, "", 5000)
ok("score sans initiales refusé", appel("POST", "/api/score", {"p": p0, "g": g0}, dan["code"]).get("erreur") == "score_sans_initiales")

# --- classements
p, g = score_qr(A, "BOB", 3120000000); appel("POST", "/api/score", {"p": p, "g": g}, bob["code"])
p, g = score_qr(B, "KRS", 9812004500); appel("POST", "/api/score", {"p": p, "g": g}, krs["code"])
p, g = score_qr(A, "DAN", 1000); appel("POST", "/api/score", {"p": p, "g": g}, dan["code"])   # moins bon : n'écrase pas
t = appel("GET", "/api/table?cle=VPX:afm_113b&pc=" + A["id"])
ok("classement du pincab A (meilleur score par joueur)", [l["initiales"] for l in t["lignes"]] == ["DAN", "BOB"] and t["lignes"][0]["score"] == 4875320150, t["lignes"])
t = appel("GET", "/api/table?cle=VPX:afm_113b")
ok("« Tous les pincabs » vide tant qu'aucun pincab n'est validé", t["lignes"] == [], t["lignes"])
ok("admin : mauvaise clé refusée", appel("GET", "/api/admin/pincabs", admin="nimporte")["erreur"] == "acces_refuse")
for pc in (A, B): appel("POST", "/api/admin/pincab", {"id": pc["id"], "approuve": True, "bloque": False}, admin="cle-admin-de-test-123")
t = appel("GET", "/api/table?cle=VPX:afm_113b")
ok("après validation : KRS, DAN, BOB", [l["initiales"] for l in t["lignes"]] == ["KRS", "DAN", "BOB"], t["lignes"])
appel("POST", "/api/admin/pincab", {"id": B["id"], "approuve": True, "bloque": True}, admin="cle-admin-de-test-123")
t = appel("GET", "/api/table?cle=VPX:afm_113b")
ok("pincab B bloqué : ses scores disparaissent", [l["initiales"] for l in t["lignes"]] == ["DAN", "BOB"], t["lignes"])
p, g = score_qr(B, "KRS", 5)
ok("pincab bloqué : nouveaux QR refusés", appel("POST", "/api/verifier", {"p": p, "g": g}).get("erreur") == "pincab_bloque")
s = appel("POST", "/api/pincab/statut", {"pc": A["id"], "ids": [u_dan, "inconnu"]})
ok("statut « ✓ en ligne » pour le pincab", s["en_ligne"] == [u_dan], s)
c = appel("GET", "/api/carte", code=dan["code"])
ok("carte de DAN : 2 scores, 1 record", c["stats"]["scores"] == 2 and c["stats"]["records"] == 1, c["stats"])
a = appel("GET", "/api/accueil")
ok("accueil : statistiques", a["stats"]["joueurs"] == 4, a["stats"])
print("Longueur d'un QR de score :", len(BASE.replace("http://127.0.0.1:8787", "https://pincab-scores.arcadepassion.workers.dev") + "/s?p=" + p + "&g=" + g), "caractères")
