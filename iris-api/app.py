from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
import torch, io
from torchvision import models, transforms
from PIL import Image

app = FastAPI(title="Image Classifier")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ml-production-learn.vercel.app"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

weights = models.MobileNet_V2_Weights.IMAGENET1K_V1
model = models.mobilenet_v2(weights=weights).eval()
labels = weights.meta["categories"]

preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await file.read())).convert('RGB')
    x = preprocess(img).unsqueeze(0)
    with torch.no_grad():
        probs = torch.softmax(model(x)[0], dim=0)
    top = torch.topk(probs, 3)
    return {
        'predictions': [
            {'label': labels[i], 'confidence': round(float(p), 4)}
            for p, i in zip(top.values, top.indices)
        ]}

app.mount('/', StaticFiles(directory='static', html=True), name='static')

