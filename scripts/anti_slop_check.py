#!/usr/bin/env python3
"""Revisa guiones, subtítulos y componentes de video contra las reglas de la skill anti-slop.

Uso: python3 scripts/anti_slop_check.py <archivo o carpeta> [...]
Sale con código 1 si encuentra errores. Las advertencias no bloquean pero hay que revisarlas.
"""
import re
import sys
from pathlib import Path

TEXT_EXT = {".srt", ".vtt", ".txt", ".md"}
CODE_EXT = {".tsx", ".jsx", ".ts", ".js", ".html", ".css", ".json"}
SKIP_DIRS = {"node_modules", ".git", "out", "build", "dist", ".claude"}

DASHES = re.compile(r"[–—―]")
LOOSE_DASH = re.compile(r"\w \- \w")
EMOJI = re.compile(
    "[\U0001F300-\U0001FAFF\U00002700-\U000027BF\U0001F000-\U0001F02F\U00002600-\U000026FF]"
)
BANNED = [
    "sabías que", "en este video te voy a mostrar", "imaginá un mundo", "en el mundo actual",
    "hoy en día", "revolucion", "potenci", "desbloque", "transformá tu negocio",
    "transforma tu negocio", "siguiente nivel", "sin precedentes", "game changer",
    "el futuro es ahora", "sinergia", "solución integral", "de vanguardia", "innovador",
    "estás listo para dar el salto",
]
BANNED_RE = re.compile("|".join(re.escape(b) for b in BANNED), re.IGNORECASE)

CODE_WARNINGS = [
    (re.compile(r"text-?align\s*[:=]\s*['\"]?(left|right|start|end)", re.I),
     "texto no centrado (regla 4)"),
    (re.compile(r"background-?clip\s*[:=]\s*['\"]?text|WebkitBackgroundClip", re.I),
     "texto con degradé: posible keyword en color (regla 3)"),
    (re.compile(r"text-?transform\s*[:=]\s*['\"]?uppercase", re.I),
     "mayúsculas: posible etiqueta/eyebrow arriba de un título (regla 1)"),
    (re.compile(r"<span[^>]*style=\{?\{?[^>]*\bcolor\s*:", re.I),
     "span con color propio: posible keyword en color (regla 3)"),
    (re.compile(r"typewriter|bounce|elastic|glitch", re.I),
     "efecto de plantilla (regla 5)"),
]


def iter_files(paths):
    for p in map(Path, paths):
        if p.is_dir():
            for f in p.rglob("*"):
                if f.is_file() and not SKIP_DIRS.intersection(f.parts):
                    yield f
        elif p.is_file():
            yield p


def check(path):
    errors, warnings = [], []
    ext = path.suffix.lower()
    if ext not in TEXT_EXT | CODE_EXT:
        return errors, warnings
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except (UnicodeDecodeError, OSError):
        return errors, warnings
    for n, line in enumerate(lines, 1):
        loc = f"{path}:{n}"
        if DASHES.search(line):
            errors.append(f"{loc}: guion largo/medio (regla 2): {line.strip()[:90]}")
        if ext in TEXT_EXT and LOOSE_DASH.search(line):
            errors.append(f"{loc}: ' - ' usado como guion (regla 2): {line.strip()[:90]}")
        if EMOJI.search(line):
            errors.append(f"{loc}: emoji: {line.strip()[:90]}")
        m = BANNED_RE.search(line)
        if m:
            errors.append(f"{loc}: frase de IA prohibida '{m.group(0)}': {line.strip()[:90]}")
        if ext in CODE_EXT:
            for rx, msg in CODE_WARNINGS:
                if rx.search(line):
                    warnings.append(f"{loc}: {msg}")
    return errors, warnings


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    all_err, all_warn = [], []
    for f in iter_files(sys.argv[1:]):
        e, w = check(f)
        all_err += e
        all_warn += w
    for w in all_warn:
        print("AVISO  " + w)
    for e in all_err:
        print("ERROR  " + e)
    print(f"\n{len(all_err)} errores, {len(all_warn)} avisos")
    return 1 if all_err else 0


if __name__ == "__main__":
    sys.exit(main())
