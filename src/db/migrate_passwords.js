/* eslint-disable */
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbDir = path.resolve(__dirname, '../../data');
const db = new Database(path.join(dbDir, 'gramtour.db'));

async function migratePasswords() {
    console.log("Starting password migration for existing users...");

    // We'll set all their passwords to 'password123' so they are usable
    const defaultPassword = 'password123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(defaultPassword, saltRounds);

    const updateStmt = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?');

    // Update the known demo users
    const emailsToUpdate = ['admin@gramtour.com', 'tourist@gramtour.com', 'creator@gramtour.com'];

    const updateTransaction = db.transaction((emails) => {
        let count = 0;
        for (const email of emails) {
            const info = updateStmt.run(hash, email);
            if (info.changes > 0) count++;
        }
        return count;
    });

    const updatedCount = updateTransaction(emailsToUpdate);
    console.log(`Successfully migrated ${updatedCount} users to secure bcrypt hashes (Password: 'password123').`);
}

migratePasswords().catch(console.error);
