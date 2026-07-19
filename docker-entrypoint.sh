#!/bin/sh
set -e

echo "Checking database..."

if [ -z "${DATABASE_URL}" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

node -e "
  import('@libsql/client').then(({ createClient }) => {
    const client = createClient({ url: process.env.DATABASE_URL });
    const sql = \`
      CREATE TABLE IF NOT EXISTS skillz_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        version TEXT NOT NULL DEFAULT '0.1.0',
        owner TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
      CREATE UNIQUE INDEX IF NOT EXISTS skillz_skills_owner_name_idx ON skillz_skills (owner, name);
      CREATE INDEX IF NOT EXISTS skillz_skills_owner_name ON skillz_skills (owner, name);
    \`;
    return client.execute(sql);
  }).then(() => {
    console.log('Database initialized.');
  }).catch(err => {
    console.error('Database init failed:', err);
    process.exit(1);
  });
"

echo "Starting server..."
exec node server.js
