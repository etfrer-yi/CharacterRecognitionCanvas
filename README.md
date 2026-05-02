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

**Preprocessing** (applied identically at train and inference time):
1. Convert to grayscale, resize to 32×32
2. Stretch contrast to full 0–255 range (handles faint strokes in Chinese MNIST)
3. Invert if background is white (normalise to white-on-black)
4. Normalise to [-1, 1]

**Training data** (`backend/train.py`):
- MNIST (60k train / 10k val) — downloaded automatically via Kaggle ([hojjatk/mnist-dataset](https://www.kaggle.com/datasets/hojjatk/mnist-dataset))
- Chinese MNIST (15k images, 90/10 split) — downloaded automatically via Kaggle ([gpreda/chinese-mnist](https://www.kaggle.com/datasets/gpreda/chinese-mnist))
- Kuzushiji-MNIST (60k train / 10k val) — downloaded automatically via Kaggle ([anokas/kuzushiji](https://www.kaggle.com/datasets/anokas/kuzushiji))

Each split is augmented: all originals are kept, plus 50% extra copies with random crop, affine transforms (±12° rotation, ±12% translation, 85–115% scale, ±5° shear). Augmentation is applied to training and validation sets.

**Backend** (`backend/main.py`): FastAPI server with a single `POST /predict` endpoint.

**Frontend** (`frontend/src/`): React + Vite. 280×280 canvas with thick white strokes on black background (matching training convention). Collapsible sidebar lists all 35 characters with descriptions.

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
python train.py           # default: 15 epochs, batch size 128
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
