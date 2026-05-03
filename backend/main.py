import io, os
import numpy as np
import torch
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from torchvision import transforms
from PIL import Image
from model import CNN

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
MODEL_PATH = "../models/combined.pth"
INPUT_SIZE = 32
LABELS = (
    [str(i) for i in range(10)] +
    ["零","一","二","三","四","五","六","七","八","九","十","百","千","万","亿"] +
    ["お","き","す","つ","な","は","ま","や","れ","を"]
)

model = None


@app.on_event("startup")
def startup():
    global model
    if not os.path.exists(MODEL_PATH):
        print(f"WARNING: {MODEL_PATH} not found — run train.py")
        return
    ckpt = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
    m = CNN(ckpt["num_classes"], ckpt["input_size"]).to(DEVICE)
    m.load_state_dict(ckpt["state_dict"])
    m.eval()
    model = m
    print("Loaded combined model (35 classes)")


def preprocess(img: Image.Image) -> torch.Tensor:
    arr = np.array(img.convert("L"), dtype=np.float32)
    if arr.mean() > 127:
        arr = 255.0 - arr
    lo, hi = arr.min(), arr.max()
    if hi > lo:
        arr = (arr - lo) / (hi - lo) * 255.0
    arr = np.where(arr > 10, 255.0, 0.0)
    rows, cols = np.where(arr > 0)
    if rows.size:
        arr = arr[rows.min():rows.max()+1, cols.min():cols.max()+1]
    h, w = arr.shape
    side = max(h, w)
    pad = int(side * 0.05)
    canvas = np.zeros((side + 2*pad, side + 2*pad), dtype=np.float32)
    canvas[pad + (side-h)//2 : pad + (side-h)//2 + h,
           pad + (side-w)//2 : pad + (side-w)//2 + w] = arr
    out = Image.fromarray(canvas.astype(np.uint8)).resize((INPUT_SIZE, INPUT_SIZE), Image.LANCZOS)
    tf = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])
    return tf(out).unsqueeze(0).to(DEVICE)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(503, "Model not loaded. Run: python train.py")
    img = Image.open(io.BytesIO(await file.read()))
    with torch.no_grad():
        probs = torch.softmax(model(preprocess(img)), dim=1)[0]
    top5 = probs.topk(5)
    results = [{"label": LABELS[i], "prob": round(p, 4)}
               for i, p in zip(top5.indices.tolist(), top5.values.tolist())]
    return {"prediction": results[0]["label"], "top5": results}


@app.get("/models")
def list_models():
    return {"loaded": ["combined"] if model else []}
