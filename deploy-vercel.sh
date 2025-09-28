#!/bin/bash

# Vercel Deployment Script for MIT Media Lab Chat Study
# This script helps deploy the project to Vercel

echo "🚀 Deploying MIT Media Lab Chat Study to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "⚠️  Not in a git repository. Initializing..."
    git init
    git add .
    git commit -m "Initial commit for Vercel deployment"
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Navigate to Settings > Environment Variables"
echo "3. Add ANTHROPIC_API_KEY with your API key"
echo "4. Redeploy the project"
echo ""
echo "🔗 Your study will be available at the URL shown above"
