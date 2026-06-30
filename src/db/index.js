import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
let db = null;
export function getDb() {
    if (!db) {
        const dbDir = path.resolve(process.cwd(), 'data');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        db = new Database(path.join(dbDir, 'gramtour.db'), { verbose: console.log });
    }
    return db;
}
