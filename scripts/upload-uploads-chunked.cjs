// upload-uploads-chunked.cjs
// Best-effort: stream large files instead of reading into memory.
// Note: Supabase Storage may still reject single-object uploads above your plan limit.

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: set DATABASE_URL in env');
  process.exit(1);
}

// create supabase client only if credentials present
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } }) : null;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function ensureBucket(name) {
  if (!supabase) {
    // if no supabase client, assume S3-compatible endpoint will accept bucket
    return;
  }
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (!buckets.find(b => b.name === name)) {
    console.log(`Creating bucket: ${name}`);
    await supabase.storage.createBucket(name, { public: true });
  }
}

async function uploadFileBuffer(bucket, filePath, destPath) {
  const file = fs.readFileSync(filePath);
  // If AWS S3 credentials provided, prefer S3-compatible upload (Supabase S3 gateway)
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_ENDPOINT) {
    const s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
    const body = fs.readFileSync(filePath);
    const cmd = new PutObjectCommand({ Bucket: bucket, Key: destPath, Body: body });
    await s3.send(cmd);
    const supabaseUrl = process.env.SUPABASE_URL || process.env.S3_PUBLIC_BASE || '';
    const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeURIComponent(destPath)}`;
    return publicUrl;
  }

  const { data, error } = await supabase.storage.from(bucket).upload(destPath, file, { upsert: true });
  if (error) throw error;
  const publicUrl = supabase.storage.from(bucket).getPublicUrl(destPath).data.publicUrl;
  return publicUrl;
}

async function uploadFileStream(bucket, filePath, destPath) {
  // Attempt to stream the file. supabase-js accepts Readable in Node environments.
  const stream = fs.createReadStream(filePath);
  // If AWS S3 credentials provided, stream to S3-compatible endpoint
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_ENDPOINT) {
    const s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
    const cmd = new PutObjectCommand({ Bucket: bucket, Key: destPath, Body: stream });
    await s3.send(cmd);
    const supabaseUrl = process.env.SUPABASE_URL || process.env.S3_PUBLIC_BASE || '';
    const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeURIComponent(destPath)}`;
    return publicUrl;
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(destPath, stream, { upsert: true });
    if (error) throw error;
    const publicUrl = supabase.storage.from(bucket).getPublicUrl(destPath).data.publicUrl;
    return publicUrl;
  } catch (err) {
    // Re-throw to be handled by caller
    throw err;
  }
}

async function walkDir(dir) {
  const res = [];
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
  await ensureBucket('uploads');
  const files = await walkDir(UPLOADS_DIR);
  console.log(`Found ${files.length} files to upload`);

  const client = await pool.connect();
  let uploaded = 0;
  try {
    for (const f of files) {
      // skip backup files
      if (f.toLowerCase().endsWith('.bak')) {
        console.log('Skipping backup file:', f);
        continue;
      }
      const rel = path.relative(UPLOADS_DIR, f).replace(/\\/g, '/');
      const dest = rel;
      const stat = fs.statSync(f);
      try {
        let url;
        // If file > 50MB attempt streaming upload, else buffer
        if (stat.size > 50 * 1024 * 1024) {
          console.log('Attempting stream upload for large file:', rel, `(${Math.round(stat.size/1024/1024)} MB)`);
          url = await uploadFileStream('uploads', f, dest);
        } else {
          url = await uploadFileBuffer('uploads', f, dest);
        }
        uploaded++;
        // Update possible DB references (same heuristics as original script)
        const filename = path.basename(f);
        const rows = await client.query("SELECT id FROM chapters WHERE image_url LIKE $1", [`%${filename}%`]);
        for (const r of rows.rows) await updateImageUrlsInDb(client, 'chapters', 'image_url', 'id', r.id, url);
        const chars = await client.query("SELECT id FROM characters WHERE image_url LIKE $1", [`%${filename}%`]);
        for (const r of chars.rows) await updateImageUrlsInDb(client, 'characters', 'image_url', 'id', r.id, url);
        const posts = await client.query("SELECT id FROM blog_posts WHERE image_url LIKE $1", [`%${filename}%`]);
        for (const r of posts.rows) await updateImageUrlsInDb(client, 'blog_posts', 'image_url', 'id', r.id, url);
        const users = await client.query("SELECT id FROM users WHERE profile_image_url LIKE $1", [`%${filename}%`]);
        for (const r of users.rows) await updateImageUrlsInDb(client, 'users', 'profile_image_url', 'id', r.id, url);
      } catch (err) {
        console.error('Failed to upload', f, err.message || err);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`Uploaded ${uploaded}/${files.length} files to Supabase Storage`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
