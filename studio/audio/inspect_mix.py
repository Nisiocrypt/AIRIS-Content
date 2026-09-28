"""Genera un espectrograma + envolvente de un wav para revisar la mezcla sin escucharla."""
import sys
import numpy as np
import soundfile as sf
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

path = sys.argv[1]
x, sr = sf.read(path)
mono = x.mean(axis=1)
fig, ax = plt.subplots(3, 1, figsize=(16, 9), sharex=True, gridspec_kw={"height_ratios": [3, 1.2, 1]})
ax[0].specgram(mono, NFFT=2048, Fs=sr, noverlap=1536, cmap="magma", vmin=-120, vmax=-20)
ax[0].set_ylim(20, 16000)
ax[0].set_yscale("log")
ax[0].set_ylabel("Hz")
hop = sr // 20
rms = np.array([np.sqrt(np.mean(mono[i:i + hop] ** 2)) for i in range(0, len(mono) - hop, hop)])
t = np.arange(len(rms)) * hop / sr
ax[1].plot(t, 20 * np.log10(rms + 1e-9), color="#7C3AED")
ax[1].set_ylim(-60, 0)
ax[1].set_ylabel("RMS dB")
ax[1].grid(alpha=0.3)
side = (x[:, 0] - x[:, 1]) / 2
ax[2].plot(t, [20 * np.log10(np.sqrt(np.mean(side[i:i + hop] ** 2)) + 1e-9) for i in range(0, len(mono) - hop, hop)], color="#0891B2")
ax[2].set_ylim(-70, -10)
ax[2].set_ylabel("Side dB")
ax[2].set_xlabel("segundos")
ax[2].set_xticks(np.arange(0, t[-1] + 1, 1))
ax[2].grid(alpha=0.3)
plt.tight_layout()
out = path.replace(".wav", "_inspect.png")
plt.savefig(out, dpi=80)
print(out)
