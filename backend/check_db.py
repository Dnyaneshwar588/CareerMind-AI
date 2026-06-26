import sqlite3

conn = sqlite3.connect('placement_strategist.db')
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cur.fetchall()
print("Tables:", tables)

for (table,) in tables:
    if 'user' in table.lower():
        cur.execute(f"SELECT id, email, is_admin FROM {table}")
        rows = cur.fetchall()
        print(f"\n{table} rows:", rows)

conn.close()
