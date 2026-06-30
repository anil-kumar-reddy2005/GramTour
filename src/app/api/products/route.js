import { getDb } from '../../../db';
import { NextResponse } from 'next/server';
export async function GET(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const village_id = searchParams.get('village_id');
        let query = `
      SELECT p.*, v.name as village_name 
      FROM products p
      JOIN villages v ON p.village_id = v.id
    `;
        const params = [];
        if (village_id) {
            query += ' WHERE p.village_id = ?';
            params.push(village_id);
        }
        const products = db.prepare(query).all(...params);
        return NextResponse.json(products);
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const body = await request.json();
        const db = getDb();
        const stmt = db.prepare(`
      INSERT INTO products (village_id, artisan_name, product_name, description, price, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(body.village_id, body.artisan_name, body.product_name, body.description || '', body.price || 0, body.image || '');
        return NextResponse.json(Object.assign({ id: result.lastInsertRowid }, body), { status: 201 });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
