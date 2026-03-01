# 📦 Resume Builder - Repository Overview

## 🎯 Three Repository Structure

The Resume Builder project is now split into **3 separate repositories** for better organization and deployment:

---

## 1️⃣ **Full Stack Repository** (Main Project)
**URL:** https://github.com/ashutosh2975/Resume_builder_with_ai

### Contains:
- ✅ Full source code (Frontend + Backend)
- ✅ Complete project setup
- ✅ Local development environment
- ✅ Documentation and guides
- ✅ Database files
- ✅ Testing files

### Use for:
- Local development
- Understanding full architecture
- Setting up complete environment locally
- Contributions to entire project

### Local Run:
```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173

# Terminal 2: Backend
cd backend
python app.py
# Runs on http://localhost:5000
```

### Branch: `main`

---

## 2️⃣ **Frontend Repository** (Frontend Only)
**URL:** https://github.com/ashutosh2975/resume-builder-frontend

### Contains:
- ✅ React + TypeScript + Vite
- ✅ All UI components
- ✅ Resume builder interface
- ✅ Styling and animations
- ✅ Tailwind CSS configuration
- ✅ Environment config for API

### Deploy To:
**Vercel** (free tier)

### Use for:
- Frontend development
- UI/UX improvements
- Deploying just the frontend
- Integration with any backend

### Environment:
```env
VITE_API_BASE_URL=https://resume-builder-api.onrender.com/api
```

### Deployment:
```bash
# Build for production
npm run build

# Output: dist/ directory
```

### Branch: `main`

---

## 3️⃣ **Backend Repository** (Backend Only)
**URL:** https://github.com/ashutosh2975/resume-builder-backend

### Contains:
- ✅ Flask REST API
- ✅ Python backend code
- ✅ Authentication (JWT)
- ✅ AI integration (Groq, Gemini)
- ✅ Database models
- ✅ API endpoints

### Deploy To:
**Render** (free tier)

### Use for:
- Backend development
- API improvements
- Deploying just the backend
- Integration with any frontend

### Environment:
```env
FLASK_ENV=production
JWT_SECRET_KEY=your-secret-key
GROQ_API_KEY=your-key
GEMINI_API_KEY=your-key
```

### Deployment:
```bash
# Build command (Render)
pip install -r requirements.txt

# Start command (Render)
gunicorn app:app
```

### Branch: `main`

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     INTERNET (Production)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Vercel)          Backend (Render)              │
│  ├─ React App               ├─ Flask API                  │
│  ├─ UI/UX                   ├─ Database                   │
│  ├─ Routing                 ├─ AI Integration             │
│  └─ State Management        └─ Authentication             │
│                                                             │
│  https://resume-builder-   https://resume-builder-        │
│  frontend-xxx.vercel.app    api.onrender.com             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │                            ▲
         │ HTTP/API Calls            │
         └────────────────────────────┘
```

---

## 📋 Deployment Steps

### Step 1: Deploy Backend First (Render)
1. Go to https://render.com
2. Connect `resume-builder-backend` repository
3. Configure Python 3 environment
4. Add API keys to environment variables
5. Deploy with `gunicorn app:app`
6. **Get backend URL:** `https://resume-builder-api.onrender.com`

### Step 2: Deploy Frontend (Vercel)
1. Go to https://vercel.com
2. Connect `resume-builder-frontend` repository
3. Add environment variable: `VITE_API_BASE_URL=https://resume-builder-api.onrender.com/api`
4. Deploy with `npm run build`
5. **Get frontend URL:** `https://resume-builder-frontend-xxx.vercel.app`

---

## 🔄 Repository Relationships

```
Resume_builder_with_ai (Full Stack)
├── Contains everything (frontend + backend)
├── For: Local development
└── Branch: main

resume-builder-frontend (Frontend Only)
├── Extracted from full stack
├── Deploy To: Vercel
├── Depends On: Backend API URL
└── Branch: main

resume-builder-backend (Backend Only)
├── Extracted from full stack
├── Deploy To: Render
├── Serves: REST API
└── Branch: main
```

---

## 🔗 Quick Links

| Repository | URL | Deploy To | Use For |
|-----------|-----|-----------|---------|
| **Full Stack** | [Resume_builder_with_ai](https://github.com/ashutosh2975/Resume_builder_with_ai) | Local | Development |
| **Frontend** | [resume-builder-frontend](https://github.com/ashutosh2975/resume-builder-frontend) | Vercel | UI/Styling |
| **Backend** | [resume-builder-backend](https://github.com/ashutosh2975/resume-builder-backend) | Render | API/Logic |

---

## 📦 Files in Each Repository

### Full Stack (`Resume_builder_with_ai`)
```
├── frontend/          (All React code)
├── backend/           (All Flask code)
├── DEPLOYMENT_GUIDE.md
├── package.json
├── requirements.txt
└── README.md
```

### Frontend Only (`resume-builder-frontend`)
```
├── src/
│   ├── pages/
│   ├── components/
│   ├── context/
│   ├── lib/
│   └── ...
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── .env.example
├── FRONTEND_README.md
└── ...
```

### Backend Only (`resume-builder-backend`)
```
├── app.py
├── requirements.txt
├── .env.example
├── RENDER_DEPLOYMENT.md
├── README.md
├── start.bat
└── ...
```

---

## 💡 Typical Workflow

### Local Development
```bash
# Clone full stack repo
git clone https://github.com/ashutosh2975/Resume_builder_with_ai.git

# Run frontend
cd frontend && npm run dev

# In another terminal, run backend
cd backend && python app.py
```

### Frontend Changes Only
```bash
# Clone frontend repo
git clone https://github.com/ashutosh2975/resume-builder-frontend.git

# Make changes
# Commit and push
git push origin main

# Vercel auto-deploys!
```

### Backend Changes Only
```bash
# Clone backend repo
git clone https://github.com/ashutosh2975/resume-builder-backend.git

# Make changes
# Commit and push
git push origin main

# Render auto-deploys!
```

---

## 🚀 Live Application

**Production URLs:**
- 🌐 Frontend: https://resume-builder-frontend-xxx.vercel.app
- 🔌 Backend API: https://resume-builder-api.onrender.com
- 📚 API Docs: https://resume-builder-api.onrender.com/api

---

## 🔐 Environment Variables

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://resume-builder-api.onrender.com/api
```

### Backend (Render)
```env
FLASK_ENV=production
JWT_SECRET_KEY=<generated-secret>
GROQ_API_KEY=<your-api-key>
GEMINI_API_KEY=<your-api-key>
```

---

## 📊 Repository Statistics

| Metric | Full Stack | Frontend | Backend |
|--------|-----------|----------|---------|
| Files | ~150 | ~105 | ~7 |
| Languages | JS + Python | JavaScript | Python |
| Deploy To | Local | Vercel | Render |
| Size | ~350 MB | ~20 MB | ~14 KB |

---

## ✅ Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] API connections working
- [ ] User authentication functional
- [ ] Database initialized
- [ ] AI features operational
- [ ] Export functionality working
- [ ] Mobile responsiveness verified
- [ ] Performance optimized

---

## 🆘 Need Help?

1. **Local Development Issues:** Check `Resume_builder_with_ai` README
2. **Frontend Deployment:** See `resume-builder-frontend/FRONTEND_README.md`
3. **Backend Deployment:** See `resume-builder-backend/RENDER_DEPLOYMENT.md`
4. **General Deployment:** See main `DEPLOYMENT_GUIDE.md`

---

## 🎓 Learning Path

1. **Understand Architecture:** Review this file
2. **Local Setup:** Clone full stack repo
3. **Run Locally:** Follow full stack README
4. **Customize Frontend:** Use frontend repo
5. **Customize Backend:** Use backend repo
6. **Deploy to Production:** Follow DEPLOYMENT_GUIDE.md

---

**Your Resume Builder is production-ready!** 🚀

Choose your approach:
- 🏠 **Local Development:** Use full stack repo
- 🎨 **Frontend Work:** Use frontend repo
- ⚙️ **Backend Work:** Use backend repo
- 🌐 **Production:** Deploy both to Vercel + Render
