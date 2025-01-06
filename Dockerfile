# Build frontend
FROM node:20-alpine as frontend-builder
WORKDIR /frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build

# Build backend
FROM python:3.11-slim
WORKDIR /app
COPY backend/pyproject.toml .
RUN pip install --upgrade pip && \
    pip install .
COPY backend/ .
COPY --from=frontend-builder /frontend/dist static/
EXPOSE 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]