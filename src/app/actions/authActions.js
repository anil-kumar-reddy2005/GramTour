'use server';
import { cookies } from 'next/headers';
import { getDb } from '../../db';
import bcrypt from 'bcryptjs';

export async function login(email, password) {
    try {
        const db = getDb();
        const stmt = db.prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ?');
        const user = stmt.get(email);

        if (!user) {
            return { error: 'Invalid email or password.' };
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return { error: 'Invalid email or password.' };
        }

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('session', JSON.stringify(user), {
            httpOnly: false, // allow client to read role for some UI toggles if needed, though server components are better
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Internal server error.' };
    }
}

export async function register(name, email, password, role = 'tourist') {
    try {
        const db = getDb();

        // Prevent registering as admin
        if (role === 'admin') {
            return { error: 'Cannot register as an admin.' };
        }

        // Check if email already exists
        const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (checkUser) {
            return { error: 'Email already registered. Please log in.' };
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const insertStmt = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
        const result = insertStmt.run(name, email, password_hash, role);

        const user = { id: result.lastInsertRowid, name, email, role };

        // Set session cookie logging them in immediately
        const cookieStore = await cookies();
        cookieStore.set('session', JSON.stringify(user), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Failed to register account.' };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    return { success: true };
}

export async function getUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return null;
    try {
        return JSON.parse(session.value);
    } catch {
        return null;
    }
}
