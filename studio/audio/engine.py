"""Motor de síntesis de audio de AIRIS: osciladores, filtros, envolventes, reverb y master.

Todo el audio de los videos se genera con este código: es original y no depende de
librerías de sonido con licencia. Frecuencia de muestreo: 48 kHz, estéreo.
"""
from __future__ import annotations

import numpy as np
from scipy import signal

SR = 48000
RNG = np.random.default_rng(20260928)


# ---------------------------------------------------------------- utilidades

def secs(n: float) -> int:
    return int(round(n * SR))


def t_axis(dur: float) -> np.ndarray:
    return np.arange(secs(dur)) / SR


def db(x: float) -> float:
    return 10 ** (x / 20)


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


NOTE = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6,
        "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}


def n2f(name: str) -> float:
    """'A3' -> 220 Hz."""
    pitch = name[:-1]
    octave = int(name[-1])
    return midi(12 * (octave + 1) + NOTE[pitch])


def stereo(mono: np.ndarray, pan: float = 0.0) -> np.ndarray:
    """Paneo de potencia constante, pan en -1..1."""
    a = (pan + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)])


def place(bus: np.ndarray, clip: np.ndarray, at: float, gain: float = 1.0) -> None:
    """Suma `clip` (2, n) en `bus` (2, N) a partir de `at` segundos."""
    i = secs(at)
    if i >= bus.shape[1]:
        return
    n = min(clip.shape[1], bus.shape[1] - i)
    if i < 0:
        clip = clip[:, -i:]
        n = min(clip.shape[1], bus.shape[1])
        i = 0
    bus[:, i:i + n] += clip[:, :n] * gain


# ---------------------------------------------------------------- envolventes

def adsr(n: int, a: float, d: float, s: float, r: float) -> np.ndarray:
    a_n, d_n, r_n = secs(a), secs(d), secs(r)
    s_n = max(0, n - a_n - d_n - r_n)
    env = np.concatenate([
        np.linspace(0, 1, max(a_n, 1), endpoint=False) ** 1.5,
        np.linspace(1, s, max(d_n, 1), endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0, max(r_n, 1)) ** 1.2,
    ])
    return np.pad(env, (0, max(0, n - len(env))))[:n]


def exp_decay(n: int, tau: float) -> np.ndarray:
    return np.exp(-np.arange(n) / (tau * SR))


def fade(x: np.ndarray, fin: float = 0.005, fout: float = 0.02) -> np.ndarray:
    y = x.copy()
    a, b = secs(fin), secs(fout)
    if a > 0:
        y[..., :a] *= np.linspace(0, 1, a)
    if b > 0:
        y[..., -b:] *= np.linspace(1, 0, b)
    return y


# ---------------------------------------------------------------- osciladores

def sine(freq, dur: float, phase: float = 0.0) -> np.ndarray:
    n = secs(dur)
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    ph = 2 * np.pi * np.cumsum(f) / SR + phase
    return np.sin(ph)


def _polyblep(t: np.ndarray, dt: np.ndarray) -> np.ndarray:
    out = np.zeros_like(t)
    m1 = t < dt
    x = t[m1] / dt[m1]
    out[m1] = x + x - x * x - 1
    m2 = t > 1 - dt
    x = (t[m2] - 1) / dt[m2]
    out[m2] = x * x + x + x + 1
    return out


def saw(freq, dur: float, phase: float = 0.0) -> np.ndarray:
    """Diente de sierra con polyBLEP (sin aliasing audible)."""
    n = secs(dur)
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    dt = f / SR
    t = (np.cumsum(dt) + phase) % 1.0
    return (2 * t - 1) - _polyblep(t, dt)


def tri(freq, dur: float) -> np.ndarray:
    s = saw(freq, dur)
    return 2 * np.abs(s) - 1


def noise(dur: float, kind: str = "white") -> np.ndarray:
    n = secs(dur)
    w = RNG.standard_normal(n)
    if kind == "white":
        return w / 3
    # rosa (aproximación de Paul Kellet con filtro)
    b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    p = signal.lfilter(b, a, w)
    return p / (np.max(np.abs(p)) + 1e-9)


# ---------------------------------------------------------------- filtros

def lowpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    sos = signal.butter(order, min(cutoff, SR * 0.45), "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=-1)


def highpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    sos = signal.butter(order, max(cutoff, 10), "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=-1)


def bandpass(x: np.ndarray, lo: float, hi: float, order: int = 2) -> np.ndarray:
    sos = signal.butter(order, [max(lo, 10), min(hi, SR * 0.45)], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=-1)


def sweep_filter(x: np.ndarray, cutoffs: np.ndarray, kind: str = "low", block: int = 512) -> np.ndarray:
    """Filtro con frecuencia de corte variable (por bloques, con estado continuo)."""
    y = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        c = float(np.clip(cutoffs[min(i, len(cutoffs) - 1)], 30, SR * 0.45))
        if kind == "band":
            sos = signal.butter(2, [c * 0.7, min(c * 1.4, SR * 0.45)], "band", fs=SR, output="sos")
        else:
            sos = signal.butter(2, c, kind, fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
    return y


# ---------------------------------------------------------------- instrumentos

def pad_voice(freq: float, dur: float, cutoff: float = 1800, detune: float = 0.07, voices: int = 3,
              attack: float = 1.2, release: float = 1.5, bright: float = 0.0) -> np.ndarray:
    """Pad cálido: sierras desafinadas, filtradas, con apertura estéreo."""
    n = secs(dur)
    out = np.zeros((2, n))
    for v in range(voices):
        cents = (v - (voices - 1) / 2) * detune * 100 / max(1, voices - 1) * 2
        f = freq * 2 ** (cents / 1200)
        drift = 1 + 0.0015 * np.sin(2 * np.pi * (0.13 + 0.05 * v) * np.arange(n) / SR + v)
        s = saw(f * drift, dur, phase=RNG.random()) * 0.6 + sine(f * drift, dur) * 0.4
        pan = (v - (voices - 1) / 2) * 0.7
        out += stereo(s, pan)
    out = lowpass(out, cutoff * (1 + bright), order=2)
    env = adsr(n, attack, 0.5, 0.85, release)
    return out * env / voices


def chord_pad(notes: list[str], dur: float, gain: float = 1.0, **kw) -> np.ndarray:
    out = np.zeros((2, secs(dur)))
    for i, nm in enumerate(notes):
        out += pad_voice(n2f(nm), dur, **kw) * (0.9 if i == 0 else 0.7)
    return out * gain / max(1, len(notes)) * 1.6


def pluck(freq: float, dur: float = 1.2, bright: float = 0.6, decay: float = 0.996) -> np.ndarray:
    """Karplus-Strong vía lfilter: cuerda pulsada suave."""
    n = secs(dur)
    period = max(2, int(round(SR / freq)))
    burst = RNG.uniform(-1, 1, period)
    burst = lowpass(burst, 1500 + 7000 * bright)
    x = np.zeros(n)
    x[:period] = burst
    a = np.zeros(period + 2)
    a[0] = 1
    a[period] = -decay * 0.5
    a[period + 1] = -decay * 0.5
    y = signal.lfilter([1.0], a, x)
    y = y / (np.max(np.abs(y)) + 1e-9)
    return fade(y * exp_decay(n, dur * 0.35), 0.001, 0.05)


def felt_piano(freq: float, dur: float = 2.5, vel: float = 0.8) -> np.ndarray:
    """Piano suave (aditivo, levemente inarmónico)."""
    n = secs(dur)
    out = np.zeros(n)
    for k, amp in enumerate([1.0, 0.45, 0.22, 0.12, 0.06, 0.03], start=1):
        fk = freq * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > SR * 0.4:
            break
        out += amp * sine(fk, dur) * exp_decay(n, (1.6 / k ** 0.7) * dur / 2.5)
    att = np.minimum(1, np.arange(n) / secs(0.008))
    out = lowpass(out * att, 2200 + 3000 * vel)
    return out / (np.max(np.abs(out)) + 1e-9) * vel


def bell(freq: float, dur: float = 1.4) -> np.ndarray:
    """Campana FM brillante (para el ding de confirmación)."""
    n = secs(dur)
    t = np.arange(n) / SR
    index = 2.4 * np.exp(-t / 0.18)
    mod = np.sin(2 * np.pi * freq * 2.0 * t) * index
    car = np.sin(2 * np.pi * freq * t + mod)
    body = car * exp_decay(n, 0.45) + 0.25 * np.sin(2 * np.pi * freq * 3.01 * t) * exp_decay(n, 0.12)
    att = np.minimum(1, np.arange(n) / secs(0.003))
    return body * att


def kick(dur: float = 0.45, punch: float = 1.0) -> np.ndarray:
    n = secs(dur)
    t = np.arange(n) / SR
    f = 42 + 95 * np.exp(-t / 0.045)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * exp_decay(n, 0.16)
    click = highpass(noise(dur), 2500) * exp_decay(n, 0.004) * 0.5 * punch
    return np.tanh((body + click) * 1.6) * 0.9


def clap(dur: float = 0.35) -> np.ndarray:
    n = secs(dur)
    env = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.023]):
        i = secs(off)
        env[i:] += exp_decay(n - i, 0.012 if k < 2 else 0.09) * (0.7 if k < 2 else 1)
    return bandpass(noise(dur), 900, 3200) * env


def hat(dur: float = 0.09, open_: bool = False) -> np.ndarray:
    n = secs(dur)
    return highpass(noise(dur), 7000, 4) * exp_decay(n, 0.05 if open_ else 0.014) * 0.7


def reverb_ir(dur: float = 2.6, decay: float = 0.9, damp: float = 5000) -> np.ndarray:
    n = secs(dur)
    ir = np.zeros((2, n))
    for ch in range(2):
        w = RNG.standard_normal(n) * exp_decay(n, decay / 3)
        ir[ch] = lowpass(w, damp)
    ir[:, :secs(0.012)] *= np.linspace(0, 1, secs(0.012))
    return ir / np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))


_IR_CACHE: dict[tuple, np.ndarray] = {}


def reverb(x: np.ndarray, mix: float = 0.25, dur: float = 2.6, decay: float = 0.9, damp: float = 5000) -> np.ndarray:
    key = (dur, decay, damp)
    if key not in _IR_CACHE:
        _IR_CACHE[key] = reverb_ir(dur, decay, damp)
    ir = _IR_CACHE[key]
    if x.ndim == 1:
        x = np.stack([x, x])
    wet = np.stack([signal.fftconvolve(x[c], ir[c])[: x.shape[1] + ir.shape[1] - 1] for c in range(2)])
    dry = np.pad(x, ((0, 0), (0, wet.shape[1] - x.shape[1])))
    return dry * (1 - mix) + wet * mix * 0.9


# ---------------------------------------------------------------- master

def true_peak(x: np.ndarray) -> float:
    up = signal.resample_poly(x, 4, 1, axis=-1)
    return float(np.max(np.abs(up)))


def limiter(x: np.ndarray, ceiling_db: float = -1.2, release: float = 0.08, lookahead: float = 0.005) -> np.ndarray:
    """Limitador de picos: ganancia calculada con una ventana de ±5 ms, ataque inmediato y
    liberación exponencial."""
    from scipy.ndimage import maximum_filter1d

    ceiling = db(ceiling_db)
    peak = np.max(np.abs(x), axis=0)
    la = secs(lookahead)
    win = maximum_filter1d(peak, size=2 * la + 1)
    gain = np.minimum(1.0, ceiling / np.maximum(win, 1e-9))
    alpha = np.exp(-1 / (release * SR))
    smooth = signal.lfilter([1 - alpha], [1, -alpha], gain, zi=[gain[0] * alpha])[0]
    return x * np.minimum(smooth, gain)


def master(x: np.ndarray, target_lufs: float = -14.0, tp_db: float = -1.2) -> tuple[np.ndarray, dict]:
    import pyloudnorm as pyln

    meter = pyln.Meter(SR)
    x = x - np.mean(x, axis=1, keepdims=True)
    loud = meter.integrated_loudness(x.T)
    x = x * db(target_lufs - loud)
    for _ in range(3):
        x = limiter(x, tp_db - 0.3)
        tp = 20 * np.log10(true_peak(x) + 1e-12)
        if tp <= tp_db:
            break
        x = x * db(tp_db - tp - 0.1)
    loud2 = meter.integrated_loudness(x.T)
    return x, {"lufs": round(loud2, 2), "true_peak_db": round(20 * np.log10(true_peak(x) + 1e-12), 2)}
