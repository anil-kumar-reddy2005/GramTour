import { getDb } from '../../../db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const targetId = searchParams.get('target_id');
        const targetType = searchParams.get('target_type');

        if (userId) {
            const reviews = db.prepare(`
        SELECT r.*, 
          CASE 
            WHEN r.target_type = 'village' THEN v.name 
            WHEN r.target_type = 'experience' THEN e.title 
          END as target_name
        FROM reviews r
        LEFT JOIN villages v ON r.target_id = v.id AND r.target_type = 'village'
        LEFT JOIN experiences e ON r.target_id = e.id AND r.target_type = 'experience'
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `).all(userId);
            return NextResponse.json(reviews);
        }

        if (!targetId || !targetType) {
            return NextResponse.json({ error: 'Missing target_id, target_type or user_id' }, { status: 400 });
        }

        const reviews = db.prepare(`
      SELECT r.*, u.name as user_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.target_id = ? AND r.target_type = ?
      ORDER BY r.created_at DESC
    `).all(targetId, targetType);

        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const db = getDb();
        const body = await request.json();
        const { user_id, target_id, target_type, rating, comment } = body;

        if (!user_id || !target_id || !target_type || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const stmt = db.prepare(`
      INSERT INTO reviews (user_id, target_id, target_type, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);

        const result = stmt.run(user_id, target_id, target_type, rating, comment);

        return NextResponse.json({ id: result.lastInsertRowid, ...body }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
