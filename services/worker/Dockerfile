FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
COPY app ./app

RUN pip install --no-cache-dir .

RUN mkdir -p /data/warehouse /data/inbox

ENV WAREHOUSE_DIR=/data/warehouse \
    INBOX_DIR=/data/inbox \
    JOB_DB=/data/jobs.sqlite3 \
    CATALOG_FILE=/data/catalog.json

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8787/health || exit 1

CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "8787", "--workers", "1"]
