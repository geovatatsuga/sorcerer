const Database = require('better-sqlite3');
const db = new Database('dev.sqlite');
try {
  db.prepare('DROP INDEX IF EXISTS idx_characters_slug').run();
  console.log('dropped idx_characters_slug');
} catch (e) {
  console.error('drop failed', e.message);
}
db.close();
