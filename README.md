# AI Web Services

A modern web application with AI capabilities, built using Python FastAPI backend and React TypeScript frontend.

## 🏗️ Project Structure

```
.
├── backend/               # Python FastAPI backend
│   ├── server/           # Main server code
│   ├── api/              # API definitions
│   ├── tests/            # Backend tests
│   └── static/           # Static files
├── frontend/             # React TypeScript frontend
│   ├── src/             # Source code
│   └── tests/           # Frontend tests
└── data/                # Data storage directory
```

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for frontend development)
- pnpm (for frontend package management)
- Python 3.x (for backend development)
- MongoDB
- Ollama (for AI capabilities)

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` in the backend directory and configure your environment variables
3. Install dependencies:
   ```bash
   # Backend
   cd backend
   pip install uv  # Install uv package manager
   uv pip install -e .  # Install from pyproject.toml

   # Frontend
   cd frontend
   pnpm install
   ```

### Running with Docker

```bash
docker-compose up
```

This will start:
- Backend service on port 8000
- MongoDB on port 27017
- Frontend development server

### Development

#### Backend
- Built with FastAPI
- Uses MongoDB for data storage
- Integrates with Ollama for AI capabilities
- WebSocket support for real-time communications

#### Frontend
- Built with React + TypeScript
- Uses Vite as build tool
- Tailwind CSS for styling
- WebSocket integration for real-time features

## 🔧 Configuration

### Backend Configuration
- MongoDB connection URL
- Ollama host configuration
- API endpoints configuration

### Frontend Configuration
- API endpoint configuration
- WebSocket connection settings
- Build and development settings through `vite.config.ts`

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
pnpm test
```

## 📦 Deployment

The application is containerized using Docker and can be deployed using the provided Dockerfile and docker-compose.yml.

## 🛠️ Tech Stack

- **Backend**:
  - FastAPI (Python)
  - MongoDB
  - WebSockets
  - Ollama AI integration

- **Frontend**:
  - React
  - TypeScript
  - Tailwind CSS
  - Vite

## 📝 License

[Add your license here]