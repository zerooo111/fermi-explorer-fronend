# Project Structure & Organization

## Monorepo Layout

```
fermi-explorer-monorepo/
├── frontend/              # React frontend application
├── bun-backend/          # Bun/TypeScript backend service
├── logs/                  # Runtime logs
├── .kiro/                 # Kiro AI assistant configuration
├── start.sh               # Unified startup script
└── README.md              # Main documentation
```

## Frontend Structure (`frontend/`)

### Core Application
```
frontend/src/
├── main.tsx               # Application entry point
├── router.tsx             # TanStack Router configuration
├── styles.css             # Global styles (Tailwind)
└── vite-env.d.ts          # Vite type definitions
```

### Feature Organization
```
frontend/src/
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix-based)
│   ├── Layout.tsx        # Main layout wrapper
│   ├── Header.tsx        # Navigation header
│   ├── ErrorBoundary.tsx # Error handling
│   └── index.ts          # Component exports
├── pages/                # Route components
│   ├── Homepage.tsx      # Main dashboard
│   ├── TransactionPage.tsx # Transaction details
│   ├── TickPage.tsx      # Tick details
│   └── NotFound.tsx      # 404 page
├── hooks/                # Custom React hooks
│   ├── useTransaction.ts # Transaction data fetching
│   ├── useTick.ts        # Tick data fetching
│   ├── useTickStream.ts  # WebSocket streaming
│   └── index.ts          # Hook exports
├── api/                  # API layer
│   ├── client.ts         # HTTP client with retry logic
│   ├── types.ts          # API response types
│   ├── queryKeys.ts      # TanStack Query keys
│   └── websocket.ts      # WebSocket client
├── providers/            # React context providers
│   └── QueryProvider.tsx # TanStack Query setup
├── lib/                  # Utility libraries
│   ├── utils.ts          # General utilities
│   └── formatters.ts     # Data formatting
└── config/               # Configuration
    └── env.ts            # Environment variables
```

## Backend Structure (`bun-backend/`)

### Application Entry
```
bun-backend/
├── src/                  # TypeScript source code
│   └── main.go           # Entry point with server setup
├── go.mod                # Go module definition
├── go.sum                # Dependency checksums
└── Makefile              # Build automation
```

### Internal Packages
```
backend/internal/
├── handlers/             # HTTP request handlers
│   ├── handlers.go       # REST API endpoints
│   └── middleware.go     # HTTP middleware
├── grpc/                 # gRPC client wrapper
│   └── client.go         # Sequencer gRPC client
└── websocket/            # WebSocket streaming
    ├── stream.go         # WebSocket handlers
    └── stream_test.go    # WebSocket tests
```

### Protocol Definitions
```
backend/proto/
├── sequencer.proto       # Protocol buffer definition
├── sequencer.pb.go       # Generated Go types
└── sequencer_grpc.pb.go  # Generated gRPC client
```

### Development & Scripts
```
backend/
├── run.sh                # Development runner script
├── DEVELOPMENT.md        # Development guide
├── dev.env               # Development environment
└── test-*.sh             # Testing scripts
```

## Naming Conventions

### Frontend
- **Components**: PascalCase (`TransactionPage.tsx`)
- **Hooks**: camelCase with `use` prefix (`useTransaction.ts`)
- **Utilities**: camelCase (`formatters.ts`)
- **Types**: PascalCase interfaces (`TransactionResponse`)
- **Constants**: UPPER_SNAKE_CASE

### Backend
- **Packages**: lowercase (`handlers`, `websocket`)
- **Files**: snake_case (`stream_test.go`)
- **Functions**: camelCase (Go convention)
- **Types**: PascalCase (Go convention)
- **Constants**: PascalCase or camelCase (Go convention)

## File Organization Patterns

### Component Co-location
- Keep related files together (component + test + styles if needed)
- Use index files for clean imports
- Separate UI components from business logic components

### API Layer Separation
- Centralized HTTP client with error handling
- Type definitions separate from implementation
- Query keys organized by feature

### Hook Organization
- One hook per file
- Export from index for clean imports
- Custom hooks follow `use*` naming convention

### Backend Package Structure
- Internal packages for application logic
- Clear separation between HTTP and gRPC layers
- Middleware organized by concern

## Import Conventions

### Frontend
```typescript
// External libraries first
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

// Internal imports with @ alias
import { apiClient } from '@/api/client'
import type { TransactionResponse } from '@/api/types'
```

### Backend
```go
// Standard library first
import (
    "context"
    "fmt"
    "log"
)

// Third-party packages
import (
    "github.com/gorilla/mux"
    "google.golang.org/grpc"
)

// Internal packages last
import (
    "github.com/continuum/bun-backend/internal/handlers"
)
```

## Configuration Files

### Frontend Config
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - UI component configuration

### Backend Config
- `go.mod` - Go module and dependencies
- `Makefile` - Build and development tasks
- `dev.env` - Development environment variables

## Testing Organization

### Frontend
- Tests co-located with components (`*.test.tsx`)
- Test utilities in dedicated folders
- Vitest configuration in `vite.config.ts`

### Backend
- Tests co-located with packages (`*_test.go`)
- Integration tests in separate files
- Test coverage reports generated to `coverage.html`