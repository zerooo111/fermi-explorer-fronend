# Fermi Explorer Frontend

A modern React-based blockchain explorer frontend for the Fermi Continuum network. This application provides real-time monitoring of ticks (blocks), transactions, and network status through an intuitive web interface.

## Overview

Fermi Explorer is a frontend application that connects to the Fermi Continuum sequencer to display:

- **Real-time tick data** - Live stream of network activity
- **Transaction details** - Comprehensive transaction information and history
- **Network status** - Current network health and performance metrics
- **Chain exploration** - Browse historical ticks and transactions

## Features

### Core Functionality

- 🔄 **Real-time Updates** - WebSocket connection for live data streaming
- 📊 **Network Metrics** - Current tick, transaction rates, and network uptime
- 🔍 **Search & Browse** - Search transactions by hash or browse by tick number
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- ⚡ **Performance** - Efficient data caching and optimized rendering

### Technical Highlights

- Built with **React 19** and **TypeScript** for type safety
- **TanStack Router** for client-side routing
- **TanStack Query** for efficient data fetching and caching
- **Tailwind CSS** with custom design system components
- **Vite** for fast development and optimized production builds

## Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **Backend API** running on your configured endpoint

### Installation & Development

```bash
# Install dependencies
npm install
# or
bun install

# Copy environment configuration
cp .env.example .env.local
# Edit .env.local with your specific settings

# Start development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173` (or your configured `VITE_DEV_PORT`)

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run serve
```

### Available Scripts

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Start development server on port 3000  |
| `npm run build`     | Build optimized production bundle      |
| `npm run serve`     | Preview production build               |
| `npm run test`      | Run unit tests with Vitest             |
| `npm run lint`      | Lint code with ESLint                  |
| `npm run typecheck` | Type check with TypeScript             |
| `npm run format`    | Format code with Prettier              |
| `npm run clean`     | Clean build artifacts and dependencies |

## Architecture

### Project Structure

```
src/
├── api/           # API types and WebSocket connections
├── components/    # Reusable React components
│   └── ui/       # Base UI components (buttons, tables, etc.)
├── config/       # Environment configuration
├── hooks/        # Custom React hooks for data fetching
├── lib/          # Utility functions and API clients
├── pages/        # Route components (Homepage, TickPage, etc.)
├── providers/    # React context providers
├── types/        # TypeScript type definitions
└── utils/        # Shared utility functions
```

### Key Components

#### Data Layer

- **API Client** (`src/lib/api.ts`) - Axios-based HTTP client with error handling
- **WebSocket Manager** (`src/api/websocket.ts`) - Real-time data streaming
- **React Query Integration** - Caching, background updates, and optimistic updates

#### UI Components

- **ChainStatus** - Network health and performance dashboard
- **RecentTicks** - Live feed of latest network activity
- **RecentTransactions** - Transaction history with pagination
- **TickDetailView** - Detailed tick information and embedded transactions
- **TransactionsTable** - Sortable, searchable transaction listing

#### Custom Hooks

- `useTickStream` - WebSocket connection for real-time tick updates
- `useTick` - Fetch individual tick data with fallback sources
- `useTransaction` - Transaction lookup with caching
- `useHealth` - Network status monitoring

### API Integration

The frontend connects to a backend API with the following endpoints:

| Endpoint                    | Purpose                    |
| --------------------------- | -------------------------- |
| `GET /api/v1/health`        | Network health check       |
| `GET /api/v1/status`        | Current network statistics |
| `GET /api/v1/tick/{number}` | Detailed tick information  |
| `GET /api/v1/tx/{hash}`     | Transaction details        |
| `GET /api/v1/ticks/recent`  | Recent tick summaries      |
| `WebSocket /ws`             | Real-time tick stream      |

### Configuration

#### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Copy the example file
cp .env.example .env.local
```

Key environment variables:

| Variable            | Description             | Default                  |
| ------------------- | ----------------------- | ------------------------ |
| `VITE_API_BASE_URL` | Backend API base URL    | `http://localhost:3001`  |
| `VITE_WS_URL`       | WebSocket URL           | `ws://localhost:3001/ws` |
| `VITE_DEV_PORT`     | Development server port | `5173`                   |
| `VITE_PREVIEW_PORT` | Preview server port     | `4173`                   |

#### API Configuration

The frontend makes direct API calls to the configured backend:

- API requests → `VITE_API_BASE_URL`
- WebSocket connections → `VITE_WS_URL`

For different environments, simply update these URLs in your environment configuration.

## Development

### Code Style & Linting

- **Biome** for code formatting and linting
- **TypeScript** strict mode enabled
- **ESLint** with TanStack configuration
- **Prettier** for consistent formatting

### Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm test -- --watch
```

### Type Safety

```bash
# Type check without emitting files
npm run typecheck
```

## Deployment

### Production Configuration

For production deployment, create a `.env.production` file or set environment variables:

```env
# Production API endpoints
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
```

The build process will embed these values directly into the application bundle.

### Build Optimization

The production build includes:

- Tree shaking for smaller bundle sizes
- Asset optimization and compression
- TypeScript compilation and type checking
- CSS purging and minification

## Contributing

1. Follow the existing code style and conventions
2. Ensure type safety with TypeScript
3. Add tests for new functionality
4. Run linting and type checking before committing
5. Use semantic commit messages

## Support

For issues, feature requests, or development questions, please refer to the project documentation or contact the development team.

---

**Fermi Explorer** - Exploring the Fermi Continuum, one tick at a time.
