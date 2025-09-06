#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace('file:', '') : path.join(__dirname, '..', 'dev.sqlite');
console.log('Opening DB at', dbPath);
const db = new Database(dbPath);

function generateSlug(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

try {
  // Ensure slug column exists
  const cols = db.prepare("PRAGMA table_info('characters');").all();
  const hasSlug = cols.some(c => c.name === 'slug');
  if (!hasSlug) {
    console.log('Adding slug column to characters table');
    db.prepare("ALTER TABLE characters ADD COLUMN slug TEXT;").run();
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_slug ON characters(slug);").run();
  }

  const rows = db.prepare('SELECT id, name, slug FROM characters').all();
  const getBySlug = db.prepare('SELECT id FROM characters WHERE slug = ?');
  const update = db.prepare('UPDATE characters SET slug = ? WHERE id = ?');

  for (const row of rows) {
    if (row.slug && row.slug.trim()) continue;
    let base = generateSlug(row.name || (row.id || '')).slice(0, 100) || row.id;
    let candidate = base;
    let counter = 1;
    while (getBySlug.get(candidate)) {
      candidate = `${base}-${counter++}`;
    }
    console.log(`Updating ${row.id} -> ${candidate}`);
    update.run(candidate, row.id);
  }

  console.log('Backfill complete');
  process.exit(0);
} catch (err) {
  console.error('Backfill failed:', err);
  process.exit(1);
}
