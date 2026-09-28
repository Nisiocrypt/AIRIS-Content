"""Arma la banda sonora de cada video: música con partitura propia + efectos en los mismos
frames que la animación (los tiempos se leen de los archivos .tsx, fuente única de verdad).

Uso: python3 audio/build.py [v1 v2 ...]   (sin argumentos arma los 8)
Salida: ../output/audio/vN.wav (48 kHz, 24 bits, -14 LUFS, pico real <= -1 dBTP)
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
import sfx as S  # noqa: E402
from engine import (SR, adsr, bandpass, chord_pad, clap, db, hat, highpass, kick, lowpass, master,  # noqa: E402
                    n2f, noise, place, pluck, reverb, saw, secs, sine, stereo)

ROOT = Path(__file__).resolve().parents[1]
VIDEOS = ROOT / "src" / "videos"
OUT = ROOT.parent / "output" / "audio"
FPS = 30


def consts(file: str, name: str) -> dict[str, float]:
    src = (VIDEOS / file).read_text()
    m = re.search(r"export const %s = \{(.*?)\};" % name, src, re.S)
    if not m:
        raise SystemExit(f"No encontré {name} en {file}")
    return {k: float(v) for k, v in re.findall(r"(\w+):\s*([0-9.]+)\s*,", m.group(1))}


def f2s(frame: float) -> float:
    return frame / FPS


# ------------------------------------------------------------------ capas musicales

def pads(bus, segments, cutoff_scale=1.0):
    """segments: (inicio, fin, notas, ganancia, corte). El que arranca en 0 entra rápido."""
    for start, end, notes, gain, cutoff in segments:
        dur = end - start + 1.6
        attack = 0.12 if start <= 0.01 else min(1.2, (end - start) * 0.35)
        clip = chord_pad(notes, dur, gain=gain, cutoff=cutoff * cutoff_scale, attack=attack, release=1.4)
        place(bus, clip, start)


def arp(bus, start, end, notes, bpm, gain=0.35, bright=0.5, step=0.5, pattern=None, seed=0, pan_spread=0.5):
    """Arpegio de cuerdas pulsadas en corcheas (step=0.5 de pulso)."""
    rng = np.random.default_rng(seed)
    beat = 60 / bpm
    t = start
    k = 0
    pattern = pattern or list(range(len(notes))) + list(range(len(notes) - 2, 0, -1))
    while t < end:
        idx = pattern[k % len(pattern)]
        f = n2f(notes[idx % len(notes)])
        vel = 0.75 + 0.25 * rng.random()
        if k % 4 == 0:
            vel *= 1.15
        clip = stereo(pluck(f, 1.1, bright), pan_spread * np.sin(k * 1.3))
        place(bus, clip, t + rng.normal(0, 0.004), gain * vel)
        t += beat * step
        k += 1


def pulse(bus, start, end, bpm, gain=0.25, every=1.0, kind="sub"):
    beat = 60 / bpm
    t = start
    while t < end - 0.05:
        if kind == "sub":
            n = secs(0.5)
            x = sine(np.linspace(70, 48, n), 0.5) * adsr(n, 0.004, 0.1, 0.3, 0.3)
            place(bus, stereo(lowpass(x, 180), 0), t, gain)
        elif kind == "kick":
            place(bus, stereo(kick(0.45), 0), t, gain)
        elif kind == "tick":
            place(bus, S.tick(0.8), t, gain)
        elif kind == "heart":
            for off, g in [(0, 1.0), (0.22, 0.6)]:
                n = secs(0.35)
                x = sine(np.linspace(60, 40, n), 0.35) * adsr(n, 0.003, 0.08, 0.2, 0.2)
                place(bus, stereo(lowpass(x, 150), 0), t + off, gain * g)
        t += beat * every


def drone(bus, start, end, notes, gain=0.4, cutoff=500):
    dur = end - start + 1.5
    out = np.zeros((2, secs(dur)))
    for i, nm in enumerate(notes):
        f = n2f(nm)
        s = saw(f, dur) * 0.4 + sine(f, dur)
        out += stereo(lowpass(s, cutoff), (-0.4 if i % 2 else 0.4))
    n = out.shape[1]
    env = adsr(n, min(2.0, dur * 0.3), 0.5, 0.9, 1.5)
    place(bus, out * env / len(notes), start, gain)


def drums_v5(bus, start, end, bpm=120, clap_from=None, hats_from=None, bass=None, gain=1.0):
    beat = 60 / bpm
    t = start
    k = 0
    while t < end - 0.02:
        place(bus, stereo(kick(0.42), 0), t, 0.9 * gain)
        if clap_from is not None and t >= clap_from and k % 2 == 1:
            place(bus, stereo(clap(), 0.05), t, 0.45 * gain)
        if hats_from is not None and t >= hats_from:
            place(bus, stereo(hat(), 0.3), t + beat / 2, 0.22 * gain)
            place(bus, stereo(hat(), -0.3), t, 0.12 * gain)
        if bass is not None and t >= bass[0]:
            for j, nm in enumerate(bass[1]):
                tt = t + j * beat / 2
                if tt >= end:
                    break
                f = n2f(nm)
                n = secs(beat / 2)
                x = saw(f, beat / 2) * adsr(n, 0.003, 0.08, 0.5, 0.05)
                place(bus, stereo(lowpass(x, 700), 0), tt, 0.3 * gain)
        t += beat
        k += 1


def gaps(bus, windows, fade_s=0.03):
    g = np.ones(bus.shape[1])
    for a, b in windows:
        i, j = secs(a), secs(b)
        g[i:j] = 0
        f = secs(fade_s)
        g[max(0, i - f):i] *= np.linspace(1, 0, min(f, i))
        g[j:j + f] *= np.linspace(0, 1, len(g[j:j + f]))
    bus *= g


# ------------------------------------------------------------------ helpers de efectos

# Los efectos se bajan de tono (pedido del dueño: los originales eran muy agudos y cansan).
SFX_SEMITONES = -4


def pitch(clip: np.ndarray, semitones: float) -> np.ndarray:
    """Baja o sube el tono reproduciendo el clip más lento o más rápido (como una cinta)."""
    if semitones == 0:
        return clip
    ratio = 2 ** (semitones / 12)
    n = clip.shape[-1]
    src = np.arange(0, n - 1, ratio)
    if clip.ndim == 1:
        return np.interp(src, np.arange(n), clip)
    return np.stack([np.interp(src, np.arange(n), ch) for ch in clip])


class Cues:
    def __init__(self, dur: float):
        self.bus = np.zeros((2, secs(dur) + SR))

    def add(self, clip, frame: float, gain: float = 1.0, offset_s: float = 0.0, semitones: float | None = None):
        st = SFX_SEMITONES if semitones is None else semitones
        place(self.bus, pitch(clip, st), f2s(frame) + offset_s, gain)


def hook_hit(c: Cues, gain: float = 1.0):
    """Arranque con sonido en el frame 0: golpe grave corto + aire."""
    c.add(S.impact(1.4), 0, 0.35 * gain)
    c.add(S.swish(), 0, 0.35 * gain)


def end_logo(c: Cues, frame: float, gain: float = 1.0):
    c.add(S.riser(1.3), frame, 0.35 * gain, offset_s=-1.3)
    c.add(S.impact(), frame, 0.62 * gain)
    c.add(S.shimmer(), frame + 2, 0.45 * gain)


# ------------------------------------------------------------------ videos

def v1():
    V = consts("V1ManosOcupadas.tsx", "V1")
    dur = 30
    m = np.zeros((2, secs(dur) + SR))
    drone(m, 0, 5.4, ["D2", "A2"], 0.45, 450)
    pads(m, [
        (0.0, 5.2, ["D3", "F3", "A3", "C4", "E4"], 0.55, 900),
        (5.0, 9.8, ["D3", "F3", "A3", "C4", "E4"], 0.7, 1300),
        (9.6, 14.6, ["Bb2", "F3", "A3", "D4", "E4"], 0.7, 1400),
        (14.4, 19.8, ["F2", "C3", "G3", "A3", "E4"], 0.85, 2200),
        (19.6, 24.8, ["Bb2", "F3", "C4", "D4", "A4"], 0.85, 2000),
        (24.6, 27.2, ["C3", "G3", "C4", "D4", "F4"], 0.7, 1800),
        (27.0, 30.0, ["F2", "C3", "A3", "E4", "G4"], 0.95, 2600),
    ])
    arp(m, 5.2, 9.7, ["D4", "F4", "A4", "C5"], 90, 0.28, 0.35, seed=1)
    arp(m, 9.7, 14.4, ["Bb3", "D4", "F4", "A4"], 90, 0.28, 0.35, seed=2)
    arp(m, 14.5, 19.5, ["F4", "A4", "C5", "E5"], 90, 0.3, 0.6, seed=3)
    arp(m, 19.6, 24.4, ["Bb3", "D4", "F4", "C5"], 90, 0.22, 0.45, seed=4)
    pulse(m, 3.3, 24.4, 90, 0.22, 1.0, "sub")

    c = Cues(dur)
    hook_hit(c)
    c.add(S.phone_ring(), V["ringStart"], 0.3)
    c.add(S.phone_ring(), V["ringStart"] + 36, 0.28)
    c.add(S.pickup(), V["pickup"], 0.9)
    for k, key in enumerate(["b1", "b2", "b3", "b4"]):
        c.add(S.pop([0, -3, 2, -1][k]), V[key] + 2, 0.55)
    c.add(S.tick(), V["chipAgenda"] + 3, 0.5)
    c.add(S.confirm(), V["chipTurno"] + 4, 0.45)
    c.add(S.hangup(), V["hangup"], 0.7)
    c.add(S.whoosh(0.6), V["result"] - 10, 0.3)
    c.add(S.confirm(), V["result"] + 6, 0.65)
    c.add(S.pop(7), V["notif"] + 2, 0.5)
    for key in ["trust", "urgent", "payoff"]:
        c.add(S.swish(), V[key], 0.5)
    end_logo(c, V["end"])
    return m, c.bus, dur, 0.5


def v2():
    V = consts("V2MenosAusencias.tsx", "V2")
    dur = 30
    m = np.zeros((2, secs(dur) + SR))
    pads(m, [
        (0.0, 3.3, ["A2", "E3", "G#3", "B3", "C#4"], 0.55, 1700),
        (3.2, 7.6, ["F#2", "C#3", "E3", "A3", "B3"], 0.55, 1300),
        (7.5, 14.5, ["D3", "A3", "C#4", "E4", "F#4"], 0.65, 2100),
        (15.8, 23.6, ["A2", "E3", "B3", "C#4", "G#4"], 0.75, 2500),
        (23.5, 26.9, ["E3", "B3", "D4", "F#4", "A4"], 0.65, 2100),
        (26.8, 30.0, ["A2", "E3", "G#3", "C#4", "E4"], 0.85, 2700),
    ])
    arp(m, 0.2, 3.2, ["A4", "C#5", "E5", "G#5"], 100, 0.25, 0.6, seed=5)
    arp(m, 7.6, 14.4, ["D5", "F#5", "A5", "C#6"], 100, 0.24, 0.7, seed=6)
    arp(m, 15.9, 23.4, ["A4", "C#5", "E5", "B5"], 100, 0.26, 0.7, seed=7)
    arp(m, 26.9, 29.4, ["A4", "E5", "C#6"], 100, 0.2, 0.6, step=1.0, seed=8)
    pulse(m, 7.6, 14.4, 100, 0.08, 0.5, "tick")
    gaps(m, [(f2s(V["pause"] - 5), f2s(V["stat"]))])

    c = Cues(dur)
    hook_hit(c)
    c.add(S.tick_roll(1.45, 13), V["count"], 0.55)
    c.add(S.swish(), V["grid"], 0.4)
    for k in range(5):
        c.add(S.pop(-5 - k * 2), V["empties"] + k * 7, 0.45)
    for k, key in enumerate(["chip1", "chip2", "chip3"]):
        c.add(S.pop(k * 3), V[key] + 2, 0.5)
    c.add(S.note("A4", 2.5, 0.6), V["pause"], 0.6)
    c.add(S.whoosh(0.6), V["stat"] - 6, 0.3)
    c.add(S.tick_roll(1.5, 14), V["drop"], 0.55)
    c.add(S.confirm(), V["drop"] + 46, 0.7)
    c.add(S.pop(7), V["reprog"], 0.45)
    c.add(S.swish(), V["measure"], 0.45)
    end_logo(c, V["end"], 0.85)
    return m, c.bus, dur, 0.55


def v3():
    V = consts("V3ContestarNoEsResolver.tsx", "V3")
    dur = 30
    m = np.zeros((2, secs(dur) + SR))
    pads(m, [
        (0.0, 3.3, ["E3", "G3", "B3", "D4", "F#4"], 0.55, 1100),
        (3.2, 8.4, ["E3", "G3", "B3", "D4", "F#4"], 0.65, 1300),
        (8.2, 13.2, ["C3", "G3", "B3", "E4", "G4"], 0.65, 1400),
        (13.0, 16.6, ["A2", "E3", "G3", "C4", "E4"], 0.7, 1200),
        (16.5, 23.6, ["G2", "D3", "A3", "B3", "F#4"], 0.8, 2400),
        (23.5, 26.9, ["C3", "G3", "D4", "E4", "B4"], 0.7, 2100),
        (26.8, 30.0, ["G2", "D3", "B3", "F#4", "A4"], 0.9, 2600),
    ])
    pulse(m, 3.4, 13.0, 96, 0.14, 1.0, "tick")
    pulse(m, 3.4, 13.0, 96, 0.16, 2.0, "sub")
    arp(m, 16.6, 23.4, ["G4", "B4", "D5", "F#5"], 96, 0.27, 0.65, seed=9)

    c = Cues(dur)
    hook_hit(c)
    c.add(S.pop(0), V["msg"] + 2, 0.55)
    c.add(S.whoosh(0.75), V["split"], 0.5)
    c.add(S.pop(0), V["p1"] + 2, 0.4)
    c.add(S.thud(), V["bot"] + 2, 0.45)
    c.add(S.pop(4), V["airis1"] + 2, 0.5)
    c.add(S.pop(-2), V["reply"] + 2, 0.4)
    c.add(S.pop(5), V["airis2"] + 2, 0.5)
    for key in ["chips1", "chips2"]:
        c.add(S.thud(), V[key], 0.5)
        c.add(S.confirm(), V[key] + 4, 0.55)
    c.add(S.whoosh_low(), V["collapse"], 0.55)
    c.add(S.impact(1.8), V["claim"], 0.55)
    c.add(S.swish(), V["done"], 0.4)
    for k, key in enumerate(["row1", "row2", "row3"]):
        c.add(S.ding(["E6", "G6", "B6"][k]), V[key] + 4, 0.45)
    c.add(S.swish(), V["nobody"], 0.45)
    end_logo(c, V["end"])
    return m, c.bus, dur, 0.5


def v4():
    V = consts("V4UnDia.tsx", "V4")
    dur = 30
    stops = [V["firstStop"] + i * V["stopLen"] for i in range(5)]
    kinds = ["whatsapp", "call", "whatsapp", "agenda", "whatsapp"]
    m = np.zeros((2, secs(dur) + SR))
    pads(m, [
        (0.0, 8.6, ["C3", "G3", "D4", "E4", "B4"], 0.55, 2600),
        (8.4, 15.6, ["F3", "C4", "E4", "G4", "A4"], 0.6, 2400),
        (15.4, 19.8, ["A2", "E3", "G3", "C4", "E4"], 0.65, 1800),
        (19.6, 23.9, ["D3", "A3", "C4", "F4", "E4"], 0.65, 1300),
        (23.8, 26.9, ["Bb2", "F3", "A3", "D4", "G4"], 0.75, 1900),
        (26.8, 30.0, ["F2", "C3", "A3", "G4", "E4"], 0.9, 2600),
    ])
    pulse(m, 0.0, 23.8, 120, 0.13, 1.0, "tick")
    arp(m, 2.8, 8.4, ["C5", "E5", "G5", "B5"], 120, 0.2, 0.7, seed=10)
    arp(m, 8.4, 15.4, ["F4", "A4", "C5", "E5"], 120, 0.2, 0.65, seed=11)
    arp(m, 15.4, 23.8, ["A3", "C4", "E4", "G4"], 120, 0.18, 0.4, step=1.0, seed=12)

    c = Cues(dur)
    hook_hit(c)
    for i, (st, kind) in enumerate(zip(stops, kinds)):
        c.add(S.tick_roll(0.62, 9), st, 0.5)
        if kind == "call":
            c.add(S.phone_ring(0.7), st + V["card"], 0.26)
        elif kind == "agenda":
            c.add(S.tick(), st + V["card"] + 2, 0.5)
        else:
            c.add(S.pop(2 + i), st + V["card"] + 2, 0.5)
        c.add(S.confirm(), st + V["resolve"] + 4, 0.55)
    c.add(S.swish(), V["claim"], 0.45)
    end_logo(c, V["end"])
    return m, c.bus, dur, 0.5


def v5():
    V = consts("V5CheAlguienRespondio.tsx", "V5")
    dur = 20
    m = np.zeros((2, secs(dur) + SR))
    beat = 0.5
    chaos_end = f2s(V["black"])
    drums_v5(m, 0.0, chaos_end, 120, clap_from=2.0, hats_from=2.0, bass=(2.0, ["C2", "C2", "Eb2", "G2"]))
    for k in range(3):
        place(m, chord_pad(["C3", "Eb3", "G3", "Bb3", "D4"], 0.45, gain=1.0, cutoff=2600, attack=0.005, release=0.2), k * beat, 0.9)
    pads(m, [(2.0, chaos_end, ["C3", "Eb3", "G3", "Bb3"], 0.35, 1500)])
    calm = f2s(V["calm"])
    pads(m, [
        (calm, calm + 2.6, ["C3", "Eb3", "G3", "Bb3", "D4"], 0.6, 1400),
        (calm + 2.5, f2s(V["nada"]), ["Ab2", "Eb3", "G3", "C4", "Eb4"], 0.6, 1500),
        (f2s(V["nada"]), f2s(V["vos"]), ["Eb3", "Bb3", "D4", "F4", "G4"], 0.7, 2200),
        (f2s(V["vos"]), f2s(V["end"]), ["Bb2", "F3", "C4", "D4", "F4"], 0.7, 2000),
        (f2s(V["end"]), dur, ["Eb2", "Bb2", "G3", "D4", "F4"], 0.9, 2600),
    ])
    pulse(m, calm, f2s(V["nada"]), 120, 0.5, 2.0, "kick")
    arp(m, calm + 0.2, f2s(V["nada"]), ["C4", "Eb4", "G4", "Bb4"], 120, 0.18, 0.5, seed=13)
    drums_v5(m, f2s(V["nada"]), f2s(V["end"]), 120, hats_from=f2s(V["nada"]), gain=0.55)
    gaps(m, [(chaos_end, calm)])

    c = Cues(dur)
    c.add(S.pop(7), 60, 0.6)
    for k, fr in enumerate([75, 90, 105, 120]):
        c.add(S.pop([0, 3, 5, -2][k]), fr, 0.55)
    c.add(S.pop(0), V["client"] + 2, 0.5)
    c.add(S.pop(4), V["airis"] + 2, 0.55)
    for k, key in enumerate(["chip1", "chip2", "chip3"]):
        c.add(S.confirm(), V[key] + 4, 0.4)
    c.add(S.swish(), V["nada"], 0.45)
    c.add(S.swish(), V["vos"], 0.45)
    end_logo(c, V["end"])
    return m, c.bus, dur, 0.6, [(chaos_end + 0.02, calm)]


def v6():
    V = consts("V6Urgencia.tsx", "V6")
    dur = 20
    m = np.zeros((2, secs(dur) + SR))
    drone(m, 0, f2s(V["claim"]) + 0.2, ["D2", "A2"], 0.5, 480)
    pulse(m, f2s(V["call"]), f2s(V["transfer"]), 60, 0.22, 1.0, "heart")
    pads(m, [
        (f2s(V["alert"]) - 0.4, f2s(V["claim"]) + 0.2, ["D3", "A3", "C4", "F4"], 0.45, 1000),
        (f2s(V["claim"]), f2s(V["end"]) + 0.1, ["Bb2", "F3", "A3", "D4"], 0.55, 1400),
        (f2s(V["end"]), dur, ["D3", "A3", "F#4", "E4"], 0.8, 2100),
    ])

    c = Cues(dur)
    hook_hit(c)
    c.add(S.note("A4", 3.0, 0.55), 8, 0.6)
    c.add(S.pickup(), V["call"], 0.8)
    c.add(S.pop(0), V["b1"] + 2, 0.5)
    c.add(S.pop(-3), V["b2"] + 2, 0.45)
    c.add(S.alert(), V["alert"], 0.6)
    c.add(S.transfer(), V["transfer"], 0.7)
    c.add(S.whoosh(0.6), V["person"], 0.3)
    c.add(S.note("D5", 3.0, 0.7), V["claim"], 0.7)
    end_logo(c, V["end"], 0.8)
    return m, c.bus, dur, 0.55


def v7():
    V = consts("V7Contestador.tsx", "V7")
    dur = 15
    cut = f2s(V["cut"])
    m = np.zeros((2, secs(dur) + SR))
    # Antes: apagado, filtrado, con soplido de cinta
    grey = np.zeros_like(m)
    drone(grey, 0, cut, ["A1", "E2"], 0.5, 260)
    place(grey, S.tape_hiss(cut), 0, 1.0)
    m += lowpass(grey, 700)
    gaps(m, [(cut, dur)], 0.005)
    # Después: color
    after = np.zeros_like(m)
    pads(after, [
        (cut, f2s(V["end"]) + 0.1, ["E3", "B3", "F#4", "G#4", "D#5"], 0.8, 2600),
        (f2s(V["end"]), dur, ["A2", "E3", "C#4", "G#4", "B4"], 0.9, 2700),
    ])
    arp(after, f2s(V["ring"]), f2s(V["end"]), ["E4", "G#4", "B4", "D#5"], 110, 0.24, 0.7, seed=14)
    pulse(after, cut, f2s(V["end"]), 110, 0.2, 1.0, "sub")
    m += after

    c = Cues(dur)
    c.add(lowpass(S.impact(1.4), 500), 0, 0.5)
    c.add(S.beep_voicemail(), V["beep"], 0.7)
    c.add(S.reverse_swell(1.0), V["cut"], 0.6, offset_s=-1.0)
    c.add(S.impact(2.0), V["cut"], 0.85)
    c.add(S.phone_ring(), V["ring"] + 2, 0.3)
    c.add(S.phone_ring(0.45), V["ring"] + 36, 0.28)
    c.add(S.pickup(), V["pickup"], 0.85)
    c.add(S.confirm(), V["result"] + 6, 0.65)
    c.add(S.pop(5), V["notif"] + 2, 0.5)
    end_logo(c, V["end"], 0.9)
    return m, c.bus, dur, 0.5


def v8():
    V = consts("V8Titulo.tsx", "V8")
    dur = 15
    m = np.zeros((2, secs(dur) + SR))
    pile_end = f2s(V["pileStart"] + 6 * V["pileStep"])
    pads(m, [
        (0.0, 3.4, ["G2", "D3", "B3", "F#4"], 0.55, 2000),
        (3.3, pile_end + 0.2, ["C3", "G3", "Bb3", "D4"], 0.5, 1500),
        (pile_end, f2s(V["suck"]) + 0.2, ["D3", "A3", "C4", "F#4"], 0.6, 1700),
        (f2s(V["suck"]), f2s(V["end"]), ["G2", "D3", "A3", "B3", "F#4"], 0.75, 2500),
        (f2s(V["end"]), dur, ["C3", "G3", "B3", "E4", "D4"], 0.85, 2600),
    ])
    arp(m, 0.2, 3.3, ["G4", "B4", "D5"], 110, 0.22, 0.6, step=1.0, seed=15)
    arp(m, 3.3, f2s(V["suck"]), ["C4", "E4", "G4", "Bb4"], 110, 0.2, 0.5, step=0.5, seed=16)
    arp(m, f2s(V["suck"]) + 0.8, f2s(V["end"]), ["G4", "B4", "D5", "F#5"], 110, 0.24, 0.7, seed=17)

    c = Cues(dur)
    hook_hit(c)
    c.add(S.note("G4", 2.5, 0.6), 4, 0.55)
    for i in range(6):
        c.add(S.pop(i * 2), V["pileStart"] + i * V["pileStep"] + 2, 0.55)
    c.add(S.whoosh(0.8, 400, 5000, 0, 0), V["suck"] - 2, 0.6)
    c.add(S.confirm(), V["suck"] + 26, 0.65)
    c.add(S.swish(), V["claim"], 0.45)
    c.add(S.swish(), V["vos"], 0.45)
    end_logo(c, V["end"], 0.85)
    return m, c.bus, dur, 0.5


def v9():
    V = consts("V9Probe.tsx", "V9")
    dur = 20
    turn = f2s(V["turn"])
    m = np.zeros((2, secs(dur) + SR))
    # Primera mitad: casi silencio, solo aire de la habitación (humor seco)
    place(m, stereo(lowpass(noise(turn, "pink"), 300) * 0.2, 0), 0, 1.0)
    pads(m, [
        (turn, f2s(V["result"]), ["E3", "B3", "F#4", "G#4", "D#5"], 0.85, 2400),
        (f2s(V["result"]), f2s(V["end"]), ["A2", "E3", "B3", "C#4", "G#4"], 0.8, 2500),
        (f2s(V["end"]), dur, ["E2", "B2", "G#3", "D#4", "F#4"], 0.9, 2700),
    ])
    pulse(m, turn, f2s(V["end"]), 100, 0.22, 1.0, "sub")
    arp(m, f2s(V["patient2"]), f2s(V["end"]), ["E4", "G#4", "B4", "D#5"], 100, 0.24, 0.65, seed=18)

    c = Cues(dur)
    for fr in [0, V["promise"], V["weeks"], V["bot1"], V["anoto"]]:
        c.add(S.thud(), fr, 0.55)
    c.add(S.swish(), V["bar"], 0.5)
    c.add(S.pop(-4), V["bot1"] + 2, 0.4)
    c.add(S.pop(-2), V["patient1"] + 2, 0.4)
    c.add(S.hangup(), V["bot2"] + 2, 0.5)
    c.add(S.impact(1.8), V["turn"], 0.7)
    c.add(S.pop(0), V["patient2"] + 2, 0.5)
    c.add(S.pop(5), V["airis"] + 2, 0.55)
    c.add(S.confirm(), V["result"] + 6, 0.65)
    c.add(S.swish(), V["armamos"], 0.45)
    end_logo(c, V["end"])
    return m, c.bus, dur, 0.55, [(f2s(V["black"]), turn - 0.01)]


def v10():
    V = consts("V10Avalancha.tsx", "V10")
    dur = float(re.search(r"V10_DURATION = (\d+)", (VIDEOS / "V10Avalancha.tsx").read_text()).group(1)) / FPS
    black, calm = f2s(V["black"]), f2s(V["calm"])
    m = np.zeros((2, secs(dur) + SR))
    # Avalancha: zumbido grave que sube de tensión hasta el corte a negro
    drone(m, 0, black, ["D2", "A2", "D#3"], 0.55, 420)
    place(m, stereo(bandpass(noise(black, "pink"), 300, 2500) * np.linspace(0, 1, secs(black)) ** 2 * 0.5, 0), 0, 1.0)

    c = Cues(dur)
    c.add(S.pop(0), 0, 0.8)
    rng = np.random.default_rng(10)
    n = 175
    for i in range(1, n):
        fr = round(V["peak"] * (i / n) ** 0.62)
        c.add(S.pop(int(rng.integers(-6, 9))), fr, 0.34 * (1 - 0.45 * i / n))
    # vibración del teléfono, cada vez más seguida
    for fr in [20, 52, 78, 100, 118, 134, 146, 156, 165, 172, 178]:
        buzz = saw(165, 0.28) * adsr(secs(0.28), 0.01, 0.05, 0.9, 0.05) * (0.6 + 0.4 * np.sign(sine(28, 0.28)))
        c.add(stereo(lowpass(buzz, 500), 0), fr, 0.35)
    c.add(S.riser(1.8), V["peak"], 0.5, offset_s=-1.8)
    c.add(S.impact(2.0), V["calm"], 0.8)
    c.add(S.shimmer(), V["calm"] + 2, 0.35)
    c.add(S.pop(0), V["ask"] + 2, 0.5)
    c.add(S.pop(4), V["reply"] + 2, 0.55)
    c.add(S.pop(-2), V["ok"] + 2, 0.45)
    c.add(S.confirm(), V["booked"] + 6, 0.6)
    c.add(S.whoosh(0.9), V["zoom"] - 4, 0.45)
    c.add(S.swish(), V["gridTitle"], 0.35)
    notes = ["C6", "D6", "E6", "G6", "A6"]
    for k in range(19):
        c.add(S.ding(notes[k % 5]), V["solve"] + k * V["solveStep"] + 18 + 4, 0.2)
    # mazo y mini CRM
    for k in range(0, 20, 3):
        c.add(S.swish(), V["stack"] + k * 1.2 + 14, 0.18)
    c.add(S.whoosh(0.7), V["board"], 0.35)
    for k in range(10):
        c.add(S.swish(), V["deal"] + k * V["dealStep"], 0.22)
        c.add(S.pop(-3 + (k % 4)), V["deal"] + k * V["dealStep"] + 15, 0.4)
    c.add(S.whoosh(0.8), V["zoomIn"], 0.4)
    for at in [V["click1"], V["click2"]]:
        c.add(S.tick(1.0), at, 0.7)
    c.add(S.whoosh(0.5), V["detail"], 0.25)
    c.add(S.confirm(), V["sent"] + 2, 0.65)
    c.add(S.whoosh(0.8), V["zoomOut"], 0.35)
    # asistente personal
    c.add(S.whoosh(0.6), V["assist"], 0.35)
    c.add(S.tick(0.8), V["rec"], 0.6)
    c.add(S.pop(2), V["voice"], 0.55)
    c.add(S.pop(-2), V["aReply"] + 2, 0.5)
    c.add(S.pop(0), V["pdf"] + 2, 0.45)
    c.add(S.pop(3), V["ask2"] + 2, 0.5)
    c.add(S.pop(-1), V["summary"] + 2, 0.5)
    for k in range(7):
        c.add(S.tick(0.6), V["summary"] + 8 + k * 6, 0.3)
    c.add(S.swish(), V["claim"], 0.45)
    end_logo(c, V["end"])
    return m, c.bus, dur, 0.55, [(black + 0.02, calm)]


def v11():
    """Brand film 16:9 a 24 fps con efectos grabados de Mixkit (kit.json)."""
    from kit import k

    src = (VIDEOS / "V11BrandFilm.tsx").read_text()
    V = consts("V11BrandFilm.tsx", "V11")
    dur = float(re.search(r"V11_DURATION = (\d+)", src).group(1)) / 24
    m = np.zeros((2, secs(dur) + SR))
    c = Cues(dur)

    def add(name, f24, gain, off=0.0, length=None):
        c.add(k(name, length), f24 * FPS / 24, gain, offset_s=off, semitones=0)

    # 01 caos
    add("click", 0, 0.35)
    add("swoosh", 6, 0.25)
    add("whoosh_deep", 24, 0.5)
    for i in range(8):
        add("pop", 40 + i * 5, 0.18)
    add("swoosh", 64, 0.25)
    add("drum_hit", V["signal"], 0.7, length=1.2)
    # 02 la señal: un clic por bloque que se conecta
    s = V["signal"]
    for i in range(5):
        add("click", s + 10 + i * 10, 0.45)
    add("swoosh", s + 58, 0.25)
    add("riser_short", s + 96, 0.35, off=-0.86)
    # 03 el sistema
    y = V["system"]
    add("bass_hit", y, 0.55)
    add("pop", y + 26, 0.4)
    add("swoosh", y + 40, 0.22)
    for i in range(5):
        add("click", y + 64 + i * 8, 0.45)
    add("confirm", y + 100, 0.3)
    add("swoosh", y + 112, 0.25)
    add("bass_hit", y + 126, 0.55)
    add("whoosh_deep", y + 132, 0.45)
    # 04 el motor: clic por nodo
    e = V["engine"]
    for i in range(7):
        add("click", e + 14 + i * 13 + 8, 0.4)
    add("whoosh_deep", e + 110, 0.45)
    add("swoosh", e + 126, 0.22)
    # 05 escala
    sc = V["scale"]
    for i in range(10):
        add("click", sc + 8 + i * 4.5, 0.2)
    add("whoosh_deep", sc + 54, 0.4)
    add("swoosh", sc + 86, 0.22)
    add("swoosh", sc + 110, 0.22)
    add("bass_switch", sc + 122, 0.4)
    add("confirm", sc + 140, 0.3)
    # 06 antes y después
    sp = V["split"]
    add("bass_hit", sp, 0.45)
    for i in range(7):
        add("click", sp + 14 + i * 12, 0.2)
    add("whoosh_deep", sp + 40, 0.4)
    add("swoosh", sp + 44, 0.2)
    add("swoosh", sp + 82, 0.2)
    # 07 el agente
    ag = V["agent"]
    add("pop", ag + 6, 0.45)
    for i in range(6):
        add("click", ag + 16 + i * 4, 0.25)
    add("swoosh", ag + 46, 0.3)
    add("pop", ag + 64, 0.45)
    for i in range(3):
        add("click", ag + 76 + i * 7, 0.35)
    add("confirm", ag + 92, 0.3)
    add("swoosh", ag + 102, 0.22)
    add("swoosh", ag + 128, 0.22)
    add("whoosh_deep", ag + 138, 0.5)
    # 08 final: todo converge en el logo
    fi = V["finale"]
    add("riser", fi + 70, 0.4, off=-1.8)
    add("logo_hit", fi + 70, 0.85)
    add("click", fi + 112, 0.3)
    add("click", fi + 118, 0.3)
    return m, c.bus, dur, 0.5


BUILDERS = {"v1": v1, "v2": v2, "v3": v3, "v4": v4, "v5": v5, "v6": v6, "v7": v7, "v8": v8, "v9": v9, "v10": v10, "v11": v11}


BED_LUFS = -17.0
# Margen extra de pico real para mezclas con mucho transitorio (el AAC agrega sobrepicos).
TP_OVERRIDE = {"v5": -3.0}

# ------------------------------------------------------------------ música de biblioteca
# tracks.json asigna a cada video un tema de assets/music/ (con su LICENSE.md al lado).
# Si un video no figura ahí, suena la partitura sintetizada de arriba.
TRACKS = Path(__file__).parent / "tracks.json"
MUSIC_DIR = ROOT.parent / "assets" / "music"
# Nivel del tema antes de sumar efectos: más alto que la cama sintetizada para que se
# escuche como música, no como ambiente.
TRACK_LUFS = -15.5
# Videos cuyo arranque es distinto a propósito: la partitura propia suena hasta ese
# momento y recién ahí entra el tema (V7: contestador gris; V9: silencio incómodo).
ENTER = {"v7": ("V7Contestador.tsx", "V7", "cut"), "v9": ("V9Probe.tsx", "V9", "turn"),
         "v10": ("V10Avalancha.tsx", "V10", "calm")}


def ffmpeg_exe() -> str:
    import shutil
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return shutil.which("ffmpeg") or "ffmpeg"


def load_track(path: Path) -> np.ndarray:
    """Decodifica cualquier formato (mp3, wav, ogg) a estéreo 48 kHz en float."""
    import subprocess
    raw = subprocess.run(
        [ffmpeg_exe(), "-nostdin", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        check=True, capture_output=True, stdin=subprocess.DEVNULL,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).T.astype(np.float64)


def track_bed(cfg: dict, dur: float, enter: float) -> np.ndarray:
    """Recorta el tema a la duración exacta; si es corto, lo repite con fundido cruzado."""
    x = load_track(MUSIC_DIR / cfg["file"])
    start = secs(cfg.get("start", 0.0))
    need = secs(dur - enter)
    seg = x[:, start:start + need].copy()
    xf = secs(1.0)
    while seg.shape[1] < need:
        nxt = x[:, start:start + need - seg.shape[1] + xf]
        ramp = np.linspace(0, 1, xf)
        seg[:, -xf:] = seg[:, -xf:] * (1 - ramp) + nxt[:, :xf] * ramp
        seg = np.concatenate([seg, nxt[:, xf:]], axis=1)
    out = np.zeros((2, secs(dur)))
    i = secs(enter)
    out[:, i:i + need] = seg[:, :need]
    fi = secs(cfg.get("fade_in", 0.02 if enter == 0 else 0.25))
    out[:, i:i + fi] *= np.linspace(0, 1, fi)
    fo = secs(cfg.get("fade_out", 1.6))
    out[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    return out


def duck(music: np.ndarray, fx: np.ndarray, depth_db: float = 5.0) -> np.ndarray:
    """Baja el tema cuando suena un efecto (ataque 10 ms, suelta 300 ms)."""
    blk = SR // 100
    n = music.shape[1]
    nb = n // blk + 1
    pad = np.zeros(nb * blk)
    pad[:n] = np.abs(fx[:, :n]).max(axis=0)
    peak = pad.reshape(nb, blk).max(axis=1)
    ref = max(peak.max(), 1e-9)
    env = np.zeros(nb)
    rel = np.exp(-1 / 30)
    for k in range(nb):
        env[k] = peak[k] / ref if peak[k] / ref > env[k - 1] * rel else env[k - 1] * rel
    gain = db(-depth_db * np.clip(env * 2.0, 0, 1))
    return music * np.interp(np.arange(n), np.arange(nb) * blk, gain)


def load_tracks() -> dict:
    return json.loads(TRACKS.read_text()) if TRACKS.exists() else {}


def build(name: str) -> dict:
    import pyloudnorm as pyln

    res = BUILDERS[name]()
    music, fx, dur, music_gain = res[:4]
    post_gaps = res[4] if len(res) > 4 else []
    n = secs(dur)
    music = reverb(music[:, :n], 0.22, 2.8, 1.2, 6000)[:, :n]
    music = highpass(lowpass(music, 12000), 45)
    # leve pozo en medios graves (150-400 Hz) para que no se embarre en parlantes chicos
    music = music - 0.3 * bandpass(music, 150, 400)
    loud = pyln.Meter(SR).integrated_loudness(music.T)
    # sin partitura propia (todo el tema es de biblioteca) la cama queda en cero
    music = music * db(BED_LUFS - loud) * (music_gain / 0.5) if np.isfinite(loud) else music * 0
    cfg = load_tracks().get(name)
    if cfg:
        enter = f2s(consts(*ENTER[name][:2])[ENTER[name][2]]) if name in ENTER else 0.0
        bed = track_bed(cfg, dur, enter)
        live = bed[:, secs(enter):]
        bed *= db(TRACK_LUFS + cfg.get("gain_db", 0.0) - pyln.Meter(SR).integrated_loudness(live.T))
        if cfg.get("mute"):
            gaps(bed, [(f2s(a), f2s(b)) for a, b in cfg["mute"]], 0.06)
        bed = duck(bed, fx, cfg.get("duck_db", 5.0))
        # la partitura propia queda solo en la introducción distinta (si la hay)
        keep = np.zeros(n)
        keep[:secs(enter)] = 1.0
        f = secs(0.08)
        if enter > 0:
            keep[secs(enter) - f:secs(enter)] = np.linspace(1, 0, f)
        music = music * keep + bed
    if post_gaps:
        gaps(music, post_gaps, 0.02)
    # agudos más suaves en los efectos
    fx = lowpass(fx, 6500)
    mix = music + fx[:, :n]
    mix, info = master(mix, tp_db=TP_OVERRIDE.get(name, -1.2))
    # 30 ms de entrada: un golpe en el primer cuadro hace que el AAC se pase de pico
    mix[:, :secs(0.03)] *= np.linspace(0, 1, secs(0.03))
    # fundido final corto para no cortar colas en seco
    f = secs(0.35)
    mix[:, -f:] *= np.linspace(1, 0, f)
    OUT.mkdir(parents=True, exist_ok=True)
    sf.write(OUT / f"{name}.wav", mix.T, SR, subtype="PCM_24")
    info["file"] = str(OUT / f"{name}.wav")
    return info


if __name__ == "__main__":
    names = sys.argv[1:] or list(BUILDERS)
    report = {}
    for nm in names:
        report[nm] = {k: (float(v) if not isinstance(v, str) else v) for k, v in build(nm).items()}
        print(nm, report[nm])
    (OUT / "report.json").write_text(json.dumps(report, indent=2))
