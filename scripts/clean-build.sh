#!/bin/bash

echo "🧹 GLG Capital Group - Clean Build Script"
echo "=========================================="

# Stop any running processes
echo "🛑 Stopping any running processes..."
pkill -f "next dev" || true
pkill -f "npm run dev" || true

# Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
rm -rf .turbo

# Clean npm cache
echo "📦 Cleaning npm cache..."
npm cache clean --force

# Remove node_modules (optional - uncomment if needed)
# echo "🗑️ Removing node_modules..."
# rm -rf node_modules
# npm install

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Start development server
echo "🚀 Starting development server..."
npm run dev

echo "✅ Clean build completed!"
echo "🌐 Server should be running at http://localhost:3000" 