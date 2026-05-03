"""
Saves a grid of original vs preprocessed samples for all three datasets.
Run from the project root: python visualize_preprocessing.py
"""
import os, sys, struct
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image
from train import normalize_to_canvas, _read_idx

MNIST_ROOT   = os.path.expanduser("~/.cache/kagglehub/datasets/hojjatk/mnist-dataset/versions/1")
CHINESE_ROOT = os.path.expanduser("~/.cache/kagglehub/datasets/gpreda/chinese-mnist/versions/7/data/data")
KMNIST_ROOT  = os.path.expanduser("~/.cache/kagglehub/datasets/anokas/kuzushiji/versions/3")

CHINESE_LABELS = ["零","一","二","三","四","五","六","七","八","九","十","百","千","万","亿"]
KMNIST_LABELS  = ["お","き","す","つ","な","は","ま","や","れ","を"]

OUT_DIR = os.path.join(os.path.dirname(__file__), "preprocessing_samples")
os.makedirs(OUT_DIR, exist_ok=True)


def get_mnist_samples():
    imgs   = _read_idx(os.path.join(MNIST_ROOT, "train-images.idx3-ubyte"))
    labels = _read_idx(os.path.join(MNIST_ROOT, "train-labels.idx1-ubyte"))
    seen, samples = set(), []
    for img, lbl in zip(imgs, labels):
        if lbl not in seen:
            seen.add(lbl)
            samples.append((str(lbl), Image.fromarray(img)))
        if len(seen) == 10:
            break
    return sorted(samples, key=lambda x: int(x[0]))


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


datasets = [
    ("Western (MNIST)",  get_mnist_samples()),
    ("Chinese",          get_chinese_samples()),
    ("Japanese (KMNIST)", get_kmnist_samples()),
]

for ds_name, samples in datasets:
    n = len(samples)
    fig, axes = plt.subplots(2, n, figsize=(n * 1.4, 3.2))
    fig.suptitle(ds_name, fontsize=11, y=1.01)
    axes[0, 0].set_ylabel("original",     fontsize=8)
    axes[1, 0].set_ylabel("preprocessed", fontsize=8)

    for col, (label, orig) in enumerate(samples):
        processed = normalize_to_canvas(orig, random_pad=False)
        axes[0, col].imshow(orig,      cmap="gray"); axes[0, col].axis("off")
        axes[1, col].imshow(processed, cmap="gray"); axes[1, col].axis("off")
        axes[0, col].set_title(label, fontsize=9)

    plt.tight_layout()
    safe_name = ds_name.split()[0].lower()
    out_path = os.path.join(OUT_DIR, f"grid_{safe_name}.png")
    plt.savefig(out_path, dpi=130, bbox_inches="tight")
    plt.close()
    print(f"Saved {out_path}")
