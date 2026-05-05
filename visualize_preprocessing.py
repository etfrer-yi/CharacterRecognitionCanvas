"""
Saves a grid of original vs preprocessed samples for all datasets.
Run from the project root: python visualize_preprocessing.py
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image
from train import normalize_to_canvas, _EMNIST_LABELS, CHINESE_LABELS, KMNIST_LABELS, HANGUL_FOLDER_MAP

_KAGGLE_CACHE = os.environ.get("KAGGLEHUB_CACHE") or os.path.expanduser("~/.cache/kagglehub/datasets")

def _latest(base, *parts):
    path = os.path.join(base, *parts, "versions")
    if os.path.isdir(path):
        versions = sorted(d for d in os.listdir(path) if d.isdigit())
        if versions:
            return os.path.join(path, versions[-1])
    return os.path.join(base, *parts)

EMNIST_ROOT  = _latest(_KAGGLE_CACHE, "crawford/emnist")
CHINESE_ROOT = os.path.join(_latest(_KAGGLE_CACHE, "gpreda/chinese-mnist"), "data", "data")
KMNIST_ROOT  = _latest(_KAGGLE_CACHE, "anokas/kuzushiji")
HANGUL_ROOT  = os.path.join(_latest(_KAGGLE_CACHE, "jkim289/handwritten-korean-characters"),
                             "Hangul Database", "Hangul Database")

OUT_DIR = os.path.join(os.path.dirname(__file__), "preprocessing_samples")
os.makedirs(OUT_DIR, exist_ok=True)


def get_emnist_samples():
    csv_path = os.path.join(EMNIST_ROOT, "emnist-balanced-train.csv")
    data   = np.loadtxt(csv_path, delimiter=",", dtype=np.uint8)
    labels = data[:, 0]
    imgs   = data[:, 1:].reshape(-1, 28, 28).transpose(0, 2, 1)
    seen, samples = set(), []
    for img, lbl in zip(imgs, labels):
        lbl = int(lbl)
        if lbl not in seen:
            seen.add(lbl)
            samples.append((_EMNIST_LABELS[lbl], Image.fromarray(img)))
        if len(seen) == 47:
            break
    return sorted(samples, key=lambda x: _EMNIST_LABELS.index(x[0]))


def get_chinese_samples():
    samples = {}
    for fname in sorted(os.listdir(CHINESE_ROOT)):
        if not fname.endswith(".jpg"):
            continue
        cls = int(fname.replace(".jpg", "").split("_")[-1])
        if cls not in samples:
            samples[cls] = Image.open(os.path.join(CHINESE_ROOT, fname))
        if len(samples) == 15:
            break
    return [(CHINESE_LABELS[k-1], samples[k]) for k in sorted(samples)]


def get_kmnist_samples():
    imgs   = np.load(os.path.join(KMNIST_ROOT, "kmnist-train-imgs.npz"))["arr_0"]
    labels = np.load(os.path.join(KMNIST_ROOT, "kmnist-train-labels.npz"))["arr_0"]
    seen, samples = set(), []
    for img, lbl in zip(imgs, labels):
        lbl = int(lbl)
        if lbl not in seen:
            seen.add(lbl)
            samples.append((KMNIST_LABELS[lbl], Image.fromarray(img)))
        if len(seen) == 10:
            break
    return sorted(samples, key=lambda x: KMNIST_LABELS.index(x[0]))


def get_hangul_samples():
    samples = []
    for folder, char in HANGUL_FOLDER_MAP.items():
        folder_path = os.path.join(HANGUL_ROOT, folder)
        if not os.path.isdir(folder_path):
            continue
        files = sorted(os.listdir(folder_path))
        if files:
            samples.append((char, Image.open(os.path.join(folder_path, files[0]))))
    return samples


datasets = [
    ("EMNIST balanced",   get_emnist_samples(),  "emnist"),
    ("Chinese",           get_chinese_samples(), "chinese"),
    ("Japanese (KMNIST)", get_kmnist_samples(),  "japanese"),
    ("Korean Hangul",     get_hangul_samples(),  "hangul"),
]

for ds_name, samples, fname in datasets:
    n    = len(samples)
    cols = min(n, 16)                        # wrap at 16 columns
    rows = (n + cols - 1) // cols            # number of class-row groups
    fig, axes = plt.subplots(rows * 2, cols, figsize=(cols * 1.4, rows * 3.2))
    if axes.ndim == 1:
        axes = axes.reshape(-1, cols)
    fig.suptitle(ds_name, fontsize=11, y=1.01)

    for i, (label, orig) in enumerate(samples):
        r, c = divmod(i, cols)
        processed = normalize_to_canvas(orig, random_pad=False)
        axes[r*2,   c].imshow(orig,      cmap="gray"); axes[r*2,   c].axis("off")
        axes[r*2+1, c].imshow(processed, cmap="gray"); axes[r*2+1, c].axis("off")
        if c == 0:
            axes[r*2,   0].set_ylabel("original",     fontsize=8)
            axes[r*2+1, 0].set_ylabel("preprocessed", fontsize=8)

    # hide unused cells in last row
    for j in range(n % cols if n % cols else cols, cols):
        axes[(rows-1)*2,   j].axis("off")
        axes[(rows-1)*2+1, j].axis("off")

    plt.tight_layout()
    out_path = os.path.join(OUT_DIR, f"grid_{fname}.png")
    plt.savefig(out_path, dpi=130, bbox_inches="tight")
    plt.close()
    print(f"Saved {out_path}")
