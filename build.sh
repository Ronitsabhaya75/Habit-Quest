#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🔄 Setting up npm environment..."

# Install dependencies if node_modules doesn't exist or if package.json has changed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
  echo "📦 Installing dependencies with npm..."
  npm install
fi

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!" 