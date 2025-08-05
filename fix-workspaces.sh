#!/bin/bash

# Quick fix for workspace resolution issues in production
# This creates symlinks to help bun resolve workspace dependencies

set -e

echo "🔧 Fixing workspace dependencies..."

# Ensure we're in the right directory
cd /home/ubuntu/fermi-explorer

# Create symlinks in node_modules for workspace packages
mkdir -p node_modules/@fermi

# Link shared packages
ln -sf ../../packages/shared-utils node_modules/@fermi/shared-utils
ln -sf ../../packages/shared-types node_modules/@fermi/shared-types  
ln -sf ../../packages/config node_modules/@fermi/config

# Do the same for backend
mkdir -p apps/backend/node_modules/@fermi
ln -sf ../../../../packages/shared-utils apps/backend/node_modules/@fermi/shared-utils
ln -sf ../../../../packages/shared-types apps/backend/node_modules/@fermi/shared-types
ln -sf ../../../../packages/config apps/backend/node_modules/@fermi/config

# Do the same for frontend
mkdir -p apps/frontend/node_modules/@fermi
ln -sf ../../../../packages/shared-utils apps/frontend/node_modules/@fermi/shared-utils
ln -sf ../../../../packages/shared-types apps/frontend/node_modules/@fermi/shared-types
ln -sf ../../../../packages/config apps/frontend/node_modules/@fermi/config

echo "✅ Workspace dependencies fixed!"