# ResumeForge

A full-stack **AI-powered Resume Builder** — built with React + TypeScript (frontend) and Flask + PostgreSQL/SQLite (backend).

---

## Project Structure

```
Resume_builder/
├── frontend/          # React + TypeScript + Vite + TailwindCSS
│   └── src/
│       ├── pages/     # Login, Register, Dashboard, ResumeBuilder, …
│       ├── context/   # AuthContext, ResumeContext
│       └── components/
└── backend/           # Flask REST API
    ├── app.py         # Main server (auth routes + DB logic)
    ├── requirements.txt
    ├── .env           # Your local config (not committed)
    └── start.bat      # Windows one-click start
```

---

## Quick Start

### 1 — Backend (Flask)

You **must** have the Flask API running for the frontend to work. Keep this terminal open while you're developing.

```bash
cd backend

# Windows shortcut (recommended – it also installs deps):
start.bat

# Or manually:
pip install -r requirements.txt     # install if not done already
python app.py                       # launches server on http://localhost:5000
```

If you see `Unable to contact backend API` in the browser, or the login page
shows a warning about the server, it means this step wasn't completed or the
process has exited. Run the command again and watch the console for errors.

> **No PostgreSQL?** No problem — the backend automatically uses a local **SQLite** file (`resume_builder.db`) when `DATABASE_URL` is not set. Perfect for local development.

API runs on **http://localhost:5000**

### 2 — Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App runs on **http://localhost:5173**

---

## Authentication Flow

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Sign in to your account |
| `/register` | Public | Create a new account |
| `/dashboard` | 🔒 Protected | Manage your resumes |
| `/builder` | 🔒 Protected | Resume editor |
| `/select-template` | 🔒 Protected | Choose a template |
| `/upload` | 🔒 Protected | Upload and extract existing resume |

Protected routes automatically redirect to `/login` if you're not signed in, then return you to the original page after authentication.

---

## Backend API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Server health check |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in, get JWT |
| GET | `/api/auth/me` | Bearer JWT | Get current user |

---

## Resume Extraction Features

The app provides **intelligent resume extraction** from uploaded files using Gemini AI with automatic fallback:

```
Upload Resume (PDF/DOCX/TXT)
    ↓
[Attempt 1: Gemini AI Extraction] → ~90% accuracy
    ↓ (if fails)
[Attempt 2: Manual Extraction] → Regex-based fallback
    ↓
Review extracted data
    ↓
Choose template
    ↓
Edit in builder
```

**Extraction Method Indicator**: Frontend shows whether extraction was done via **AI (🤖)** or **Manual (⚡)** so you know the confidence level.

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/resume_builder  # Optional, uses SQLite if not set

# Authentication
JWT_SECRET_KEY=your-secret-here

# Resume Extraction & AI Enhancements
GEMINI_API_KEY=your-gemini-api-key  # For resume extraction (required for AI extraction)
OPENAI_API_KEY=your-openai-key      # Optional fallback
DEEPSEEK_API_KEY=your-deepseek-key  # Optional fallback
GROQ_API_KEY=your-groq-key          # Optional fallback

# Environment
FLASK_ENV=development
FLASK_DEBUG=1
```

### Frontend

No `.env` needed for local development. The API base URL defaults to `http://localhost:5000`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| Backend | Flask 3, Python 3.10+ |
| Database | PostgreSQL (prod) / SQLite (dev) |
| Auth | JWT (PyJWT) + bcrypt password hashing |
| State | React Context API + localStorage persistence |

---

## Development

```bash
# Run both servers at once (two terminals):

# Terminal 1 — Backend
cd backend && python app.py

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Then open http://localhost:5173 in your browser.
