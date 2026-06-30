const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/gramtour.db');
const db = new Database(dbPath);

console.log("Repairing broken image URLs in SQLite database...");

const updates = [
    // Villages
    { type: 'village', name: 'Raghurajpur', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800' },
    { type: 'village', name: 'Mawlynnong', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800' },
    { type: 'village', name: 'Khonoma', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800' },
    { type: 'village', name: 'Hodka', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800' },
    { type: 'village', name: 'Ziro Valley', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800' },
    { type: 'village', name: 'Majuli', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=800' },
    { type: 'village', name: 'Anegundi', url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800' },
    { type: 'village', name: 'Munsiyari', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800' },

    // Experiences
    { type: 'experience', title: 'Heritage Art Walk', url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800' },
    { type: 'experience', title: 'Clay Pottery Workshop', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800' },

    // Products
    { type: 'product', name: 'Teakwood Lord Ganesha Figurine', url: 'https://images.unsplash.com/photo-1569429593410-b498b3fb3387?q=80&w=800' },
    { type: 'product', name: 'Terracotta Decorative Clay Jug', url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800' }
];

try {
    db.transaction(() => {
        for (const item of updates) {
            if (item.type === 'village') {
                db.prepare("UPDATE villages SET hero_image = ? WHERE name = ?").run(item.url, item.name);
                console.log(`Updated village image for: ${item.name}`);
            } else if (item.type === 'experience') {
                db.prepare("UPDATE experiences SET image = ? WHERE title = ?").run(item.url, item.title);
                console.log(`Updated experience image for: ${item.title}`);
            } else if (item.type === 'product') {
                db.prepare("UPDATE products SET image = ? WHERE product_name = ?").run(item.url, item.name);
                console.log(`Updated product image for: ${item.name}`);
            }
        }
    })();
    console.log("🎉 Database image repair completed successfully!");
} catch (error) {
    console.error("Error repairing images:", error);
} finally {
    db.close();
}
