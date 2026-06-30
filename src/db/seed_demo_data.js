/* eslint-disable */
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../../data/gramtour.db');
const db = new Database(dbPath);

console.log("Seeding realistic GramTour database demo data...");

try {
    // 1. Ensure tables exist with likes_count and comments_count
    db.exec(`
    CREATE TABLE IF NOT EXISTS creator_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      price INTEGER DEFAULT 0,
      location TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(creator_id) REFERENCES users(id)
    );
    `);

    // Alter table to add likes_count and comments_count if they do not exist
    try {
        db.exec("ALTER TABLE creator_posts ADD COLUMN likes_count INTEGER DEFAULT 0;");
    } catch (e) {
        // Column may already exist
    }
    try {
        db.exec("ALTER TABLE creator_posts ADD COLUMN comments_count INTEGER DEFAULT 0;");
    } catch (e) {
        // Column may already exist
    }

    // 2. Ensure creator user exists
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync('password123', saltRounds);
    
    // Check/Insert creator
    const creatorUser = db.prepare("SELECT id FROM users WHERE email = ?").get('creator@gramtour.com');
    let creatorId;
    if (!creatorUser) {
        const info = db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)").run(
            'Rohan Sharma', 'creator@gramtour.com', passwordHash, 'creator'
        );
        creatorId = info.lastInsertRowid;
        console.log("Seeded Creator Rohan Sharma.");
    } else {
        creatorId = creatorUser.id;
    }

    // Ensure tourist exists
    const touristUser = db.prepare("SELECT id FROM users WHERE email = ?").get('tourist@gramtour.com');
    if (!touristUser) {
        db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)").run(
            'Amit Patel', 'tourist@gramtour.com', passwordHash, 'tourist'
        );
        console.log("Seeded Tourist Amit Patel.");
    }

    // Ensure admin exists
    const adminUser = db.prepare("SELECT id FROM users WHERE email = ?").get('admin@gramtour.com');
    if (!adminUser) {
        db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)").run(
            'Admin', 'admin@gramtour.com', passwordHash, 'admin'
        );
        console.log("Seeded Admin.");
    } else {
        // Update password hash to bcrypt if it is 'admin_hash_placeholder'
        if (adminUser.password_hash === 'admin_hash_placeholder') {
            db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, adminUser.id);
            console.log("Migrated Admin password to bcrypt.");
        }
    }

    // 3. Clean and Seed Experiences (disable foreign keys during seed)
    db.exec(`PRAGMA foreign_keys = OFF;`);
    db.exec(`DELETE FROM experiences;`);
    const insertExperience = db.prepare(`
        INSERT INTO experiences (village_id, title, description, duration_hours, price, image)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Get village IDs
    const pochampally = db.prepare("SELECT id FROM villages WHERE name = ?").get('Pochampally');
    const araku = db.prepare("SELECT id FROM villages WHERE name = ?").get('Araku Valley');
    const raghurajpur = db.prepare("SELECT id FROM villages WHERE name = ?").get('Raghurajpur');
    const anegundi = db.prepare("SELECT id FROM villages WHERE name = ?").get('Anegundi');

    const vId1 = pochampally ? pochampally.id : 1;
    const vId2 = araku ? araku.id : 2;
    const vId3 = raghurajpur ? raghurajpur.id : 3;
    const vId12 = anegundi ? anegundi.id : 4;

    // Traditional Cooking
    insertExperience.run(vId2, 'Traditional Cooking & Feast', 'Learn tribal bamboo cooking methods using forest spices and fresh ingredients, followed by a communal organic lunch.', 3, 750, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80');
    // Bullock Cart Ride
    insertExperience.run(vId1, 'Sunset Bullock Cart Ride', 'Take a peaceful journey through cotton fields in a traditional cart, learning about village architecture and local life.', 2, 350, 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80');
    // River Boating
    insertExperience.run(vId12, 'Coracle River Boating', 'Float along the Tungabhadra River in a traditional circular woven boat amidst giant granite boulders and ancient ruins.', 2, 500, 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=800&q=80');
    // Village Walk
    insertExperience.run(vId3, 'Heritage Art Walk', 'Explore the paint-splattered alleys of Raghurajpur, talking directly with National Award-winning scroll painters.', 3, 400, 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800');
    // Folk Dance
    insertExperience.run(vId2, 'Dhimsa Tribal Folk Dance', 'Enjoy a nightly tribal campfire performance of Dhimsa dance, and join in to learn the rhythmic steps.', 2, 600, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80');
    // Pottery Workshop
    insertExperience.run(vId3, 'Clay Pottery Workshop', 'Sit down at a manual wooden wheel and shape clay bowls and cups with guidance from a master artisan.', 3, 450, 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800');

    console.log("Seeded 6 Experiences.");

    // 4. Clean and Seed Products
    db.exec(`DELETE FROM products;`);
    const insertProduct = db.prepare(`
        INSERT INTO products (village_id, artisan_name, product_name, description, price, image)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Handloom Saree
    insertProduct.run(vId1, 'Laxmi Devi', 'Pochampally Silk Ikat Saree', 'Handwoven pure silk saree featuring distinct geometric patterns dyed using the double Ikat technique.', 6500, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80');
    // Bamboo Basket
    insertProduct.run(vId2, 'Ganga Raju', 'Handcrafted Bamboo Picnic Basket', 'Durable, lightweight basket woven from native forest bamboo. Eco-friendly and beautifully structured.', 450, 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80');
    // Organic Honey
    insertProduct.run(vId2, 'Konda Babu', 'Wild Forest Organic Honey', 'Raw honey harvested from wild beehives in the Araku hills. 100% natural with high medicinal values.', 320, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80');
    // Millets
    insertProduct.run(vId1, 'Balaji Naik', 'Organic Ragi (Finger Millet) Grain', 'Nutrient-rich, stone-ground high fiber ragi grown using organic compost without chemicals.', 120, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80');
    // Wood Carvings
    insertProduct.run(vId12, 'Narasimha Swamy', 'Teakwood Lord Ganesha Figurine', 'A miniature teakwood sculpture of Ganesha, hand-carved with high precision and polished naturally.', 2200, 'https://images.unsplash.com/photo-1569429593410-b498b3fb3387?q=80&w=800');
    // Clay Pottery
    insertProduct.run(vId3, 'Biswanath Das', 'Terracotta Decorative Clay Jug', 'Traditional earthen water vessel painted with water-resistant organic mineral colors.', 550, 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800');

    console.log("Seeded 6 Products.");

    // 5. Clean and Seed Creator Posts
    db.exec(`DELETE FROM creator_posts;`);
    const insertPost = db.prepare(`
        INSERT INTO creator_posts (creator_id, title, description, image_url, price, location, likes_count, comments_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPost.run(
        creatorId,
        'Behind the Weave: Pochampally pit looms',
        'Spent the morning with Laxmaiah, a third-generation master weaver. The precision needed to align the warp and weft for Ikat dye pattern is mind-boggling!',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        250,
        'Pochampally, Telangana',
        245,
        34
    );

    insertPost.run(
        creatorId,
        'Waking up to the aroma of Araku Coffee',
        'Fogs rolling down the Eastern Ghats while drinking hot organic coffee in a bamboo bhunga. The local tribal cooperatives are transforming this valley!',
        'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?auto=format&fit=crop&w=800&q=80',
        150,
        'Araku Valley, Andhra Pradesh',
        412,
        56
    );

    insertPost.run(
        creatorId,
        'Gotipua Dancers of Raghurajpur',
        'Young boys dressing up in traditional jewelry and performing athletic yoga-like postures representing the divine. An absolutely magical Odishi art tradition.',
        'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80',
        200,
        'Raghurajpur, Odisha',
        189,
        28
    );

    insertPost.run(
        creatorId,
        'Living Root Bridges of Mawlynnong',
        'Wandered through the lush Khasi hills. Witnessing a bridge that is alive, growing stronger with every rainstorm, is a masterclass in green architecture!',
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800',
        180,
        'Mawlynnong, Meghalaya',
        367,
        42
    );

    insertPost.run(
        creatorId,
        'Bishnoi blackbucks roaming freely',
        'It is inspiring to see how the Bishnoi community treats nature. Deer and blackbucks walk directly into houses, perfectly safe from hunters here.',
        'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
        100,
        'Bishnoi Village, Rajasthan',
        521,
        78
    );

    console.log("Seeded 5 Creator Posts.");

    // Fix Anegundi broken image in villages table
    db.prepare("UPDATE villages SET hero_image = ? WHERE name = ?").run(
        'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800',
        'Anegundi'
    );
    console.log("Fixed Anegundi village hero image.");

    db.exec(`PRAGMA foreign_keys = ON;`);
    console.log("Demo database seeding complete!");
} catch (e) {
    console.error("Error seeding demo data:", e);
} finally {
    db.close();
}
