'use server';
import { cookies } from 'next/headers';
import { getDb } from '../../db';

export async function createPost(formData) {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
        return { error: 'Unauthorized' };
    }

    const user = JSON.parse(session.value);
    if (user.role !== 'creator' && user.role !== 'admin') {
        return { error: 'Only creators can post' };
    }

    try {
        const db = getDb();
        const title = formData.get('title');
        const description = formData.get('description');
        const location = formData.get('location');
        const price = parseInt(formData.get('price') || '0', 10);
        const imageUrl = formData.get('imageUrl');

        const stmt = db.prepare(`
            INSERT INTO creator_posts (creator_id, title, description, image_url, price, location)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(user.id, title, description, imageUrl, price, location);

        return { success: true };
    } catch (error) {
        console.error('Error creating post:', error);
        return { error: 'Failed to create post' };
    }
}
