"""
Train a single 72-class model:
  0-46  : EMNIST balanced (digits 0-9, uppercase A-Z, lowercase a b d e f g h n q r t)
  47-61 : Chinese numerals (零–亿)
  62-71 : Kuzushiji-MNIST hiragana (お き す つ な は ま や れ を)

All datasets are downloaded automatically via kagglehub.
Requires ~/.kaggle/kaggle.json (see README for setup).

Usage:
    python train.py [--epochs 8] [--batch_size 128]
"""
import os, ssl
import numpy as np
import torch, torch.nn as nn
import kagglehub
from torch.utils.data import DataLoader, Dataset, ConcatDataset, Subset
from torchvision import transforms
from PIL import Image
from model import CNN

ssl._create_default_https_context = ssl._create_unverified_context
DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

MODELS_DIR = "../models"
INPUT_SIZE = 32
NUM_CLASSES = 72
os.makedirs(MODELS_DIR, exist_ok=True)

# EMNIST balanced: 0-9 digits, A-Z uppercase, then 11 visually-distinct lowercase
_EMNIST_LABELS = (
    [str(i) for i in range(10)] +
    [chr(c) for c in range(ord('A'), ord('Z') + 1)] +
    ['a', 'b', 'd', 'e', 'f', 'g', 'h', 'n', 'q', 'r', 't']
)

LABELS = (
    _EMNIST_LABELS +
    ["零","一","二","三","四","五","六","七","八","九","十","百","千","万","亿"] +
    ["お","き","す","つ","な","は","ま","や","れ","を"]
)

CHINESE_LABELS = ["零","一","二","三","四","五","六","七","八","九","十","百","千","万","亿"]
KMNIST_LABELS  = ["お","き","す","つ","な","は","ま","や","れ","を"]

_norm = transforms.Normalize((0.5,), (0.5,))


def normalize_to_canvas(img: Image.Image, random_pad: bool = False, clean: bool = False) -> Image.Image:
    """
    Universal preprocessing:
      1. Grayscale + white-on-black.
      2. If not clean: contrast-stretch then binary threshold (pixel > 20 → 255).
         If clean: threshold at > 10 only (image is already binary/near-binary).
      3. Tight-crop to stroke bounding box.
      4. Pad to square:
           random_pad=False: fixed 5% on all sides (canonical / inference).
           random_pad=True:  independent uniform [0, 0.4] per side (augmentation).
      5. Resize to INPUT_SIZE × INPUT_SIZE.

    Use clean=True for EMNIST and Kuzushiji (already tight binary images).
    Use clean=False (default) for Chinese MNIST (needs contrast normalisation).
    """
    arr = np.array(img.convert("L"), dtype=np.float32)
    if arr.mean() > 127:
        arr = 255.0 - arr
    if clean:
        arr = np.where(arr > 10, 255.0, 0.0)
    else:
        lo, hi = arr.min(), arr.max()
        if hi > lo:
            arr = (arr - lo) / (hi - lo) * 255.0
        arr = np.where(arr > 20, 255.0, 0.0)
        # remove small isolated noise blobs
        from collections import deque
        b = arr > 0
        visited = np.zeros_like(b)
        keep = np.zeros_like(b)
        min_size = max(3, int(b.sum() * 0.01))
        for sy, sx in zip(*np.where(b & ~visited)):
            queue, pixels = deque([(sy, sx)]), []
            visited[sy, sx] = True
            while queue:
                y, x = queue.popleft()
                pixels.append((y, x))
                for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
                    if 0<=ny<b.shape[0] and 0<=nx<b.shape[1] and b[ny,nx] and not visited[ny,nx]:
                        visited[ny,nx] = True
                        queue.append((ny, nx))
            if len(pixels) >= min_size:
                for y, x in pixels:
                    keep[y, x] = True
        arr = np.where(keep, 255.0, 0.0)
    rows, cols = np.where(arr > 0)
    if rows.size:
        arr = arr[rows.min():rows.max()+1, cols.min():cols.max()+1]
    h, w = arr.shape
    side = max(h, w)
    if random_pad:
        pt, pb, pl, pr = (np.random.uniform(0.0, 0.4) for _ in range(4))
    else:
        pt = pb = pl = pr = 0.05
    top, bottom, left, right = int(side*pt), int(side*pb), int(side*pl), int(side*pr)
    canvas = np.zeros((side + top + bottom, side + left + right), dtype=np.float32)
    canvas[top + (side-h)//2 : top + (side-h)//2 + h,
           left + (side-w)//2 : left + (side-w)//2 + w] = arr
    return Image.fromarray(canvas.astype(np.uint8)).resize((INPUT_SIZE, INPUT_SIZE), Image.LANCZOS)


TF_CLEAN = transforms.Compose([
    transforms.Lambda(lambda img: normalize_to_canvas(img, random_pad=False)),
    transforms.ToTensor(),
    _norm,
])

TF_AUG = transforms.Compose([
    transforms.Lambda(lambda img: normalize_to_canvas(img, random_pad=True)),
    transforms.RandomAffine(degrees=15, translate=(0.1, 0.1), shear=8, fill=0),
    transforms.ToTensor(),
    _norm,
])

# For already-clean binary images (EMNIST, Kuzushiji) — skip contrast stretch
TF_CLEAN_C = transforms.Compose([
    transforms.Lambda(lambda img: normalize_to_canvas(img, random_pad=False, clean=True)),
    transforms.ToTensor(),
    _norm,
])

TF_AUG_C = transforms.Compose([
    transforms.Lambda(lambda img: normalize_to_canvas(img, random_pad=True, clean=True)),
    transforms.RandomAffine(degrees=15, translate=(0.1, 0.1), shear=8, fill=0),
    transforms.ToTensor(),
    _norm,
])


def with_extra(clean_ds, aug_ds, frac=0.5):
    n = int(frac * len(clean_ds))
    return ConcatDataset([clean_ds, Subset(aug_ds, torch.randperm(len(aug_ds))[:n].tolist())])


def _read_idx_gz(path):
    """Read a gzipped IDX file."""
    with gzip.open(path, "rb") as f:
        magic = struct.unpack(">I", f.read(4))[0]
        ndim = magic & 0xFF
        dims = struct.unpack(">" + "I" * ndim, f.read(4 * ndim))
        return np.frombuffer(f.read(), dtype=np.uint8).reshape(dims)


class EMNIST(Dataset):
    """
    Reads EMNIST balanced from crawford/emnist (CSV format).
    Caches a .npy file next to the CSV for fast subsequent loads.
    Each row: label, pixel_0..pixel_783 (28×28, stored transposed).
    """
    def __init__(self, root, train, transform=None):
        split    = "train" if train else "test"
        csv_path = os.path.join(root, f"emnist-balanced-{split}.csv")
        npy_path = csv_path + ".npy"
        if not os.path.exists(npy_path):
            print(f"Caching {os.path.basename(csv_path)} → .npy …")
            np.save(npy_path, np.loadtxt(csv_path, delimiter=",", dtype=np.uint8))
        data = np.load(npy_path)
        self.labels = data[:, 0]
        self.imgs   = data[:, 1:].reshape(-1, 28, 28).transpose(0, 2, 1)
        self.transform = transform

    def __len__(self): return len(self.labels)

    def __getitem__(self, idx):
        img = Image.fromarray(self.imgs[idx])
        return self.transform(img) if self.transform else img, int(self.labels[idx])


class ChineseMNIST(Dataset):
    """
    Reads gpreda/chinese-mnist.
    Images at: data/data/input_<suite>_<char>_<sample>.jpg
    Label = last underscore-separated number - 1 (1-indexed → 0-indexed) + offset
    """
    def __init__(self, root, label_offset, transform=None):
        img_dir = os.path.join(root, "data", "data")
        self.transform = transform
        self.samples = [
            (os.path.join(img_dir, f), label_offset + int(f.replace(".jpg", "").split("_")[-1]) - 1)
            for f in os.listdir(img_dir) if f.endswith(".jpg")
        ]

    def __len__(self): return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path)
        return self.transform(img) if self.transform else img, label


class KuzushijiMNIST(Dataset):
    """
    Reads anokas/kuzushiji (kmnist-*.npz files).
    """
    def __init__(self, root, train, label_offset, transform=None):
        split = "train" if train else "test"
        self.imgs   = np.load(os.path.join(root, f"kmnist-{split}-imgs.npz"))["arr_0"]
        self.labels = [label_offset + int(l)
                       for l in np.load(os.path.join(root, f"kmnist-{split}-labels.npz"))["arr_0"]]
        self.transform = transform

    def __len__(self): return len(self.labels)

    def __getitem__(self, idx):
        img = Image.fromarray(self.imgs[idx])
        return self.transform(img) if self.transform else img, self.labels[idx]


def train(epochs: int = 8, batch_size: int = 128):
    print("Fetching datasets via kagglehub …")
    emnist_root  = kagglehub.dataset_download("crawford/emnist")
    chinese_root = kagglehub.dataset_download("gpreda/chinese-mnist")
    kmnist_root  = kagglehub.dataset_download("anokas/kuzushiji")

    # EMNIST balanced (47 classes, labels 0-46)
    emnist_tr_c = EMNIST(emnist_root, train=True,  transform=TF_CLEAN_C)
    emnist_tr_a = EMNIST(emnist_root, train=True,  transform=TF_AUG_C)
    emnist_va_c = EMNIST(emnist_root, train=False, transform=TF_CLEAN_C)
    emnist_va_a = EMNIST(emnist_root, train=False, transform=TF_AUG_C)

    # Chinese MNIST (90/10 split), labels 47-61
    ch_c  = ChineseMNIST(chinese_root, label_offset=47, transform=TF_CLEAN)
    ch_a  = ChineseMNIST(chinese_root, label_offset=47, transform=TF_AUG)
    idx   = torch.randperm(len(ch_c)).tolist()
    n_val = int(0.1 * len(ch_c))
    tr_idx, va_idx = idx[n_val:], idx[:n_val]

    # Kuzushiji, labels 62-71
    km_tr_c = KuzushijiMNIST(kmnist_root, train=True,  label_offset=62, transform=TF_CLEAN_C)
    km_tr_a = KuzushijiMNIST(kmnist_root, train=True,  label_offset=62, transform=TF_AUG_C)
    km_va_c = KuzushijiMNIST(kmnist_root, train=False, label_offset=62, transform=TF_CLEAN_C)
    km_va_a = KuzushijiMNIST(kmnist_root, train=False, label_offset=62, transform=TF_AUG_C)

    train_ds = ConcatDataset([
        with_extra(emnist_tr_c, emnist_tr_a),
        with_extra(Subset(ch_c, tr_idx), Subset(ch_a, tr_idx)),
        with_extra(km_tr_c, km_tr_a),
    ])
    val_ds = ConcatDataset([
        with_extra(emnist_va_c, emnist_va_a),
        with_extra(Subset(ch_c, va_idx), Subset(ch_a, va_idx)),
        with_extra(km_va_c, km_va_a),
    ])

    print(f"Train size: {len(train_ds)}  Val size: {len(val_ds)}")

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=batch_size, shuffle=False, num_workers=0)

    model     = CNN(num_classes=NUM_CLASSES, input_size=INPUT_SIZE).to(DEVICE)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0
        for x, y in train_loader:
            x, y = x.to(DEVICE), y.to(DEVICE)
            optimizer.zero_grad()
            loss = criterion(model(x), y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        scheduler.step()

        model.eval()
        correct = total = 0
        with torch.no_grad():
            for x, y in val_loader:
                x, y = x.to(DEVICE), y.to(DEVICE)
                correct += (model(x).argmax(1) == y).sum().item()
                total   += y.size(0)
        print(f"Epoch {epoch}/{epochs}  loss={total_loss/len(train_loader):.4f}  val_acc={correct/total:.4f}")

    out = f"{MODELS_DIR}/combined.pth"
    torch.save({"state_dict": model.state_dict(), "num_classes": NUM_CLASSES, "input_size": INPUT_SIZE}, out)
    print(f"Saved → {out}")


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--epochs",     type=int, default=8)
    p.add_argument("--batch_size", type=int, default=128)
    args = p.parse_args()
    train(args.epochs, args.batch_size)
