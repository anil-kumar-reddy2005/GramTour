import { NextResponse } from 'next/server';
import { getDb } from '../../../db';

export async function GET() {
    try {
        const db = getDb();
        const posts = db.prepare(`
            SELECT p.*, u.name as creator_name
            FROM creator_posts p
            JOIN users u ON p.creator_id = u.id
            ORDER BY p.created_at DESC
        `).all();

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching creator posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
