import os
import re
import json
import bcrypt
import jwt
import datetime
import urllib.request
import urllib.error
from flask import Flask, request, jsonify, make_response
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)

# ─── CORS: allow any localhost / 127.0.0.1 origin on any port ────────────────
_LOCALHOST_RE = re.compile(r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$")

@app.after_request
def _add_cors(response):
    origin = request.headers.get("Origin", "")
    if _LOCALHOST_RE.match(origin):
        response.headers["Access-Control-Allow-Origin"]  = origin
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

@app.route("/api/<path:path>", methods=["OPTIONS"])
@app.route("/api/", methods=["OPTIONS"])
def _handle_options(path=""):
    return make_response("", 204)

SECRET_KEY   = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
DATABASE_URL = os.getenv("DATABASE_URL", "")

# ─── Database abstraction ─────────────────────────────────────────────────────

USE_POSTGRES = DATABASE_URL.startswith("postgresql")

if USE_POSTGRES:
    import psycopg2
    import psycopg2.extras

    def get_db():
        return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)

    def init_db():
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id          SERIAL PRIMARY KEY,
                full_name   VARCHAR(120) NOT NULL,
                email       VARCHAR(255) UNIQUE NOT NULL,
                password    VARCHAR(255) NOT NULL,
                created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS resumes (
                id          SERIAL PRIMARY KEY,
                user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name        VARCHAR(255) NOT NULL DEFAULT 'Untitled Resume',
                template_id VARCHAR(100) NOT NULL DEFAULT 'modern-01',
                data        TEXT NOT NULL DEFAULT '{}',
                updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        conn.commit(); cur.close(); conn.close()
        print("✅  PostgreSQL database initialized.")

else:
    import sqlite3
    DB_PATH = os.path.join(os.path.dirname(__file__), "resume_builder.db")

    def _dict_factory(cursor, row):
        return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

    def get_db():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = _dict_factory
        conn.execute("PRAGMA journal_mode=WAL")
        return conn

    def init_db():
        conn = get_db()
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name   TEXT    NOT NULL,
                email       TEXT    UNIQUE NOT NULL,
                password    TEXT    NOT NULL,
                created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS resumes (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name        TEXT    NOT NULL DEFAULT 'Untitled Resume',
                template_id TEXT    NOT NULL DEFAULT 'modern-01',
                data        TEXT    NOT NULL DEFAULT '{}',
                updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit(); conn.close()
        print(f"✅  SQLite database initialized at: {DB_PATH}")


# ─── Helpers ──────────────────────────────────────────────────────────────────

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def make_token(user_id: int, email: str) -> str:
    payload = {
        "sub":   user_id,
        "email": email,
        "iat":   datetime.datetime.utcnow(),
        "exp":   datetime.datetime.utcnow() + datetime.timedelta(days=7),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization header"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired. Please sign in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token. Please sign in again."}), 401
        return f(payload, *args, **kwargs)
    return decorated


def is_unique_violation(e):
    msg = str(e).lower()
    if USE_POSTGRES:
        return hasattr(e, "pgcode") and e.pgcode == "23505"
    return "unique" in msg


def db_exec(conn, sql, params=()):
    """Unified execute for both PG (uses %s) and SQLite (uses ?)."""
    if USE_POSTGRES:
        cur = conn.cursor()
        cur.execute(sql, params)
        return cur
    else:
        return conn.execute(sql, params)


def q(sql):
    """Convert ? placeholders to %s for PostgreSQL."""
    if USE_POSTGRES:
        return sql.replace("?", "%s")
    return sql


# ─── Health ───────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "ResumeForge API 🚀", "database": "PostgreSQL" if USE_POSTGRES else "SQLite"})


# ─── Auth ─────────────────────────────────────────────────────────────────────

@app.route("/api/auth/register", methods=["POST"])
def register():
    data      = request.get_json(silent=True) or {}
    full_name = (data.get("full_name") or "").strip()
    email     = (data.get("email")     or "").strip().lower()
    password  = (data.get("password")  or "").strip()

    errors = {}
    if not full_name or len(full_name) < 2:
        errors["full_name"] = "Full name must be at least 2 characters."
    if not EMAIL_RE.match(email):
        errors["email"] = "Please enter a valid email address."
    if len(password) < 8:
        errors["password"] = "Password must be at least 8 characters."
    if errors:
        return jsonify({"errors": errors}), 422

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    try:
        conn = get_db()
        if USE_POSTGRES:
            cur = conn.cursor()
            cur.execute("INSERT INTO users (full_name, email, password) VALUES (%s,%s,%s) RETURNING id,full_name,email",
                        (full_name, email, hashed))
            user = cur.fetchone(); conn.commit(); cur.close()
        else:
            cur = conn.execute("INSERT INTO users (full_name, email, password) VALUES (?,?,?)", (full_name, email, hashed))
            conn.commit()
            user = conn.execute("SELECT id,full_name,email FROM users WHERE id=?", (cur.lastrowid,)).fetchone()
        conn.close()
    except Exception as e:
        if is_unique_violation(e):
            return jsonify({"errors": {"email": "An account with this email already exists."}}), 409
        return jsonify({"error": f"Database error: {e}"}), 500

    return jsonify({"message": "Account created!", "token": make_token(user["id"], user["email"]),
                    "user": {"id": user["id"], "full_name": user["full_name"], "email": user["email"]}}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    email    = (data.get("email")    or "").strip().lower()
    password = (data.get("password") or "").strip()
    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400
    try:
        conn = get_db()
        if USE_POSTGRES:
            cur = conn.cursor()
            cur.execute("SELECT id,full_name,email,password FROM users WHERE email=%s", (email,))
            user = cur.fetchone(); cur.close()
        else:
            user = conn.execute("SELECT id,full_name,email,password FROM users WHERE email=?", (email,)).fetchone()
        conn.close()
    except Exception as e:
        return jsonify({"error": f"Database error: {e}"}), 500

    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify({"message": "Signed in!", "token": make_token(user["id"], user["email"]),
                    "user": {"id": user["id"], "full_name": user["full_name"], "email": user["email"]}})


@app.route("/api/auth/me", methods=["GET"])
@token_required
def me(payload):
    try:
        conn = get_db()
        if USE_POSTGRES:
            cur = conn.cursor()
            cur.execute("SELECT id,full_name,email,created_at FROM users WHERE id=%s", (payload["sub"],))
            user = cur.fetchone(); cur.close()
        else:
            user = conn.execute("SELECT id,full_name,email,created_at FROM users WHERE id=?", (payload["sub"],)).fetchone()
        conn.close()
    except Exception as e:
        return jsonify({"error": f"Database error: {e}"}), 500
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": {"id": user["id"], "full_name": user["full_name"],
                             "email": user["email"], "created_at": str(user["created_at"])}})


# ─── Resumes CRUD ─────────────────────────────────────────────────────────────

@app.route("/api/resumes", methods=["GET"])
@token_required
def list_resumes(payload):
    user_id = payload["sub"]
    try:
        conn = get_db()
        if USE_POSTGRES:
            cur = conn.cursor()
            cur.execute("SELECT id,name,template_id,updated_at FROM resumes WHERE user_id=%s ORDER BY updated_at DESC", (user_id,))
            rows = cur.fetchall(); cur.close()
        else:
            rows = conn.execute("SELECT id,name,template_id,updated_at FROM resumes WHERE user_id=? ORDER BY updated_at DESC", (user_id,)).fetchall()
        conn.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    resumes = [{"id": str(r["id"]), "name": r["name"], "templateId": r["template_id"], "updatedAt": str(r["updated_at"])} for r in rows]
    return jsonify({"resumes": resumes})


@app.route("/api/resumes", methods=["POST"])
@token_required
def create_resume(payload):
    user_id = payload["sub"]
    body    = request.get_json(silent=True) or {}
    name    = (body.get("name") or "Untitled Resume").strip()
    tpl_id  = (body.get("template_id") or "modern-01").strip()
    data    = json.dumps(body.get("data") or {})
    try:
        conn = get_db()
        if USE_POSTGRES:
            cur = conn.cursor()
            cur.execute("INSERT INTO resumes (user_id,name,template_id,data) VALUES (%s,%s,%s,%s) RETURNING id,name,template_id,updated_at",
                        (user_id, name, tpl_id, data))
            row = cur.fetchone(); conn.commit(); cur.close()
        else:
            cur = conn.execute("INSERT INTO resumes (user_id,name,template_id,data) VALUES (?,?,?,?)", (user_id, name, tpl_id, data))
            conn.commit()
            row = conn.execute("SELECT id,name,template_id,updated_at FROM resumes WHERE id=?", (cur.lastrowid,)).fetchone()
        conn.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Resume saved!", "resume": {"id": str(row["id"]), "name": row["name"], "templateId": row["template_id"], "updatedAt": str(row["updated_at"])}}), 201


@app.route("/api/resumes/<int:resume_id>", methods=["GET"])
@token_required
def get_resume(payload, resume_id):
    user_id = payload["sub"]
    try:
        conn = get_db()
        if USE_POSTGRES:
            cur = conn.cursor()
            cur.execute("SELECT * FROM resumes WHERE id=%s AND user_id=%s", (resume_id, user_id))
            row = cur.fetchone(); cur.close()
        else:
            row = conn.execute("SELECT * FROM resumes WHERE id=? AND user_id=?", (resume_id, user_id)).fetchone()
        conn.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    if not row:
        return jsonify({"error": "Resume not found."}), 404
    return jsonify({"resume": {"id": str(row["id"]), "name": row["name"], "templateId": row["template_id"],
                               "data": json.loads(row["data"]), "updatedAt": str(row["updated_at"])}})


@app.route("/api/resumes/<int:resume_id>", methods=["PUT"])
@token_required
def update_resume(payload, resume_id):
    user_id = payload["sub"]
    body    = request.get_json(silent=True) or {}
    name    = (body.get("name") or "Untitled Resume").strip()
    tpl_id  = (body.get("template_id") or "modern-01").strip()
    data    = json.dumps(body.get("data") or {})
    now     = datetime.datetime.utcnow().isoformat()
    try:
        conn = get_db()
        if USE_POSTGRES:
            cur = conn.cursor()
            cur.execute("UPDATE resumes SET name=%s,template_id=%s,data=%s,updated_at=NOW() WHERE id=%s AND user_id=%s RETURNING id,name,template_id,updated_at",
                        (name, tpl_id, data, resume_id, user_id))
            row = cur.fetchone(); conn.commit(); cur.close()
        else:
            conn.execute("UPDATE resumes SET name=?,template_id=?,data=?,updated_at=? WHERE id=? AND user_id=?",
                         (name, tpl_id, data, now, resume_id, user_id))
            conn.commit()
            row = conn.execute("SELECT id,name,template_id,updated_at FROM resumes WHERE id=?", (resume_id,)).fetchone()
        conn.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    if not row:
        return jsonify({"error": "Resume not found."}), 404
    return jsonify({"message": "Resume updated!", "resume": {"id": str(row["id"]), "name": row["name"], "templateId": row["template_id"], "updatedAt": str(row["updated_at"])}})


@app.route("/api/resumes/<int:resume_id>", methods=["DELETE"])
@token_required
def delete_resume(payload, resume_id):
    user_id = payload["sub"]
    try:
        conn = get_db()
        if USE_POSTGRES:
            cur = conn.cursor()
            cur.execute("DELETE FROM resumes WHERE id=%s AND user_id=%s", (resume_id, user_id))
            conn.commit(); cur.close()
        else:
            conn.execute("DELETE FROM resumes WHERE id=? AND user_id=?", (resume_id, user_id))
            conn.commit()
        conn.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Resume deleted."})


# ─── AI Enhance Proxy ─────────────────────────────────────────────────────────

GEMINI_API_KEY  = os.getenv("GEMINI_API_KEY", "")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
OPENAI_API_KEY  = os.getenv("OPENAI_API_KEY", "")

MODE_PROMPTS = {
    "improve":    "You are a professional resume writer. Improve the grammar, clarity, and professional tone of this resume text. Keep the same facts, just make it sound more polished and impactful. Return ONLY the improved text, no explanations.",
    "shorten":    "You are a professional resume writer. Shorten this resume text to be more concise and impactful. Remove unnecessary words while keeping the key achievements and metrics. Return ONLY the shortened text as bullet points starting with action verbs.",
    "expand":     "You are a professional resume writer. Expand this resume text with more detail, impact metrics, and professional language. Add relevant context and accomplishments. Return ONLY the expanded text as bullet points.",
    "ats":        "You are an ATS optimization expert. Rewrite this resume text to be highly ATS-friendly: use standard action verbs, quantifiable achievements, and industry-standard keywords. Return ONLY the optimized text as bullet points.",
    "regenerate": "You are a professional resume writer. Completely rewrite this resume content from a fresh angle, keeping the same job/role but using different language and structure. Return ONLY the rewritten text as bullet points starting with strong action verbs.",
}


def _post_json(url: str, headers: dict, body: dict, timeout: int = 12) -> dict:
    """Make a JSON POST request using stdlib urllib (no dependencies)."""
    data = json.dumps(body).encode("utf-8")
    req  = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _try_gemini(text: str, mode: str) -> str | None:
    if not GEMINI_API_KEY:
        return None
    try:
        prompt = f"{MODE_PROMPTS.get(mode, MODE_PROMPTS['improve'])}\n\nResume text:\n{text}"
        url    = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        body   = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024}}
        resp   = _post_json(url, {"Content-Type": "application/json"}, body)
        return resp["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as exc:
        if "429" in str(exc):
            print(f"[AI] Gemini rate limit exceeded (429). Try again in a minute or add a paid key.")
        else:
            print(f"[AI] Gemini failed: {exc}")
        return None


def _try_deepseek(text: str, mode: str) -> str | None:
    if not DEEPSEEK_API_KEY:
        return None
    try:
        prompt = f"{MODE_PROMPTS.get(mode, MODE_PROMPTS['improve'])}\n\nResume text:\n{text}"
        body   = {
            "model":    "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7, "max_tokens": 1024,
        }
        resp = _post_json(
            "https://api.deepseek.com/v1/chat/completions",
            {"Content-Type": "application/json", "Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
            body,
        )
        return resp["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        print(f"[AI] DeepSeek failed: {exc}")
        return None


def _try_openai(text: str, mode: str) -> str | None:
    if not OPENAI_API_KEY:
        return None
    try:
        prompt = f"{MODE_PROMPTS.get(mode, MODE_PROMPTS['improve'])}\n\nResume text:\n{text}"
        body   = {
            "model":    "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7, "max_tokens": 1024,
        }
        resp = _post_json(
            "https://api.openai.com/v1/chat/completions",
            {"Content-Type": "application/json", "Authorization": f"Bearer {OPENAI_API_KEY}"},
            body,
        )
        return resp["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        print(f"[AI] OpenAI failed: {exc}")
        return None


@app.route("/api/ai/enhance", methods=["POST"])
def ai_enhance():
    """Public AI proxy — no auth required so guests can also use AI."""
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    mode = (data.get("mode") or "improve").strip()

    if not text:
        return jsonify({"error": "text is required"}), 400
    if mode not in MODE_PROMPTS:
        mode = "improve"
    if len(text) > 8000:
        return jsonify({"error": "text too long (max 8000 chars)"}), 400

    # Try AI providers in order of preference (free → paid fallback)
    result = _try_gemini(text, mode) or _try_deepseek(text, mode) or _try_openai(text, mode)

    if result:
        return jsonify({"result": result, "provider": "ai"})
    return jsonify({"result": None, "provider": "none"}), 503


# ─── University / College Autocomplete ────────────────────────────────────────

@app.route("/api/universities", methods=["GET"])
def universities():
    """Proxy for https://universities.hipolabs.com — no auth needed."""
    query = request.args.get("q", "").strip()
    if len(query) < 2:
        return jsonify({"universities": []})
    try:
        encoded = urllib.request.quote(query, safe="")
        url     = f"http://universities.hipolabs.com/search?name={encoded}&limit=8"
        with urllib.request.urlopen(url, timeout=5) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
        results = [{"name": u["name"], "country": u.get("country", "")} for u in raw[:8]]
        return jsonify({"universities": results})
    except Exception as exc:
        print(f"[Unis] fetch failed: {exc}")
        return jsonify({"universities": []})


# ─── Entry ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    db_label = "PostgreSQL" if USE_POSTGRES else "SQLite (local dev fallback)"
    print(f"\n🗄️  Database mode : {db_label}")
    init_db()
    print(f"🚀  Starting Flask on http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
