import { getDb } from '../../../db';
import { NextResponse } from 'next/server';
export async function GET(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const state = searchParams.get('state');
        if (id) {
            const village = db.prepare('SELECT * FROM villages WHERE id = ?').get(id);
            if (!village)
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(village);
        }
        let query = 'SELECT * FROM villages';
        const params = [];
        if (state) {
            query += ' WHERE state = ?';
            params.push(state);
        }
        const villages = db.prepare(query).all(...params);
        return NextResponse.json(villages);
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
      INSERT INTO villages (name, state, short_description, full_description, culture, best_time, homestay_price, latitude, longitude, hero_image, gallery_images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(body.name, body.state, body.short_description || '', body.full_description || '', body.culture || '', body.best_time || '', body.homestay_price || 0, body.latitude || 0, body.longitude || 0, body.hero_image || '', body.gallery_images || '[]');
        return NextResponse.json(Object.assign({ id: result.lastInsertRowid }, body), { status: 201 });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
