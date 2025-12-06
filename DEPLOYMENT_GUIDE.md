# Deployment Guide

This guide covers deployment options for the Solar Band Gap Prediction System.

## ⚠️ Important Considerations

This application has:
- **Large ML models** (.pkl files, potentially 100MB+)
- **Heavy Python dependencies** (matminer, pymatgen, xgboost, scikit-learn)
- **Long startup time** (loading models into memory)
- **Memory-intensive** operations

## Deployment Options

### Option 1: Vercel (Frontend Only) + Separate Backend

**Best for:** Quick frontend deployment

**Limitations:**
- Vercel serverless functions have:
  - 50MB function size limit
  - 10-second timeout (can be extended to 60s with Pro)
  - Cold start delays
  - Not suitable for large ML models

**Solution:** Deploy frontend on Vercel, backend elsewhere (Railway, Render, Fly.io)

#### Steps:

1. **Deploy Frontend to Vercel:**
   ```bash
   cd Fend
   npm install -g vercel
   vercel
   ```

2. **Update Frontend API URL:**
   - Set environment variable: `VITE_API_URL=https://your-backend-url.com`
   - Or update `Fend/src/pages/Dataset.jsx` and `Predictions.jsx` to use your backend URL

3. **Deploy Backend separately** (see Option 2 or 3)

---

### Option 2: Railway (Recommended for Full Stack)

**Best for:** Full-stack deployment with Docker

**Advantages:**
- Supports Docker
- No function size limits
- Persistent storage
- Easy deployment

#### Steps:

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   railway init
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Set environment variables** (if needed):
   ```bash
   railway variables set CORS_ORIGINS=https://your-frontend.vercel.app
   ```

6. **Get your URL:**
   ```bash
   railway domain
   ```

---

### Option 3: Render

**Best for:** Docker-based deployment

**Steps:**

1. Go to https://render.com
2. Create new **Web Service**
3. Connect your GitHub repository
4. Settings:
   - **Build Command:** `docker build -t solar-bandgap .`
   - **Start Command:** `docker run -p 8000:8000 solar-bandgap`
   - Or use docker-compose
5. Add environment variables if needed
6. Deploy!

---

### Option 4: Fly.io

**Best for:** Global deployment with edge computing

**Steps:**

1. **Install Fly CLI:**
   ```bash
   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Create app:**
   ```bash
   fly launch
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

---

### Option 5: AWS/GCP/Azure

**Best for:** Production, enterprise scale

- **AWS:** Use ECS, EKS, or Elastic Beanstalk
- **GCP:** Use Cloud Run or GKE
- **Azure:** Use Container Instances or AKS

---

## Vercel-Specific Setup (Frontend Only)

If you want to deploy just the frontend on Vercel:

### 1. Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "Fend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 2. Update `Fend/package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "vite build"
  }
}
```

### 3. Set Environment Variable:

In Vercel dashboard, set:
- `VITE_API_URL` = Your backend URL (e.g., `https://your-backend.railway.app`)

### 4. Deploy:

```bash
cd Fend
vercel
```

---

## Recommended Architecture

### For Best Performance:

```
Frontend (Vercel) → Backend (Railway/Render) → Database (if needed)
```

**Why:**
- Vercel: Fast CDN for frontend
- Railway/Render: Better for Python/ML workloads
- Separate concerns

### For Simplicity:

```
Everything on Railway/Render (Docker)
```

**Why:**
- Single deployment
- Easier to manage
- No CORS issues

---

## Environment Variables

Set these in your deployment platform:

### Backend:
- `CORS_ORIGINS` - Comma-separated list of allowed origins
- `PYTHONUNBUFFERED=1` - For proper logging

### Frontend:
- `VITE_API_URL` - Backend API URL (if separate deployment)

---

## Quick Deploy Commands

### Railway:
```bash
railway login
railway init
railway up
```

### Render:
1. Connect GitHub repo
2. Select "Web Service"
3. Use Docker
4. Deploy!

### Fly.io:
```bash
fly launch
fly deploy
```

---

## Troubleshooting

### Model files too large:
- Use volume mounts (Railway, Render support this)
- Or use cloud storage (S3, etc.) and download on startup

### Cold starts slow:
- Use "always on" option (Railway Pro, Render)
- Or implement health checks to keep warm

### Memory issues:
- Increase memory allocation in platform settings
- ML models can be memory-intensive

---

## Cost Estimates

- **Vercel (Frontend):** Free tier available
- **Railway:** $5/month starter, $20/month for better resources
- **Render:** Free tier (with limitations), $7/month for better
- **Fly.io:** Pay-as-you-go, ~$5-10/month for small apps

---

## Recommendation

For this ML application, I recommend **Railway** or **Render** because:
1. ✅ Docker support (already configured)
2. ✅ No function size limits
3. ✅ Persistent storage for models
4. ✅ Better for long-running processes
5. ✅ Easy deployment

Deploy frontend separately on Vercel only if you need the CDN benefits and don't mind managing two deployments.

