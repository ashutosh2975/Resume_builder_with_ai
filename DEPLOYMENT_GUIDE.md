# Deployment Guide: Resume Builder on Vercel

## 📋 What You Need
1. **GitHub Account** (free) - Already have it ✓
2. **Vercel Account** (free) - Create at vercel.com
3. **Your code on GitHub** - Already done ✓

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### **STEP 1: Create Vercel Account**
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

---

### **STEP 2: Deploy Frontend (React App)**

#### 2A. Import Your Repository
1. After signing up, click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Paste your GitHub URL: `https://github.com/ashutosh2975/Resume_builder_with_ai`
4. Click **"Import"**

#### 2B. Configure Project Settings
1. **Framework Preset:** Select **"Vite"** (automatically detects)
2. **Root Directory:** Keep as `/` 
3. **Build Command:** Keep as `npm run build` (or `bun run build`)
4. **Output Directory:** Keep as `dist`

#### 2C: Add Environment Variables
1. Scroll to **"Environment Variables"**
2. You can skip this for now (frontend doesn't need them for basic deployment)

#### 2D: Deploy
1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. ✅ Your frontend will be live at a URL like: `https://resume-builder-xxx.vercel.app`

---

### **STEP 3: Backend API Deployment (Choose ONE Option)**

#### **OPTION A: Deploy Backend Separately (Recommended)**

**Using Render.com (Free):**
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Fill in:
   - **Name:** `resume-builder-api`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
6. Add Environment Variables:
   - `JWT_SECRET_KEY` = (use your value from .env)
   - `GROQ_API_KEY` = (your Groq API key)
   - `GEMINI_API_KEY` = (your Gemini API key)
7. Click "Create Web Service"
8. Your backend will be at: `https://resume-builder-api.onrender.com`

---

#### **OPTION B: Using Railway.app (Also Free)**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "Create New Project"
4. Select "Deploy from GitHub repo"
5. Select your repository
6. Configure:
   - **Root Directory:** `backend`
   - **Start Command:** `gunicorn app:app`
7. Add environment variables
8. Deploy

---

### **STEP 4: Connect Frontend to Backend**

Update your frontend to use the deployed backend URL:

#### In `frontend/src/` files, find all `http://localhost:5000` and replace with:
```
https://your-backend-url.onrender.com
```

**Files to update:**
- `pages/UploadResume.tsx` - Line with `API_BASE = 'http://localhost:5000/api'`
- `pages/Dashboard.tsx` - Find and replace `http://localhost:5000`
- `context/ResumeContext.tsx` - Find and replace `http://localhost:5000`
- `lib/aiEnhance.ts` - Find and replace `http://localhost:5000`

#### Quick Find & Replace:
1. Use Ctrl+Shift+H (Find and Replace)
2. Find: `http://localhost:5000`
3. Replace: `https://your-backend-url.onrender.com`
4. Replace All

Example: If your Render backend URL is `https://resume-builder-api.onrender.com`
```
http://localhost:5000/api  →  https://resume-builder-api.onrender.com/api
```

---

### **STEP 5: Re-deploy Frontend with Updated URLs**
1. Commit your changes:
   ```bash
   git add -A
   git commit -m "Update backend API URL for production"
   git push origin main
   ```

2. Vercel automatically deploys when you push to GitHub
3. Wait 2-3 minutes for new build
4. ✅ Your app is now live!

---

## ✅ Testing Your Deployment

1. Go to your Vercel URL: `https://resume-builder-xxx.vercel.app`
2. Test:
   - ✅ Register new account
   - ✅ Login
   - ✅ Create resume from scratch
   - ✅ Upload existing resume
   - ✅ Download PDF/PNG
   - ✅ AI features work

---

## 🔧 Troubleshooting

### **Frontend deployed but shows blank page**
- Check browser console (F12 → Console tab)
- Check "Network" tab for failed requests
- Check Vercel build logs

### **Backend API not responding**
- Verify backend URL in frontend code
- Check if Render/Railway app is running (check their dashboard)
- Check backend environment variables are set

### **CORS errors**
Backend needs to allow frontend domain:

In `backend/app.py`:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-vercel-url.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

---

## 📱 Your Live URLs Will Be:
- **Frontend:** `https://resume-builder-xxx.vercel.app`
- **Backend API:** `https://resume-builder-api.onrender.com` (or Railway)

---

## 💰 Cost
- **Vercel Frontend:** FREE ✅
- **Render Backend:** FREE ✅
- **Total:** $0/month 🎉

---

## 🔗 Useful Links
- Vercel Docs: https://vercel.com/docs
- Render.com Docs: https://render.com/docs
- Railway.app Docs: https://docs.railway.app
