"""Efectos grabados de Mixkit (reemplazan a los sintetizados, a pedido del dueño).

Los mp3 viven en assets/sfx/ y no se suben al repositorio (la licencia no permite
redistribuirlos): se bajan con studio/audio/fetch_music.sh. La lista está en kit.json.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
SFX_DIR = HERE.parents[1] / "assets" / "sfx"
KIT = json.loads((HERE / "kit.json").read_text())


@lru_cache(maxsize=None)
def _load(name: str) -> np.ndarray:
    from build import load_track  # import tardío: build importa este módulo

    x = load_track(SFX_DIR / f"mixkit-sfx-{KIT[name]['id']}.mp3")
    env = np.abs(x).max(axis=0)
    start = int(np.argmax(env > env.max() * 0.02))
    x = x[:, max(0, start - 48):]
    return x / (np.abs(x).max() + 1e-9)


def k(name: str, length_s: float | None = None) -> np.ndarray:
    """Devuelve el efecto (estéreo, pico 1). Con length_s se recorta con un fundido corto."""
    x = _load(name).copy()
    if length_s is not None:
        from build import SR

        n = min(x.shape[1], int(length_s * SR))
        x = x[:, :n]
        f = min(n, int(0.08 * SR))
        x[:, -f:] *= np.linspace(1, 0, f)
    return x
