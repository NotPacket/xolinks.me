#!/bin/bash
set -e

echo "🚀 Deploying xolinks.me to production..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "   Copy .env.production.example to .env.production and fill in your values"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build and start containers
echo "🔨 Building and starting containers..."
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
docker compose -f docker-compose.production.yml exec app npx prisma migrate deploy

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site should be available at https://xolinks.me"
echo "📊 Traefik dashboard at https://traefik.xolinks.me (if configured)"
