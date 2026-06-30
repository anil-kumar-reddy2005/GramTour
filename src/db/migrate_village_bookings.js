/* eslint-disable */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/gramtour.db');
const db = new Database(dbPath);

console.log("Starting database migration for Village Bookings and Settings...");

try {
    // 1. Create the new settings table for the QR code
    db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
    console.log("Settings table created.");

    // 2. Re-create the bookings table to include village_id and make experience_id nullable
    db.exec(`
    CREATE TABLE IF NOT EXISTS new_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      village_id INTEGER,
      experience_id INTEGER,
      booking_date TEXT NOT NULL,
      persons INTEGER NOT NULL,
      contact_phone TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(village_id) REFERENCES villages(id),
      FOREIGN KEY(experience_id) REFERENCES experiences(id)
    );
  `);

    // 3. Migrate existing data. Link village_id via the experience if it exists.
    const oldBookingsExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bookings'").get();

    if (oldBookingsExist) {
        console.log("Migrating existing bookings...");
        db.exec(`
      INSERT INTO new_bookings (id, user_id, village_id, experience_id, booking_date, persons, contact_phone, status, created_at)
      SELECT 
        b.id, 
        b.user_id, 
        e.village_id, 
        b.experience_id, 
        b.booking_date, 
        b.persons, 
        b.contact_phone, 
        b.status, 
        b.created_at
      FROM bookings b
      LEFT JOIN experiences e ON b.experience_id = e.id;
    `);

        // 4. Drop old and rename
        db.exec(`
      DROP TABLE bookings;
      ALTER TABLE new_bookings RENAME TO bookings;
    `);
    } else {
        // If no old bookings table existed (unlikely), just rename the new one
        db.exec(`ALTER TABLE new_bookings RENAME TO bookings;`);
    }

    console.log("Migration completed successfully.");

} catch (error) {
    console.error("Migration failed:", error);
} finally {
    db.close();
}
