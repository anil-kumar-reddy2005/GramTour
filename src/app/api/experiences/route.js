import { getDb } from '../../../db';
import { NextResponse } from 'next/server';
export async function GET(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const village_id = searchParams.get('village_id');
        let query = 'SELECT * FROM experiences';
        const params = [];
        if (village_id) {
            query += ' WHERE village_id = ?';
            params.push(village_id);
        }
        const experiences = db.prepare(query).all(...params);
        return NextResponse.json(experiences);
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
      INSERT INTO experiences (village_id, title, description, duration_hours, price, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(body.village_id, body.title, body.description || '', body.duration_hours || 0, body.price || 0, body.image || '');
        return NextResponse.json(Object.assign({ id: result.lastInsertRowid }, body), { status: 201 });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
