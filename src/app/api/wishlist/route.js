import { getDb } from '../../../db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
        }

        const wishlist = db.prepare(`
      SELECT w.*, 
        CASE 
          WHEN w.item_type = 'village' THEN v.name 
          WHEN w.item_type = 'experience' THEN e.title 
        END as name,
        CASE 
          WHEN w.item_type = 'village' THEN v.hero_image 
          WHEN w.item_type = 'experience' THEN e.image 
        END as image
      FROM wishlist w
      LEFT JOIN villages v ON w.item_id = v.id AND w.item_type = 'village'
      LEFT JOIN experiences e ON w.item_id = e.id AND w.item_type = 'experience'
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `).all(userId);

        return NextResponse.json(wishlist);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const db = getDb();
        const body = await request.json();
        const { user_id, item_id, item_type } = body;

        if (!user_id || !item_id || !item_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if already in wishlist
        const existing = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND item_id = ? AND item_type = ?').get(user_id, item_id, item_type);
        if (existing) {
            return NextResponse.json({ message: 'Already in wishlist', id: existing.id });
        }

        const stmt = db.prepare(`
      INSERT INTO wishlist (user_id, item_id, item_type)
      VALUES (?, ?, ?)
    `);

        const result = stmt.run(user_id, item_id, item_type);

        return NextResponse.json({ id: result.lastInsertRowid, ...body }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const itemId = searchParams.get('item_id');
        const itemType = searchParams.get('item_type');

        if (!userId || !itemId || !itemType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const stmt = db.prepare('DELETE FROM wishlist WHERE user_id = ? AND item_id = ? AND item_type = ?');
        stmt.run(userId, itemId, itemType);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
