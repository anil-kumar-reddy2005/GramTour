/* eslint-disable */
const Database = require('better-sqlite3');
const path = require('path');
const dbDir = path.resolve(__dirname, '../../data');
const db = new Database(path.join(dbDir, 'gramtour.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS creator_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price INTEGER DEFAULT 0,
  location TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(creator_id) REFERENCES users(id)
);
`);

console.log('creator_posts table added.');
