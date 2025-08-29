#!/bin/bash

# IronLedger MedMap Deployment Script
set -e

echo "🚀 Starting deployment process..."

# Environment check
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  Warning: NODE_ENV is not set to production"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "VITE_PAYFAST_MERCHANT_ID"
    "VITE_PAYFAST_MERCHANT_KEY"
    "VITE_PAYFAST_PASSPHRASE"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Database health check
echo "🔍 Checking database connectivity..."
npm run db:health || {
    echo "❌ Database health check failed"
    exit 1
}

echo "✅ Database connectivity confirmed"

# Run database migrations
echo "📊 Running database migrations..."
npm run db:migrate || {
    echo "❌ Database migrations failed"
    exit 1
}

echo "✅ Database migrations completed"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🏗️  Building application..."
npm run build

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level moderate || {
    echo "⚠️  Security vulnerabilities found. Please review and fix."
    read -p "Continue deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Test the build
echo "🧪 Testing the build..."
timeout 30 npm start &
SERVER_PID=$!
sleep 10

# Health check
if curl -f http://localhost:${PORT:-5000}/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
    kill $SERVER_PID
else
    echo "❌ Health check failed"
    kill $SERVER_PID
    exit 1
fi

echo "🎉 Deployment preparation completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   - Environment: $NODE_ENV"
echo "   - Database: Connected and migrated"
echo "   - Build: Successful"
echo "   - Health check: Passed"
echo ""
echo "🚀 Ready for production deployment!"