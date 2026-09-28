"""Librería de efectos de sonido de AIRIS, sintetizados (originales, sin licencias).

Nada de sonidos de memes ni del sistema (skill anti-slop). Cada función devuelve un array
estéreo (2, n) a 48 kHz, normalizado a pico ~0.9.
"""
from __future__ import annotations

import numpy as np

from engine import (SR, adsr, bandpass, bell, exp_decay, fade, felt_piano, highpass, lowpass, n2f,
                    noise, reverb, secs, sine, stereo, sweep_filter, tri)


def _norm(x: np.ndarray, peak: float = 0.9) -> np.ndarray:
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def whoosh(dur: float = 0.75, lo: float = 350, hi: float = 3800, pan_from: float = -0.6, pan_to: float = 0.6) -> np.ndarray:
    """Aire que pasa: ruido rosa con filtro que barre y paneo que cruza."""
    n = secs(dur)
    x = noise(dur, "pink")
    t = np.linspace(0, 1, n)
    shape = np.sin(np.pi * np.clip(t / 0.62, 0, 1)) ** 1.5 * (t < 0.62) + (t >= 0.62) * np.exp(-(t - 0.62) * 9)
    cut = lo + (hi - lo) * shape
    y = sweep_filter(x, cut, "band") * shape
    left = y * np.cos((np.interp(t, [0, 1], [pan_from, pan_to]) + 1) * np.pi / 4)
    right = y * np.sin((np.interp(t, [0, 1], [pan_from, pan_to]) + 1) * np.pi / 4)
    return _norm(reverb(np.stack([left, right]), 0.18, 1.2, 0.5), 0.8)


def whoosh_low(dur: float = 1.1) -> np.ndarray:
    w = whoosh(dur, 120, 1400, -0.3, 0.3)
    n = w.shape[1]
    sub = sine(np.linspace(90, 45, n), n / SR) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 * 0.6
    return _norm(w + stereo(sub, 0), 0.85)


def pop(semitone: int = 0, dur: float = 0.16) -> np.ndarray:
    """Pop suave de burbuja; el semitono permite escalas ascendentes."""
    n = secs(dur)
    f0 = 620 * 2 ** (semitone / 12)
    f = f0 * (1 + 0.6 * np.exp(-np.arange(n) / secs(0.012)))
    body = sine(f, dur) * exp_decay(n, 0.045)
    click = bandpass(noise(dur), 2500, 7000) * exp_decay(n, 0.0025) * 0.35
    x = lowpass(body + click, 6000)
    return _norm(reverb(stereo(x, 0.05 * semitone / 12), 0.12, 0.8, 0.3), 0.75)


def tick(bright: float = 1.0, dur: float = 0.06) -> np.ndarray:
    n = secs(dur)
    x = bandpass(noise(dur), 2800, 7500) * exp_decay(n, 0.004) + sine(2100 * bright, dur) * exp_decay(n, 0.006) * 0.4
    return _norm(stereo(x, 0), 0.6)


def tick_roll(dur: float = 0.7, count: int = 11) -> np.ndarray:
    """Dígitos que ruedan: ticks que se desaceleran."""
    out = np.zeros((2, secs(dur) + secs(0.1)))
    for k in range(count):
        t = dur * (k / (count - 1)) ** 1.8
        tk = tick(1.0 + 0.02 * k)
        i = secs(t)
        out[:, i:i + tk.shape[1]] += tk * (0.55 + 0.45 * k / count)
    return _norm(out, 0.7)


def ding(note: str = "E6") -> np.ndarray:
    x = bell(n2f(note), 1.6)
    return _norm(reverb(stereo(x, 0.1), 0.28, 1.8, 0.7, 7000), 0.8)


def confirm() -> np.ndarray:
    """Dos notas de confirmación (tarjeta con check)."""
    out = np.zeros((2, secs(1.8)))
    for note, at, g in [("C6", 0.0, 0.8), ("G6", 0.085, 1.0)]:
        b = bell(n2f(note), 1.5)
        i = secs(at)
        out[:, i:i + len(b)] += stereo(b, 0.08) * g
    return _norm(reverb(out, 0.25, 1.8, 0.7, 7500), 0.8)


def impact(dur: float = 2.6) -> np.ndarray:
    """Golpe grave con cola, para el logo."""
    n = secs(dur)
    t = np.arange(n) / SR
    sub = sine(40 + 30 * np.exp(-t / 0.08), dur) * exp_decay(n, 0.55)
    thump = lowpass(noise(dur), 250) * exp_decay(n, 0.05) * 1.5
    air = bandpass(noise(dur), 1500, 9000) * exp_decay(n, 0.25) * 0.12
    x = np.tanh((sub + thump) * 1.3) + air
    return _norm(reverb(stereo(x, 0), 0.35, 3.0, 1.4, 4000), 0.9)


def shimmer(dur: float = 2.8) -> np.ndarray:
    """Brillo aireado que acompaña al logo (acorde de campanas muy suave)."""
    out = np.zeros((2, secs(dur)))
    for i, note in enumerate(["C6", "E6", "G6", "B6", "D7"]):
        b = bell(n2f(note), dur - 0.3) * 0.5
        j = secs(0.05 * i)
        out[:, j:j + len(b)] += stereo(b, -0.6 + 0.3 * i)
    return _norm(reverb(out, 0.5, 3.2, 1.6, 9000), 0.55)


def riser(dur: float = 1.6) -> np.ndarray:
    n = secs(dur)
    t = np.linspace(0, 1, n)
    x = noise(dur, "pink") * t ** 2
    y = sweep_filter(x, 300 + 7000 * t ** 2, "low")
    tone = sine(np.geomspace(180, 900, n), dur) * t ** 3 * 0.25
    out = (y + tone) * np.clip((1 - t) * 40, 0, 1)
    return _norm(reverb(stereo(out, 0), 0.2, 1.5, 0.6), 0.7)


def reverse_swell(dur: float = 1.0) -> np.ndarray:
    """Chupón hacia el corte (reverb invertida)."""
    base = reverb(stereo(felt_piano(n2f("E4"), 1.2), 0), 0.8, 2.2, 1.0)
    rev = base[:, ::-1][:, -secs(dur):]
    t = np.linspace(0, 1, rev.shape[1])
    return _norm(rev * t ** 2, 0.7)


def phone_ring(dur: float = 1.05) -> np.ndarray:
    """Timbre propio: trino suave de dos tonos (no es el del iPhone)."""
    n = secs(dur)
    t = np.arange(n) / SR
    trill = (np.sin(2 * np.pi * 14 * t) > 0).astype(float)
    trill = lowpass(trill, 200)
    tone = sine(1175, dur) * trill + sine(1480, dur) * (1 - trill)
    tone += 0.25 * sine(2350, dur) * trill
    env = adsr(n, 0.02, 0.1, 0.9, 0.08)
    x = lowpass(tone * env, 5000)
    return _norm(reverb(stereo(x, 0), 0.18, 1.0, 0.4), 0.55)


def pickup() -> np.ndarray:
    n = secs(0.25)
    click = bandpass(noise(0.25), 1500, 6000) * exp_decay(n, 0.003)
    blip = sine(np.linspace(620, 930, n), 0.25) * adsr(n, 0.005, 0.05, 0.4, 0.12) * 0.5
    return _norm(stereo(click + blip, 0), 0.6)


def hangup() -> np.ndarray:
    out = np.zeros(secs(0.45))
    for f, at in [(880, 0.0), (660, 0.12)]:
        n = secs(0.16)
        b = sine(f, 0.16) * adsr(n, 0.004, 0.04, 0.5, 0.08)
        i = secs(at)
        out[i:i + n] += b
    return _norm(reverb(stereo(out, 0), 0.15, 0.9, 0.3), 0.5)


def transfer() -> np.ndarray:
    out = np.zeros(secs(1.2))
    for note, at in [("A5", 0.0), ("C#6", 0.11), ("E6", 0.22)]:
        n = secs(0.5)
        b = sine(n2f(note), 0.5) * adsr(n, 0.006, 0.08, 0.3, 0.3)
        i = secs(at)
        out[i:i + n] += b
    return _norm(reverb(stereo(out, 0), 0.3, 1.4, 0.6), 0.55)


def alert() -> np.ndarray:
    out = np.zeros(secs(0.9))
    for note, at in [("E5", 0.0), ("C5", 0.16)]:
        n = secs(0.4)
        b = tri(n2f(note), 0.4) * adsr(n, 0.01, 0.1, 0.4, 0.2)
        i = secs(at)
        out[i:i + n] += lowpass(b, 2500)
    return _norm(reverb(stereo(out, 0), 0.25, 1.2, 0.5), 0.5)


def beep_voicemail() -> np.ndarray:
    n = secs(0.5)
    x = sine(1000, 0.5) * adsr(n, 0.005, 0.01, 1.0, 0.03)
    x[secs(0.38):] = 0
    return _norm(stereo(lowpass(x, 3000), 0), 0.45)


def tape_hiss(dur: float) -> np.ndarray:
    x = bandpass(noise(dur), 1500, 9000) * 0.08 + lowpass(noise(dur, "pink"), 400) * 0.1
    return stereo(x, 0) * 0.5


def thud() -> np.ndarray:
    """Golpe apagado para lo que no se resolvió (lado viejo)."""
    n = secs(0.3)
    x = sine(np.linspace(160, 90, n), 0.3) * exp_decay(n, 0.05) + lowpass(noise(0.3), 500) * exp_decay(n, 0.02) * 0.5
    return _norm(stereo(x, 0), 0.5)


def note(name: str, dur: float = 3.0, vel: float = 0.8) -> np.ndarray:
    """Nota única de piano suave, con aire."""
    return _norm(reverb(stereo(felt_piano(n2f(name), dur, vel), 0), 0.4, 3.0, 1.4, 5000), 0.7 * vel)


def swish() -> np.ndarray:
    return whoosh(0.35, 1500, 6000, -0.2, 0.2) * 0.5
