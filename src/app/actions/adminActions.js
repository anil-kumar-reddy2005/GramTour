'use server';

import { getDb } from '../../db';
import { getUser } from './authActions';
import { revalidatePath } from 'next/cache';

async function verifyAdmin() {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized. Admin access required.');
    }
}

export async function addVillage(formData) {
    try {
        await verifyAdmin();
        const db = getDb();

        const stmt = db.prepare(`
            INSERT INTO villages 
            (name, state, latitude, longitude, short_description, long_description, homestay_price, main_image, hero_image, experiences_overview, community_impact)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
            formData.get('name'),
            formData.get('state'),
            parseFloat(formData.get('latitude')) || 0,
            parseFloat(formData.get('longitude')) || 0,
            formData.get('short_description'),
            formData.get('long_description'),
            parseFloat(formData.get('homestay_price')) || 0,
            formData.get('main_image'),
            formData.get('hero_image'),
            formData.get('experiences_overview'),
            formData.get('community_impact')
        );

        revalidatePath('/explore');
        revalidatePath('/admin');
        return { success: true, id: info.lastInsertRowid };
    } catch (error) {
        console.error('Error adding village:', error);
        return { error: error.message || 'Failed to add village.' };
    }
}

export async function editVillage(id, formData) {
    try {
        await verifyAdmin();
        const db = getDb();

        const stmt = db.prepare(`
            UPDATE villages SET
            name = ?, state = ?, latitude = ?, longitude = ?, 
            short_description = ?, long_description = ?, homestay_price = ?, 
            main_image = ?, hero_image = ?, experiences_overview = ?, community_impact = ?
            WHERE id = ?
        `);

        stmt.run(
            formData.get('name'),
            formData.get('state'),
            parseFloat(formData.get('latitude')) || 0,
            parseFloat(formData.get('longitude')) || 0,
            formData.get('short_description'),
            formData.get('long_description'),
            parseFloat(formData.get('homestay_price')) || 0,
            formData.get('main_image'),
            formData.get('Hero_image'),
            formData.get('experiences_overview'),
            formData.get('community_impact'),
            id
        );

        revalidatePath('/explore');
        revalidatePath('/admin');
        revalidatePath(`/villages/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error editing village:', error);
        return { error: error.message || 'Failed to edit village.' };
    }
}

export async function deleteVillage(id) {
    try {
        await verifyAdmin();
        const db = getDb();

        db.transaction(() => {
            // Delete related experiences
            db.prepare('DELETE FROM experiences WHERE village_id = ?').run(id);
            // Delete related products
            db.prepare('DELETE FROM products WHERE village_id = ?').run(id);
            // Delete related bookings
            db.prepare('DELETE FROM bookings WHERE village_id = ?').run(id);
            // Finally delete village
            db.prepare('DELETE FROM villages WHERE id = ?').run(id);
        })();

        revalidatePath('/explore');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Error deleting village:', error);
        return { error: error.message || 'Failed to delete village.' };
    }
}

export async function updateBookingStatus(id, status) {
    try {
        await verifyAdmin();
        const db = getDb();
        db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);
        revalidatePath('/dashboard');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Error updating booking status:', error);
        return { error: error.message || 'Failed to update booking status.' };
    }
}

export async function addExperience(formData) {
    try {
        await verifyAdmin();
        const db = getDb();

        const stmt = db.prepare(`
            INSERT INTO experiences 
            (village_id, title, description, duration_hours, price, image)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            parseInt(formData.get('village_id')),
            formData.get('title'),
            formData.get('description'),
            parseInt(formData.get('duration_hours')) || 0,
            parseInt(formData.get('price')) || 0,
            formData.get('image') || ''
        );

        revalidatePath('/admin');
        revalidatePath(`/villages/${formData.get('village_id')}`);
        return { success: true };
    } catch (error) {
        console.error('Error adding experience:', error);
        return { error: error.message || 'Failed to add experience.' };
    }
}

export async function editExperience(id, formData) {
    try {
        await verifyAdmin();
        const db = getDb();

        const stmt = db.prepare(`
            UPDATE experiences SET
            village_id = ?, title = ?, description = ?, duration_hours = ?, price = ?, image = ?
            WHERE id = ?
        `);

        stmt.run(
            parseInt(formData.get('village_id')),
            formData.get('title'),
            formData.get('description'),
            parseInt(formData.get('duration_hours')) || 0,
            parseInt(formData.get('price')) || 0,
            formData.get('image') || '',
            id
        );

        revalidatePath('/admin');
        revalidatePath(`/villages/${formData.get('village_id')}`);
        return { success: true };
    } catch (error) {
        console.error('Error editing experience:', error);
        return { error: error.message || 'Failed to edit experience.' };
    }
}

export async function deleteExperience(id) {
    try {
        await verifyAdmin();
        const db = getDb();

        // We might want to know village_id for revalidation
        const exp = db.prepare('SELECT village_id FROM experiences WHERE id = ?').get(id);

        db.transaction(() => {
            db.prepare('DELETE FROM bookings WHERE experience_id = ?').run(id);
            db.prepare('DELETE FROM experiences WHERE id = ?').run(id);
        })();

        revalidatePath('/admin');
        if (exp) revalidatePath(`/villages/${exp.village_id}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting experience:', error);
        return { error: error.message || 'Failed to delete experience.' };
    }
}

export async function updateUserRole(id, role) {
    try {
        await verifyAdmin();
        const db = getDb();
        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { error: error.message || 'Failed to update user role.' };
    }
}

export async function deleteUser(id) {
    try {
        await verifyAdmin();
        const db = getDb();

        // Don't let admin delete themselves
        const user = await getUser();
        if (parseInt(id) === user.id) {
            return { error: 'Admin cannot delete their own account.' };
        }

        db.transaction(() => {
            db.prepare('DELETE FROM bookings WHERE user_id = ?').run(id);
            db.prepare('DELETE FROM ai_plans WHERE user_id = ?').run(id);
            db.prepare('DELETE FROM users WHERE id = ?').run(id);
        })();

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { error: error.message || 'Failed to delete user.' };
    }
}
