"""
Train a single 35-class model:
  0-9   : MNIST digits
  10-24 : Chinese numerals (零–亿)
  25-34 : Kuzushiji-MNIST hiragana (お き す つ な は ま や れ を)

All datasets are downloaded automatically via kagglehub.
Requires ~/.kaggle/kaggle.json (see README for setup).

Usage:
    python train.py [--epochs 8] [--batch_size 128]
"""
import os, ssl, struct
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
os.makedirs(MODELS_DIR, exist_ok=True)

LABELS = (
    [str(i) for i in range(10)] +
    ["零","一","二","三","四","五","六","七","八","九","十","百","千","万","亿"] +
    ["お","き","す","つ","な","は","ま","や","れ","を"]
)

_norm = transforms.Normalize((0.5,), (0.5,))


def standardize(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("L").resize((INPUT_SIZE, INPUT_SIZE), Image.LANCZOS), dtype=np.float32)
    lo, hi = arr.min(), arr.max()
    if hi > lo:
        arr = (arr - lo) / (hi - lo) * 255.0
    if arr.mean() > 127:
        arr = 255.0 - arr
    return Image.fromarray(arr.astype(np.uint8))


TF_CLEAN = transforms.Compose([transforms.Lambda(standardize), transforms.ToTensor(), _norm])
TF_AUG   = transforms.Compose([
    transforms.Lambda(standardize),
    transforms.RandomApply([transforms.RandomResizedCrop(INPUT_SIZE, scale=(0.7, 1.0), ratio=(0.9, 1.1))], p=0.6),
    transforms.RandomAffine(degrees=12, translate=(0.12, 0.12), scale=(0.85, 1.15), shear=5, fill=0),
    transforms.ToTensor(), _norm,
])


def with_extra(clean_ds, aug_ds, frac=0.5):
    n = int(frac * len(clean_ds))
    return ConcatDataset([clean_ds, Subset(aug_ds, torch.randperm(len(aug_ds))[:n].tolist())])


def _read_idx(path):
    """Read an IDX file (raw, not gzipped)."""
    with open(path, "rb") as f:
        magic = struct.unpack(">I", f.read(4))[0]
        ndim = magic & 0xFF
        dims = struct.unpack(">" + "I" * ndim, f.read(4 * ndim))
        return np.frombuffer(f.read(), dtype=np.uint8).reshape(dims)


class MNISTKaggle(Dataset):
    """
    Reads MNIST from hojjatk/mnist-dataset.
    Files: train-images.idx3-ubyte, train-labels.idx1-ubyte,
           t10k-images.idx3-ubyte,  t10k-labels.idx1-ubyte
    """
    def __init__(self, root, train, transform=None):
        prefix = "train" if train else "t10k"
        self.imgs   = _read_idx(os.path.join(root, f"{prefix}-images.idx3-ubyte"))
        self.labels = _read_idx(os.path.join(root, f"{prefix}-labels.idx1-ubyte"))
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
        return self.transform(Image.open(path)) if self.transform else Image.open(path), label


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
    mnist_root   = kagglehub.dataset_download("hojjatk/mnist-dataset")
    chinese_root = kagglehub.dataset_download("gpreda/chinese-mnist")
    kmnist_root  = kagglehub.dataset_download("anokas/kuzushiji")

    # MNIST
    mnist_tr_c = MNISTKaggle(mnist_root, train=True,  transform=TF_CLEAN)
    mnist_tr_a = MNISTKaggle(mnist_root, train=True,  transform=TF_AUG)
    mnist_va_c = MNISTKaggle(mnist_root, train=False, transform=TF_CLEAN)
    mnist_va_a = MNISTKaggle(mnist_root, train=False, transform=TF_AUG)

    # Chinese MNIST (90/10 split)
    ch_c  = ChineseMNIST(chinese_root, label_offset=10, transform=TF_CLEAN)
    ch_a  = ChineseMNIST(chinese_root, label_offset=10, transform=TF_AUG)
    idx   = torch.randperm(len(ch_c)).tolist()
    n_val = int(0.1 * len(ch_c))
    tr_idx, va_idx = idx[n_val:], idx[:n_val]

    # Kuzushiji
    km_tr_c = KuzushijiMNIST(kmnist_root, train=True,  label_offset=25, transform=TF_CLEAN)
    km_tr_a = KuzushijiMNIST(kmnist_root, train=True,  label_offset=25, transform=TF_AUG)
    km_va_c = KuzushijiMNIST(kmnist_root, train=False, label_offset=25, transform=TF_CLEAN)
    km_va_a = KuzushijiMNIST(kmnist_root, train=False, label_offset=25, transform=TF_AUG)

    train_ds = ConcatDataset([
        with_extra(mnist_tr_c, mnist_tr_a),
        with_extra(Subset(ch_c, tr_idx), Subset(ch_a, tr_idx)),
        with_extra(km_tr_c, km_tr_a),
    ])
    val_ds = ConcatDataset([
        with_extra(mnist_va_c, mnist_va_a),
        with_extra(Subset(ch_c, va_idx), Subset(ch_a, va_idx)),
        with_extra(km_va_c, km_va_a),
    ])

    print(f"Train size: {len(train_ds)}  Val size: {len(val_ds)}")

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=batch_size, shuffle=False, num_workers=0)

    model     = CNN(num_classes=35, input_size=INPUT_SIZE).to(DEVICE)
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
    torch.save({"state_dict": model.state_dict(), "num_classes": 35, "input_size": INPUT_SIZE}, out)
    print(f"Saved → {out}")


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--epochs",     type=int, default=8)
    p.add_argument("--batch_size", type=int, default=128)
    args = p.parse_args()
    train(args.epochs, args.batch_size)
