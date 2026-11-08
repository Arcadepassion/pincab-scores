"""Régénère src/wheels_mediatheque.js : la liste des wheels (noms exacts, majuscules comprises) de la
médiathèque GitHub Arcadepassion/pincab_os-media-library (dossier wheel/).
Usage : python outils/generer_liste_wheels.py"""
import json, os, urllib.request

URL = "https://api.github.com/repos/Arcadepassion/pincab_os-media-library/git/trees/main:wheel"
req = urllib.request.Request(URL, headers={"User-Agent": "pincab-scores-outil"})
arbre = json.load(urllib.request.urlopen(req, timeout=60))
if arbre.get("truncated"):
    raise SystemExit("Liste tronquée par GitHub : rien n'est écrit.")
noms = sorted({e["path"][:-4] for e in arbre.get("tree", []) if e["path"].lower().endswith(".png")}, key=str.lower)
sortie = os.path.join(os.path.dirname(__file__), "..", "src", "wheels_mediatheque.js")
with open(sortie, "w", encoding="utf-8", newline="\n") as f:
    f.write("// Généré par outils/generer_liste_wheels.py : noms exacts des wheels de la médiathèque GitHub\n")
    f.write("// (dossier wheel/). Sert à retrouver « BioLab.png » quand la table s'appelle « Biolab ».\n")
    f.write("export const WHEELS_MEDIATHEQUE = " + json.dumps(noms, ensure_ascii=False) + ";\n")
print(f"{len(noms)} wheels écrites dans {os.path.normpath(sortie)}")
