import { getDb } from '../../../../db';
import { NextResponse } from 'next/server';
import { getUser } from '../../../actions/authActions';
import { cookies } from 'next/headers';

export async function PUT(request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
        }

        const db = getDb();

        // Check if new email is already taken by someone else
        if (email !== user.email) {
            const checkEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, user.id);
            if (checkEmail) {
                return NextResponse.json({ error: 'Email is already in use by another account.' }, { status: 400 });
            }
        }

        // Update database
        const updateStmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
        updateStmt.run(name, email, user.id);

        // Update session cookie explicitly so the frontend instantly shows the new name
        const updatedUser = { ...user, name, email };
        const cookieStore = await cookies();
        cookieStore.set('session', JSON.stringify(updatedUser), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
    }
}
