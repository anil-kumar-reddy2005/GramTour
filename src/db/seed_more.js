/* eslint-disable */
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/gramtour.db');
const db = new Database(dbPath);

const villages = [
    {
        name: "Mawlynnong", state: "Meghalaya",
        short_description: "Asia's cleanest village known for living root bridges.",
        full_description: "Located in the East Khasi Hills, Mawlynnong is famous for its matrilineal society, pristine cleanliness, and the awe-inspiring living root bridges nearby made from rubber trees.",
        culture: "Khasi tribal culture, eco-friendly lifestyle.",
        best_time: "September to November", homestay_price: 1800, latitude: 25.202, longitude: 91.916,
        hero_image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800"
    },
    {
        name: "Khonoma", state: "Nagaland",
        short_description: "India's first green village with a rich warrior history.",
        full_description: "A historic village of the Angami Naga warrior tribe. Khonoma is celebrated for its successful conservation efforts, terraced agriculture, and sustainable living.",
        culture: "Angami tribal traditions, sustainable agriculture.",
        best_time: "October to April", homestay_price: 2000, latitude: 25.660, longitude: 94.026,
        hero_image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800"
    },
    {
        name: "Hodka", state: "Gujarat",
        short_description: "Vibrant desert village in the Rann of Kutch.",
        full_description: "Famous for its unique mud houses (Bhungas) painted with earth colors and decorated with mirror work. The Halepotra and Meghwal communities run excellent eco-resorts.",
        culture: "Exquisite embroidery, leather crafts, and Kutchi folk music.",
        best_time: "November to March", homestay_price: 2500, latitude: 23.774, longitude: 69.702,
        hero_image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800"
    },
    {
        name: "Ziro Valley", state: "Arunachal Pradesh",
        short_description: "Apatani tribal home surrounded by pine hills.",
        full_description: "A UNESCO World Heritage candidate, Ziro is known for its mesmerizing pine-clad hills, unique wet rice cultivation, and the distinct Apatani tribe who practice sustainable farming.",
        culture: "Apatani culture, famed for facial tattoos and nose plugs.",
        best_time: "March to October", homestay_price: 1600, latitude: 27.636, longitude: 93.832,
        hero_image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800"
    },
    {
        name: "Kumarakom", state: "Kerala",
        short_description: "Backwater village on Vembanad Lake.",
        full_description: "A cluster of little islands on Vembanad Lake. Experience traditional Kerala village life, ride in houseboats, watch local fishermen, and enjoy incredible biodiversity.",
        culture: "Fishing, coir weaving, traditional Kerala culinary arts.",
        best_time: "September to March", homestay_price: 3000, latitude: 9.617, longitude: 76.432,
        hero_image: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&q=80"
    },
    {
        name: "Jibhi", state: "Himachal Pradesh",
        short_description: "Unspoiled Himalayan hamlet with wooden houses.",
        full_description: "Tucked away in the Tirthan Valley, Jibhi is characterized by dense pine forests, tranquil freshwater lakes, and charming Victorian-style wooden architecture.",
        culture: "Traditional Himalayan lifestyle, apple orcharding.",
        best_time: "March to May, September to November", homestay_price: 1500, latitude: 31.635, longitude: 77.348,
        hero_image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80"
    },
    {
        name: "Majuli", state: "Assam",
        short_description: "World's largest river island.",
        full_description: "A huge river island in the Brahmaputra River. Majuli is the cultural capital of Assam and the center of Neo-Vaishnavite culture initiated by Saint Sankardeva.",
        culture: "Satras (monasteries), traditional mask making, Mishing tribal life.",
        best_time: "October to March", homestay_price: 1200, latitude: 26.953, longitude: 94.167,
        hero_image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=800"
    },
    {
        name: "Pipli", state: "Odisha",
        short_description: "The applique art capital.",
        full_description: "A small village near Puri, globally recognized for its exquisite applique work. The entire village economy and lifestyle revolve around this historic handicraft.",
        culture: "Generations of artisans creating temple canopies and umbrellas.",
        best_time: "October to February", homestay_price: 1000, latitude: 20.117, longitude: 85.834,
        hero_image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80"
    },
    {
        name: "Anegundi", state: "Karnataka",
        short_description: "Ancient village older than the Vijayanagara Empire.",
        full_description: "Located across the Tungabhadra river from Hampi, Anegundi is believed to be the monkey kingdom of Kishkindha in the epic Ramayana. It's an open-air museum.",
        culture: "Heritage crafts from banana fiber, historic temples, bouldering.",
        best_time: "October to February", homestay_price: 1800, latitude: 15.352, longitude: 76.478,
        hero_image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800"
    },
    {
        name: "Turtuk", state: "Ladakh",
        short_description: "The last village of India near the LOC.",
        full_description: "A breathtakingly beautiful Balti village in the Nubra Valley. Known for its stone houses, apricot orchards, and distinct Balti culture, completely different from the rest of Ladakh.",
        culture: "Balti Muslim traditions, apricot farming, stone architecture.",
        best_time: "June to September", homestay_price: 2200, latitude: 34.846, longitude: 76.815,
        hero_image: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80"
    },
    {
        name: "Bishnoi Village", state: "Rajasthan",
        short_description: "Pioneers of environmental conservation.",
        full_description: "Near Jodhpur, this village is home to the Bishnoi community who fiercely protect their flora and fauna. Blackbucks and Chinkaras roam freely amidst the village.",
        culture: "Strict vegetarianism, deep respect for nature, traditional pottery and weaving.",
        best_time: "October to March", homestay_price: 2500, latitude: 26.126, longitude: 73.080,
        hero_image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80"
    },
    {
        name: "Munsiyari", state: "Uttarakhand",
        short_description: "Himalayan village offering views of Panchachuli.",
        full_description: "Nestled in the snow-capped peaks of the Himalayas, Munsiyari is known as 'Little Kashmir'. It's a paradise for nature lovers and high altitude trekkers.",
        culture: "Bhotia tribal culture, high altitude farming, hand-woven carpets.",
        best_time: "March to June, September to November", homestay_price: 1800, latitude: 30.071, longitude: 80.237,
        hero_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800"
    }
];

const insertVillage = db.prepare(`
  INSERT INTO villages (name, state, short_description, full_description, culture, best_time, homestay_price, latitude, longitude, hero_image, gallery_images)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let count = 0;
for (const v of villages) {
    // Check if exists
    const exists = db.prepare("SELECT 1 FROM villages WHERE name = ?").get(v.name);
    if (!exists) {
        insertVillage.run(
            v.name, v.state, v.short_description, v.full_description,
            v.culture, v.best_time, v.homestay_price, v.latitude, v.longitude,
            v.hero_image, '[]'
        );
        count++;
    }
}

console.log(`Successfully added ${count} new villages.`);
