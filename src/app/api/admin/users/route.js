import { getDb } from '../../../../db';
import { NextResponse } from 'next/server';
import { getUser } from '../../../actions/authActions';

export async function GET(request) {
    try {
        const user = await getUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDb();
        const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();

        return NextResponse.json(users);
    } catch (error) {
        console.error("API error fetching users:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
