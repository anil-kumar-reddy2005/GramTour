const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/gramtour.db');
const db = new Database(dbPath);

async function checkUrl(url) {
    if (!url || !url.startsWith('http')) return false;
    try {
        const res = await fetch(url, { method: 'HEAD' });
        return res.ok;
    } catch {
        return false;
    }
}

async function verify() {
    console.log("Checking database image URLs...");
    
    // Check villages
    const villages = db.prepare("SELECT id, name, hero_image FROM villages").all();
    for (const v of villages) {
        const ok = await checkUrl(v.hero_image);
        if (!ok) {
            console.log(`❌ Village "${v.name}" (ID ${v.id}) has broken hero image: ${v.hero_image}`);
        } else {
            console.log(`✅ Village "${v.name}" has working image.`);
        }
    }

    // Check experiences
    const experiences = db.prepare("SELECT id, title, image FROM experiences").all();
    for (const e of experiences) {
        const ok = await checkUrl(e.image);
        if (!ok) {
            console.log(`❌ Experience "${e.title}" (ID ${e.id}) has broken image: ${e.image}`);
        } else {
            console.log(`✅ Experience "${e.title}" has working image.`);
        }
    }

    // Check products
    const products = db.prepare("SELECT id, product_name, image FROM products").all();
    for (const p of products) {
        const ok = await checkUrl(p.image);
        if (!ok) {
            console.log(`❌ Product "${p.product_name}" (ID ${p.id}) has broken image: ${p.image}`);
        } else {
            console.log(`✅ Product "${p.product_name}" has working image.`);
        }
    }
}

verify().then(() => db.close());
