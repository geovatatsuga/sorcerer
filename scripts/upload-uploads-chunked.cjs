// upload-uploads-chunked.cjs
// Lightweight migration helper — updates DB rows to point at local /uploads paths.

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: set DATABASE_URL in env');
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function walkDir(dir) {
  const res = [];
  if (!fs.existsSync(dir)) return res;
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const full = path.join(dir, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const inner = await walkDir(full);
      res.push(...inner);
    } else {
      res.push(full);
    }
  }
  return res;
}

async function updateImageUrlsInDb(client, table, column, idColumn, id, url) {
  const sql = `UPDATE ${table} SET ${column} = $1 WHERE ${idColumn} = $2`;
  await client.query(sql, [url, id]);
}

async function main() {
  const files = await walkDir(UPLOADS_DIR);
  console.log(`Found ${files.length} files`);
  const client = await pool.connect();
  try {
    for (const f of files) {
      if (f.toLowerCase().endsWith('.bak')) continue;
      const rel = path.relative(UPLOADS_DIR, f).replace(/\\/g, '/');
      const filename = path.basename(f);
      const url = `/uploads/${rel}`;

      // Update possible DB references
      const rows = await client.query("SELECT id FROM chapters WHERE image_url LIKE $1", [`%${filename}%`]);
      for (const r of rows.rows) await updateImageUrlsInDb(client, 'chapters', 'image_url', 'id', r.id, url);
      const chars = await client.query("SELECT id FROM characters WHERE image_url LIKE $1", [`%${filename}%`]);
      for (const r of chars.rows) await updateImageUrlsInDb(client, 'characters', 'image_url', 'id', r.id, url);
      const posts = await client.query("SELECT id FROM blog_posts WHERE image_url LIKE $1", [`%${filename}%`]);
      for (const r of posts.rows) await updateImageUrlsInDb(client, 'blog_posts', 'image_url', 'id', r.id, url);
      const users = await client.query("SELECT id FROM users WHERE profile_image_url LIKE $1", [`%${filename}%`]);
      for (const r of users.rows) await updateImageUrlsInDb(client, 'users', 'profile_image_url', 'id', r.id, url);
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log('DB update complete');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
