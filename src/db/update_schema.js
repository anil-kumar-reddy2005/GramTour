/* eslint-disable */
const Database = require('better-sqlite3');
const path = require('path');
const dbDir = path.resolve(__dirname, '../../data');
const db = new Database(path.join(dbDir, 'gramtour.db'));

console.log('Updating database schema...');

db.exec(`
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  target_type TEXT NOT NULL, -- 'village' or 'experience'
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  item_type TEXT NOT NULL, -- 'village' or 'experience'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

console.log('Reviews and Wishlist tables added.');
