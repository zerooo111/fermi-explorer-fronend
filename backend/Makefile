# Continuum Backend Makefile

.PHONY: build run dev debug watch clean test install-tools help

# Default target
all: build

# Build the application
build:
	@echo "🔨 Building proxy..."
	go build -o proxy ./cmd/proxy

# Build with debug symbols
build-debug:
	@echo "🔨 Building proxy with debug symbols..."
	go build -gcflags=all="-N -l" -o proxy ./cmd/proxy

# Run the application
run: build
	@echo "🚀 Starting proxy..."
	./proxy

# Run in development mode
dev: build-debug
	@echo "🐛 Starting proxy in development mode..."
	DEBUG=true GO_ENV=development ./proxy -debug

# Run with debug logging
debug: build-debug
	@echo "🐛 Starting proxy in debug mode..."
	DEBUG=true RUST_LOG=debug ./proxy -debug

# Run with file watching (requires air)
watch:
	@echo "👀 Starting proxy with file watching..."
	@if command -v air >/dev/null 2>&1; then \
		air; \
	else \
		echo "❌ 'air' not found. Install with: make install-tools"; \
		exit 1; \
	fi

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -f proxy
	rm -rf tmp/
	rm -f .air.toml

# Run tests
test:
	@echo "🧪 Running tests..."
	go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "🧪 Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html


# Install development tools
install-tools:
	@echo "📦 Installing development tools..."
	go install github.com/cosmtrek/air@latest
	@echo "✅ Development tools installed"

# Format code
fmt:
	@echo "🎨 Formatting code..."
	go fmt ./...

# Run linter
lint:
	@echo "🔍 Running linter..."
	@if command -v golangci-lint >/dev/null 2>&1; then \
		golangci-lint run; \
	else \
		echo "❌ 'golangci-lint' not found. Install with: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; \
	fi

# Update dependencies
deps:
	@echo "📦 Updating dependencies..."
	go mod tidy
	go mod download

# Generate protobuf code (if needed)
proto:
	@echo "🔄 Generating protobuf code..."
	protoc --go_out=. --go-grpc_out=. proto/sequencer.proto

# Docker build
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t continuum-proxy .

# Docker run
docker-run: docker-build
	@echo "🐳 Running Docker container..."
	docker run -p 8080:8080 continuum-proxy

# Quick development setup
setup: deps install-tools
	@echo "🚀 Development setup complete!"

# Show help
help:
	@echo "Continuum Backend Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  build         - Build the application"
	@echo "  build-debug   - Build with debug symbols"
	@echo "  run           - Build and run the application"
	@echo "  dev           - Run in development mode"
	@echo "  debug         - Run with debug logging"
	@echo "  watch         - Run with file watching (requires air)"
	@echo "  clean         - Clean build artifacts"
	@echo "  test          - Run tests"
	@echo "  test-coverage - Run tests with coverage"
	@echo "  install-tools - Install development tools"
	@echo "  fmt           - Format code"
	@echo "  lint          - Run linter"
	@echo "  deps          - Update dependencies"
	@echo "  proto         - Generate protobuf code"
	@echo "  docker-build  - Build Docker image"
	@echo "  docker-run    - Build and run Docker container"
	@echo "  setup         - Quick development setup"
	@echo "  help          - Show this help"
	@echo ""
	@echo "Environment variables:"
	@echo "  DEBUG=true    - Enable debug mode"
	@echo "  GO_ENV=development - Set development environment"
	@echo "  HTTP_PORT=8080 - Set HTTP port"
	@echo "  GRPC_ADDR=localhost:9090 - Set gRPC address"