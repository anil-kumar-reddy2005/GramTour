/* eslint-disable */
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'gramtour.db'));

// schema
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'tourist',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS villages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  culture TEXT,
  best_time TEXT,
  homestay_price INTEGER,
  latitude REAL,
  longitude REAL,
  hero_image TEXT,
  gallery_images TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  village_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_hours INTEGER,
  price INTEGER,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(village_id) REFERENCES villages(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  experience_id INTEGER NOT NULL,
  booking_date TEXT NOT NULL,
  persons INTEGER NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(experience_id) REFERENCES experiences(id)
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  village_id INTEGER NOT NULL,
  artisan_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(village_id) REFERENCES villages(id)
);

CREATE TABLE IF NOT EXISTS ai_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  budget INTEGER,
  days INTEGER,
  interests TEXT,
  ai_result_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

console.log("Schema created successfully.");

// Seeding
const checkVillages = db.prepare("SELECT count(*) as count FROM villages").get();

if (checkVillages.count === 0) {
  const insertVillage = db.prepare(`
    INSERT INTO villages (name, state, short_description, full_description, culture, best_time, homestay_price, latitude, longitude, hero_image, gallery_images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVillage.run(
    'Pochampally',
    'Telangana',
    'Ikat weaving heritage village.',
    'Known as the Silk City of India, Bhoodan Pochampally is renowned for its traditional geometric-patterned Ikat style of dyeing. The village is surrounded by hills, tanks, ponds, and lush green fields.',
    'Rich weaving traditions passed down through generations. The village is a cluster of weaver families working on pit looms.',
    'October to March',
    1500,
    17.326,
    78.894,
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    '[]'
  );

  insertVillage.run(
    'Araku Valley',
    'Andhra Pradesh',
    'Tribal valley and coffee culture.',
    'A majestic hill station surrounded by thick forests of the Eastern Ghats mountain range. Known for its incredible valleys, waterfalls, indigenous tribes, and famously organic coffee plantations.',
    'Home to multiple indigenous tribes with distinct vibrant dances like Dhimsa and rich local traditions.',
    'September to February',
    2000,
    18.327,
    82.880,
    'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?auto=format&fit=crop&w=800&q=80',
    '[]'
  );

  insertVillage.run(
    'Raghurajpur',
    'Odisha',
    'Pattachitra art village.',
    'A heritage crafts village renowned for its master Pattachitra painters, an art form that dates back to 5 BC. Every family in this village is engaged in crafting traditional arts.',
    'Famous not only for Pattachitra but also Gotipua dance, palm leaf engravings, and traditional masks.',
    'October to March',
    1800,
    19.887,
    86.099,
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800',
    '[]'
  );

  console.log("Villages seeded.");
}

const checkUsers = db.prepare("SELECT count(*) as count FROM users").get();
if (checkUsers.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
  insertUser.run('Admin', 'admin@gramtour.com', 'admin_hash_placeholder', 'admin');
  insertUser.run('Test Tourist', 'tourist@gramtour.com', 'user_hash_placeholder', 'tourist');
  console.log("Users seeded.");
}

console.log("Database initialized successfully.");
