# How to Push Your Project to GitHub

## Prerequisites

1. **Install Git** (if not already installed):
   - Download from: https://git-scm.com/download/win
   - Or use GitHub Desktop: https://desktop.github.com/

2. **Create a GitHub Account** (if you don't have one):
   - Go to: https://github.com
   - Sign up for a free account

## Method 1: Using Git Command Line

### Step 1: Initialize Git Repository (if not already done)

Open PowerShell or Command Prompt in your project directory:

```powershell
cd E:\Academics\Projects\SolarBandGapPrediction
git init
```

### Step 2: Create a GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon in the top right → **"New repository"**
3. Name it: `SolarBandGapPrediction` (or any name you prefer)
4. **DO NOT** initialize with README, .gitignore, or license (since you already have files)
5. Click **"Create repository"**

### Step 3: Add All Files

```powershell
git add .
```

### Step 4: Make Your First Commit

```powershell
git commit -m "Initial commit: Solar Band Gap Prediction System with FastAPI and React"
```

### Step 5: Connect to GitHub Remote

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/SolarBandGapPrediction.git
```

### Step 6: Push to GitHub

```powershell
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub username and password (or personal access token).

---

## Method 2: Using GitHub Desktop (Easier for Beginners)

1. **Download GitHub Desktop**: https://desktop.github.com/
2. **Install and sign in** with your GitHub account
3. **File → Add Local Repository**
4. Browse to: `E:\Academics\Projects\SolarBandGapPrediction`
5. Click **"Add repository"**
6. **Publish repository** button (top right)
7. Choose name and visibility (public/private)
8. Click **"Publish Repository"**

---

## Important Notes

### Before Pushing - Check What You're Uploading

The `.gitignore` file I created will exclude:
- `node_modules/` (frontend dependencies - too large)
- `S_Env/` (Python virtual environment - too large)
- `__pycache__/` (Python cache files)
- `*.pkl` files (model files - large, but you might want to include them)

### If You Want to Include Model Files

If you want to include your trained models (`SolarB_Gap_Pred.pkl`, `Features.pkl`), you can:

1. Remove them from `.gitignore`:
   ```powershell
   # Edit .gitignore and remove or comment out:
   # *.pkl
   ```

2. Or use Git LFS (Large File Storage) for large files:
   ```powershell
   git lfs install
   git lfs track "*.pkl"
   git add .gitattributes
   ```

### Authentication

If you get authentication errors, you may need to use a **Personal Access Token** instead of password:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use this token as your password when pushing

---

## Future Updates

After the initial push, to update your repository:

```powershell
git add .
git commit -m "Description of your changes"
git push
```

---

## Quick Reference Commands

```powershell
# Check status
git status

# See what files will be committed
git status

# Add specific file
git add filename

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log
```

---

## Troubleshooting

### "Repository not found"
- Check your GitHub username and repository name
- Make sure the repository exists on GitHub

### "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH keys

### "Large files" error
- Use Git LFS for `.pkl` files
- Or exclude them in `.gitignore`

### "Branch 'main' has no upstream branch"
- Run: `git push -u origin main`

