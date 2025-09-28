# Secure Deployment Guide

This guide shows how to deploy your chat study with a hidden API key.

## 🔐 Architecture

- **Frontend**: GitHub Pages (public, no API key visible)
- **Backend**: Vercel API (private, API key hidden)
- **Local Development**: Node.js proxy (API key in .env file)

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Set Environment Variable**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `CLAUDE_API_KEY` with your actual API key
   - Redeploy

4. **Update Frontend Config**:
   - Replace `https://your-vercel-app.vercel.app/api/claude` in `js/config-unified.js` with your actual Vercel URL

### Step 2: Deploy Frontend to GitHub Pages

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add secure Vercel API backend"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select "Deploy from a branch" → "main" → "/ (root)"
   - Click Save

## 🔒 Security Benefits

- ✅ API key is hidden from public repository
- ✅ API key is stored securely in Vercel environment variables
- ✅ Frontend code is clean and public
- ✅ Rate limiting and monitoring available in Vercel
- ✅ Easy to rotate API keys without code changes

## 🧪 Testing

1. **Local Development**: Uses Node.js proxy with .env file
2. **GitHub Pages**: Uses Vercel API (secure)
3. **Fallback**: Uses CORS proxies if Vercel is down

## 📝 Environment Variables

### Vercel (Production)
- `CLAUDE_API_KEY`: Your actual Claude API key

### Local (.env file)
- `CLAUDE_API_KEY`: Your actual Claude API key

## 🔄 API Flow

1. User sends message → Frontend (GitHub Pages)
2. Frontend → Vercel API (with hidden API key)
3. Vercel API → Claude API (with real API key)
4. Response flows back through the chain

This keeps your API key completely hidden from public view!
