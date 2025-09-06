const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(process.cwd(), 'dev.sqlite');
const db = new Database(dbPath);

const tableCols = {
  chapters: ['title_i18n', 'content_i18n', 'excerpt_i18n'],
  characters: ['name_i18n', 'title_i18n'],
  locations: ['name_i18n', 'description_i18n'],
  codex_entries: ['title_i18n', 'description_i18n'],
  blog_posts: ['title_i18n', 'content_i18n', 'excerpt_i18n'],
};

function columnExists(table, column) {
  try {
    const r = db.prepare(`PRAGMA table_info("${table}")`).all();
    return r.some(row => row.name === column);
  } catch (e) {
    return false;
  }
}

for (const [table, cols] of Object.entries(tableCols)) {
  try {
    for (const col of cols) {
      if (!columnExists(table, col)) {
        console.log(`Adding column ${col} to ${table}`);
        db.prepare(`ALTER TABLE "${table}" ADD COLUMN "${col}" TEXT`).run();
      } else {
        console.log(`Column ${col} already exists on ${table}`);
      }
    }
  } catch (e) {
    console.error(`Failed to update table ${table}:`, e.message);
  }
}

console.log('done');
db.close();
