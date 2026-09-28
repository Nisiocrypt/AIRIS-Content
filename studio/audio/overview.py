"""Envolventes RMS de las 8 mezclas en una sola imagen."""
import glob
import numpy as np
import soundfile as sf
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
files = sorted(glob.glob("../output/audio/v?.wav"))
fig, axs = plt.subplots(len(files), 1, figsize=(16, 2.1 * len(files)))
for ax, f in zip(axs, files):
    x, sr = sf.read(f)
    m = x.mean(axis=1)
    hop = sr // 20
    r = np.array([np.sqrt(np.mean(m[i:i + hop] ** 2)) for i in range(0, len(m) - hop, hop)])
    t = np.arange(len(r)) * hop / sr
    ax.plot(t, 20 * np.log10(r + 1e-9), color="#7C3AED")
    ax.set_ylim(-60, 0); ax.set_xlim(0, 30); ax.set_xticks(range(31)); ax.grid(alpha=0.3)
    ax.set_ylabel(f.split("/")[-1].replace(".wav", ""))
plt.tight_layout(); plt.savefig("../output/audio/overview.png", dpi=70); print("ok")
