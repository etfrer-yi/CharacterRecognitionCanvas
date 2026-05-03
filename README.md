# Character Recognition Canvas

A web app for recognising handwritten characters. Draw on a canvas and a CNN model identifies what you drew from 35 possible characters across three writing systems.

## Recognised characters

| Category | Characters |
|---|---|
| Western digits | 0 1 2 3 4 5 6 7 8 9 |
| Chinese numerals | 零 一 二 三 四 五 六 七 八 九 十 百 千 万 亿 |
| Kuzushiji hiragana | お き す つ な は ま や れ を |

## Architecture

A single CNN is trained jointly on all three datasets and outputs a probability distribution over all 35 classes. There is no routing step — the model distinguishes between writing systems implicitly.

**Model** (`backend/model.py`): two conv+pool blocks → 256-unit FC → 35-class output. Input is 32×32 grayscale.

## The bounding box problem

### Problem

After the initial version was working, a usability issue emerged: Chinese characters had to be drawn noticeably smaller than Western digits or Japanese hiragana to be recognised correctly. Drawing 三 at full canvas size would fail; drawing it small and centred would succeed.

### Diagnosis

Inspecting the raw training images revealed the root cause — each dataset has a very different natural bounding box fill ratio:

| Dataset | Mean bbox fill (raw) |
|---|---|
| Chinese MNIST | ~12% |
| MNIST digits | ~37% |
| Kuzushiji hiragana | ~70% |

Chinese MNIST images are 64×64 but the character strokes occupy only a small central region, surrounded by black padding. MNIST digits and Kuzushiji are tightly cropped to their strokes. The model therefore learned that "Chinese character" means a small mark in a large black field. When a user drew a Chinese character filling the canvas, the model had never seen that distribution.

### Brainstorming

Two approaches were considered:

**Option A — Script-aware routing:** detect which writing system is being drawn and apply different scaling at inference. Rejected: requires knowing the script before recognition, which is circular.

**Option B — Normalise training data to a canonical scale, then augment widely:** tight-crop every training image to its stroke bounding box, pad uniformly, and use wide-range scale augmentation so the model sees every character at every possible fill ratio. This makes the pipeline dataset-agnostic — any new dataset, regardless of its natural padding, gets normalised to the same starting point.

### Solution

`normalize_to_canvas` (applied identically at train and inference time):
1. Convert to grayscale; invert if background is white (normalise to white-on-black)
2. Stretch contrast to full 0–255 range
3. Binary threshold: pixel > 20 → 255, else 0
4. Remove noise: drop connected components smaller than 1% of total foreground pixels
5. Tight-crop to the stroke bounding box
6. Pad to a square:
   - canonical / inference (`random_pad=False`): fixed 5% margin on all sides
   - augmentation (`random_pad=True`): independent uniform [0%, 40%] per side
7. Resize to 32×32

`TF_AUG` additionally applies `RandomAffine(degrees=15, translate=(0.1, 0.1), shear=8)` on top of the random-pad normalisation, so the model trains on characters at a wide range of sizes, positions, and orientations. This directly covers the range from a small careful drawing to a large stroke filling the whole canvas.

**Training data** (`backend/train.py`):
- MNIST (60k train / 10k val) — downloaded automatically via Kaggle ([hojjatk/mnist-dataset](https://www.kaggle.com/datasets/hojjatk/mnist-dataset))
- Chinese MNIST (15k images, 90/10 split) — downloaded automatically via Kaggle ([gpreda/chinese-mnist](https://www.kaggle.com/datasets/gpreda/chinese-mnist))
- Kuzushiji-MNIST (60k train / 10k val) — downloaded automatically via Kaggle ([anokas/kuzushiji](https://www.kaggle.com/datasets/anokas/kuzushiji))

Each split uses all originals (`TF_CLEAN`) plus 50% extra augmented copies (`TF_AUG`, with random-pad normalisation + `RandomAffine`).

**Backend** (`backend/main.py`): FastAPI server with a single `POST /predict` endpoint.

**Frontend** (`frontend/src/`): React + Vite. 280×280 canvas with thick white strokes on black background (matching training convention). Collapsible sidebar lists all 35 characters with descriptions.

## Extending to new datasets

The pipeline is dataset-agnostic. To add a new character set:

1. Write a `Dataset` subclass that yields `(PIL.Image, label)` pairs — no preprocessing needed in the class itself
2. Pass it `TF_CLEAN` and `TF_AUG`; `normalize_to_canvas` handles all bounding box and polarity differences automatically
3. Add it to the `ConcatDataset` in `train()` with the appropriate label offset
4. Update `LABELS` in both `train.py` and `main.py`

The only assumption is that source images contain a single character per image.

## Preprocessing samples

`visualize_preprocessing.py` generates side-by-side original vs preprocessed grids for all three datasets into `preprocessing_samples/`:

| File | Contents |
|---|---|
| `grid_western.png` | MNIST digits 0–9 |
| `grid_chinese.png` | Chinese numerals 零–亿 |
| `grid_japanese.png` | Kuzushiji hiragana お き す つ な は ま や れ を |

```bash
python visualize_preprocessing.py
```

Requires the Kaggle datasets to be cached locally (run `train.py` first, or download manually).

## Project structure

```
CharacterRecognitionCanvas/
├── backend/
│   ├── model.py          # CNN definition
│   ├── train.py          # Training script
│   ├── main.py           # FastAPI server
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx       # Canvas + prediction UI
│       └── Sidebar.jsx   # Character reference sidebar
├── models/
│   └── combined.pth      # Trained model (35 classes)
├── preprocessing_samples/
│   ├── grid_western.png
│   ├── grid_chinese.png
│   └── grid_japanese.png
├── visualize_preprocessing.py
└── .gitignore
```

## Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

### Kaggle
Ensure you have
```
{
  "username": "your_kaggle_username",
  "key": "your_kaggle_api_key"
}
```
in `~/.kaggle/kaggle.json` for pulling down the data

## Datasets

All three datasets are downloaded automatically by `train.py` via [kagglehub](https://github.com/Kaggle/kagglehub):

| Dataset | Kaggle slug |
|---|---|
| MNIST | [hojjatk/mnist-dataset](https://www.kaggle.com/datasets/hojjatk/mnist-dataset) |
| Chinese MNIST | [gpreda/chinese-mnist](https://www.kaggle.com/datasets/gpreda/chinese-mnist) |
| Kuzushiji-MNIST | [anokas/kuzushiji](https://www.kaggle.com/datasets/anokas/kuzushiji) |

**Kaggle credentials setup** (one-time):
1. Go to https://www.kaggle.com/settings → API → Create New Token
2. Place the downloaded `kaggle.json` at `~/.kaggle/kaggle.json`
3. `chmod 600 ~/.kaggle/kaggle.json`

## Training

```bash
cd backend
source venv/bin/activate
python train.py           # default: 8 epochs, batch size 128
python train.py --epochs 20 --batch_size 64
```

A pre-trained `models/combined.pth` is included.

## Running

**Terminal 1 — backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --port 8000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**.

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/predict` | Accepts a PNG file, returns prediction |
| `GET` | `/models` | Lists loaded models |

`POST /predict` response:
```json
{
  "prediction": "三",
  "top5": [
    { "label": "三", "prob": 0.9821 },
    { "label": "二", "prob": 0.0102 },
    { "label": "一", "prob": 0.0041 },
    { "label": "三", "prob": 0.0021 },
    { "label": "7",  "prob": 0.0015 }
  ]
}
```
