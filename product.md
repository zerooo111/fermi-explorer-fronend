# Fermi Explorer Product Overview

Fermi Explorer is a comprehensive blockchain data explorer for the Continuum Sequencer network. It provides real-time blockchain data visualization through a modern web interface with live streaming capabilities.

## Core Features

- **Real-time Data Streaming**: Live tick data via WebSocket connections
- **Transaction Explorer**: View and search blockchain transactions by hash
- **Tick Explorer**: Browse blockchain ticks with detailed information
- **Health Monitoring**: System status and health checks
- **Responsive Design**: Modern UI optimized for desktop and mobile

## Architecture

The system follows a proxy architecture pattern:
- **Frontend**: React SPA with TanStack Router and Query for data management
- **Backend**: Go proxy service that bridges REST/WebSocket to gRPC
- **Sequencer**: Continuum Sequencer providing the blockchain data via gRPC

## Key User Flows

1. **Homepage**: Overview of recent blockchain activity
2. **Transaction Details**: Deep dive into specific transactions
3. **Tick Details**: Examine individual blockchain ticks
4. **Live Updates**: Real-time streaming of new blockchain data

## Target Users

- Blockchain developers debugging transactions
- Network operators monitoring system health
- Researchers analyzing blockchain data patterns
- Users tracking specific transactions or ticks