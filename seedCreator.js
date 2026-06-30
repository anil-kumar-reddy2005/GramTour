/* eslint-disable */
const Database = require('better-sqlite3');
const path = require('path');
const dbDir = path.resolve(__dirname, 'data');
const db = new Database(path.join(dbDir, 'gramtour.db'));

try {
    db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES ('Test Creator', 'creator@gramtour.com', 'hash', 'creator')").run();
    console.log('Creator seeded.');
} catch (e) {
    if (e.message.includes('UNIQUE')) {
        console.log('Creator already exists.');
    } else {
        console.log(e.message);
    }
}
