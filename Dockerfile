# Build stage for frontend
FROM node:20-slim as frontend-builder
WORKDIR /app/frontend

# Copy package files first
COPY frontend/package.json ./

RUN npm install -g pnpm

RUN pnpm install

# Then copy the rest of the frontend files
COPY frontend/ ./
RUN pnpm build

# Final stage
FROM python:3.12-slim as backend
WORKDIR /app

# Install UV and Gunicorn
RUN pip install uv gunicorn uvicorn

# Copy backend files
COPY backend .

# Install dependencies using UV from pyproject.toml
RUN uv pip install . --system

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port
EXPOSE 8000

# Run with Gunicorn and uvicorn workers
CMD ["gunicorn", "server.server:app", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--timeout", "600", \
     "--keep-alive", "600", \
     "--graceful-timeout", "600"]