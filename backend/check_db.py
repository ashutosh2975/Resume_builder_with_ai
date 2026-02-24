import sqlite3, os

db_path = "resume_builder.db"

if not os.path.exists(db_path):
    print("Database not found at:", os.path.abspath(db_path))
else:
    print("Database path:", os.path.abspath(db_path))
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Show all tables
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in cur.fetchall()]
    print("Tables:", tables)
    print()

    # Show all users (password hash is hidden)
    cur.execute("SELECT id, full_name, email, created_at FROM users ORDER BY id")
    rows = cur.fetchall()

    if rows:
        print(f"{'ID':<5} {'Full Name':<25} {'Email':<35} {'Created At'}")
        print("-" * 80)
        for r in rows:
            print(f"{r['id']:<5} {r['full_name']:<25} {r['email']:<35} {r['created_at']}")
    else:
        print("No users registered yet.")

    print()
    print(f"Total users: {len(rows)}")
    conn.close()
