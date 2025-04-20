#!/bin/bash

# Make script stop on first error
set -e

# Ensure we're not using pnpm
echo "🔄 Setting up npm environment..."

# Remove any pnpm files
rm -f pnpm-lock.yaml
rm -rf .pnpm-store
rm -rf node_modules/.pnpm

# Create .npmrc file
cat > .npmrc << EOL
engine-strict=true
legacy-peer-deps=true
EOL

# Install dependencies with npm
echo "📦 Installing dependencies with npm..."
npm install --legacy-peer-deps

# Build the application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!" 