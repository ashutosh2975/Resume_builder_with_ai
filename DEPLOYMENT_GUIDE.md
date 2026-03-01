# Deployment Guide: Resume Builder on Vercel + Render

## 📋 What You Need
1. **GitHub Accounts** (free) - ✅ Already have it
2. **Vercel Account** (free) - Create at vercel.com
3. **Render Account** (free) - Create at render.com
4. **Code on GitHub** - ✅ Already done:
   - Frontend: https://github.com/ashutosh2975/resume-builder-frontend
   - Backend: https://github.com/ashutosh2975/resume-builder-backend

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### **STEP 1: Create Accounts**

#### 1A. Vercel Account (for Frontend)
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

#### 1B. Render Account (for Backend)
1. Go to https://render.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Render

---

### **STEP 2: Deploy Backend on Render (FIRST - Do this first!)**

#### 2A. Create Web Service
1. Go to [render.com](https://render.com) dashboard
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect repository"**
4. Select: `resume-builder-backend`
5. Click **"Connect"**

#### 2B. Configure Settings
Fill in:
- **Name:** `resume-builder-api`
- **Environment:** `Python 3`
- **Region:** Choose closest region
- **Branch:** `main`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app`

#### 2C. Add Environment Variables
Click **"Advanced"** → Add variables:

| Key | Value |
|-----|-------|
| `FLASK_ENV` | `production` |
| `JWT_SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `GROQ_API_KEY` | Your Groq API key |
| `GEMINI_API_KEY` | Your Gemini API key |

#### 2D. Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. ✅ Your backend URL: `https://resume-builder-api.onrender.com`

**Copy this URL - you'll need it for frontend!**

---

### **STEP 3: Deploy Frontend on Vercel**

#### 3A. Import Repository
1. Go to [vercel.com](https://vercel.com) dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Paste: `https://github.com/ashutosh2975/resume-builder-frontend`
5. Click **"Import"**

#### 3B. Configure Project Settings
- **Framework Preset:** Vite (auto-detected) ✓
- **Root Directory:** `/` ✓
- **Build Command:** `npm run build` ✓
- **Output Directory:** `dist` ✓

#### 3C. Add Environment Variables
Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://resume-builder-api.onrender.com/api` |

(Replace with your actual Render backend URL)

#### 3D. Deploy
1. Click **"Deploy"** button
2. Wait 2-3 minutes for build
3. ✅ Your frontend URL: `https://resume-builder-frontend-xxx.vercel.app`

---

## ✅ Verify Deployment

### Test Frontend
1. Go to your Vercel URL: `https://resume-builder-frontend-xxx.vercel.app`
2. Try:
   - Register new account ✓
   - Login ✓
   - Create resume from scratch ✓
   - Upload existing resume ✓
   - Download PDF/PNG ✓
   - AI features ✓

### Test API
```bash
# Test backend is running
curl https://resume-builder-api.onrender.com/api/universities?q=Stanford
```

---

## 🔧 Troubleshooting

### Frontend shows blank page
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify `VITE_API_BASE_URL` in Vercel dashboard

### Backend API not responding
1. Check Render dashboard → Logs
2. Verify environment variables are set
3. Check API keys are valid
4. Ensure database initialized

### CORS errors
1. Backend needs to allow frontend domain
2. Update `app.py` CORS configuration:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-vercel-url.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```
3. Push to backend repo and redeploy on Render

### Database issues
- **SQLite:** Auto-creates `resume_builder.db` locally
- **PostgreSQL:** Set `DATABASE_URL` in Render environment

---

## 📱 Your Live URLs

| Component | URL |
|-----------|-----|
| **Frontend** | https://resume-builder-frontend-xxx.vercel.app |
| **Backend API** | https://resume-builder-api.onrender.com |
| **API Endpoint** | https://resume-builder-api.onrender.com/api |

---

## 💰 Cost

| Service | Cost |
|---------|------|
| Vercel Frontend | **FREE** ✅ |
| Render Backend | **FREE** ✅ |
| **Total/Month** | **$0** 🎉 |

---

## 📚 Reference Repositories

- **Frontend Only:** https://github.com/ashutosh2975/resume-builder-frontend
  - Deployment: Vercel
  - Docs: See FRONTEND_README.md

- **Backend Only:** https://github.com/ashutosh2975/resume-builder-backend
  - Deployment: Render
  - Docs: See RENDER_DEPLOYMENT.md

- **Full Stack:** https://github.com/ashutosh2975/Resume_builder_with_ai
  - Both frontend and backend together

---

## 🔗 Useful Links

| Service | Documentation |
|---------|----------------|
| Vercel | https://vercel.com/docs |
| Render | https://render.com/docs |
| Groq API | https://console.groq.com |
| Google Gemini | https://ai.google.dev |

---

## 📋 Deployment Checklist

- [ ] Backend deployed on Render
- [ ] Backend API responding
- [ ] Frontend deployed on Vercel
- [ ] Frontend environment variables set
- [ ] Frontend can call backend API
- [ ] User registration works
- [ ] Resume creation works
- [ ] AI features functional
- [ ] Export to PDF/PNG works
- [ ] Database configured

---

**Your Resume Builder is now LIVE on the Internet!** 🚀

Visit: `https://resume-builder-frontend-xxx.vercel.app`
