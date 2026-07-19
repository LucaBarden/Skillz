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
      CREATE TABLE IF NOT EXISTS skillz_skill (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        version TEXT NOT NULL,
        owner TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
        updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
      );
      CREATE UNIQUE INDEX IF NOT EXISTS owner_name_unique ON skillz_skill (owner, name);
      CREATE INDEX IF NOT EXISTS owner_name_idx ON skillz_skill (owner, name);
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
