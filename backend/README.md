# Backend Service

The backend service is built with FastAPI and provides AI-powered web services with WebSocket support.

## 📁 Directory Structure

```
backend/
├── server/           # Main server implementation
│   ├── routes/      # API route handlers
│   ├── services/    # Business logic and services
│   └── middleware/  # Request/response middleware
├── api/             # API definitions and schemas
├── static/          # Static file serving
├── tests/           # Test suite
└── list/            # List management functionality
```

## 🚀 Local Development

### Environment Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install uv (if not already installed):
   ```bash
   pip install uv
   ```

3. Install dependencies with uv:
   ```bash
   uv pip install -e .
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running the Server

```bash
uvicorn server.server:app --reload
```

The server will start at `http://localhost:8000`

### API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔧 Configuration

Key environment variables:
- `MONGODB_URL`: MongoDB connection string
- `OLLAMA_HOST`: Ollama AI service host
- Other configuration variables can be found in `.env.example`

## 🧪 Testing

Run tests with pytest:
```bash
pytest
```

## 📦 Dependencies

Major dependencies include:
- FastAPI: Web framework
- MongoDB: Database
- WebSockets: Real-time communication
- Ollama: AI service integration

See `pyproject.toml` for a complete list of dependencies and their versions.
