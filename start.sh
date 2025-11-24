#!/bin/bash

# Portfolio Planet - Quick Start Script
# This script sets up the necessary directories and starts the application

set -e

echo "🌍 Arshan's Portfolio Planet - Setup"
echo "===================================="
echo ""

# Create data directories
echo "📁 Creating data directories..."
mkdir -p data/database
mkdir -p data/logs

# Set permissions
chmod 755 data
chmod 755 data/database
chmod 755 data/logs

echo "✅ Directories created successfully"
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker compose &> /dev/null; then
    echo "🐳 Docker detected!"
    echo ""
    read -p "Run with Docker? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Building and starting Docker containers..."
        docker compose up -d --build
        echo ""
        echo "✅ Application is starting!"
        echo "📊 View logs: docker-compose logs -f"
        echo "🌐 Open: http://localhost:3000"
        echo "🛑 Stop: docker-compose down"
        exit 0
    fi
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Starting development server..."
npm run dev
