# Frontend Application

A modern React TypeScript application with real-time capabilities through WebSocket integration.

## 📁 Project Structure

```
frontend/
├── src/              # Source code
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   └── utils/        # Utility functions
├── tests/            # Test files
└── public/           # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- pnpm (preferred package manager)

### Development Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

The project uses several configuration files:
- `vite.config.ts`: Vite build configuration
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `components.json`: UI component configuration

## 🎨 Styling

- Tailwind CSS for utility-first styling
- Custom components using shadcn/ui
- Responsive design patterns

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run Playwright e2e tests
pnpm test:e2e
```

## 📦 Build

To create a production build:
```bash
pnpm build
```

The build output will be in the `dist` directory.

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- WebSocket for real-time features
- Playwright for E2E testing

## 📚 Key Dependencies

See `package.json` for a complete list of dependencies and their versions. 