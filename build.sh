#!/bin/bash
set -e

echo "🏗️ Building Dental Clinic Frontend..."

# Navigate to frontend directory
cd frontend

# Clean install dependencies
npm ci

# Build the frontend
npm run build

echo "✅ Build completed successfully!"
