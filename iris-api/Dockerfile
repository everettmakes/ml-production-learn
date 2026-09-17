FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "from torchvision import models; models.mobilenet_v2(weights='IMAGENET1K_V1')"
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD exec uvicorn app:app --host 0.0.0.0 --port $PORT