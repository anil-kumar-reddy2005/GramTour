import { getDb } from '../../../db';
import { NextResponse } from 'next/server';
import { getUser } from '../../actions/authActions';
export async function GET(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const id = searchParams.get('id');
        let query = `
      SELECT 
        b.*, 
        e.title as experience_title, 
        v.name as village_name,
        COALESCE(e.title, 'Village Stay / Visit') as display_title,
        v.homestay_price,
        e.price as experience_price
      FROM bookings b
      LEFT JOIN experiences e ON b.experience_id = e.id
      LEFT JOIN villages v ON b.village_id = v.id OR e.village_id = v.id
    `;
        const params = [];
        const conditions = [];
        if (user_id) {
            conditions.push('b.user_id = ?');
            params.push(user_id);
        }
        if (id) {
            conditions.push('b.id = ?');
            params.push(id);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY b.created_at DESC';
        
        if (id) {
            const booking = db.prepare(query).get(...params);
            return NextResponse.json(booking || null);
        } else {
            const bookings = db.prepare(query).all(...params);
            return NextResponse.json(bookings);
        }
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const body = await request.json();
        const db = getDb();

        // Use authenticated session if available, else fallback to body/default
        const authUser = await getUser();
        const user_id = authUser ? authUser.id : (body.user_id || 2);
        const user_email = authUser ? authUser.email : 'tourist@gramtour.com';
        const user_name = authUser ? authUser.name : 'Adventurer';

        const stmt = db.prepare(`
      INSERT INTO bookings (user_id, village_id, experience_id, booking_date, persons, contact_phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        // Use village_id directly if provided, fallback to experience_id for legacy
        const village_id = body.village_id || null;
        const experience_id = body.experience_id || null;

        const result = stmt.run(user_id, village_id, experience_id, body.booking_date, body.persons, body.contact_phone, body.status || 'pending');

        // ------------------------------------------------------------------
        // SIMULATE EMAIL CONFIRMATION DISPATCH
        // ------------------------------------------------------------------
        console.log(`\n======================================================`);
        console.log(`✉️  [MOCK EMAIL SERVICE] Dispatching Booking Confirmation`);
        console.log(`   To: ${user_name} <${user_email}>`);
        console.log(`   Subject: Booking Confirmed - Reference ID #${result.lastInsertRowid}`);
        console.log(`   Event Date: ${body.booking_date} | Guests: ${body.persons}`);
        console.log(`   Target: ${village_id ? 'Village Stay' : 'Experience'}`);
        console.log(`   Payment Status: SUCCESS (Simulated via QR)`);
        console.log(`======================================================\n`);

        return NextResponse.json({ message: "Booking created successfully", id: result.lastInsertRowid }, { status: 201 });
    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const reason = searchParams.get('reason');

        if (!id) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getDb();

        // First, check if the booking exists and belongs to the user (unless they are admin)
        const checkStmt = db.prepare('SELECT user_id, status FROM bookings WHERE id = ?');
        const booking = checkStmt.get(id);

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.user_id !== user.id && user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized to delete this booking' }, { status: 403 });
        }

        // Only allow deleting confirmed bookings if not admin
        if (booking.status !== 'confirmed' && user.role !== 'admin') {
            return NextResponse.json({ error: 'Only confirmed bookings can be cancelled by users' }, { status: 403 });
        }

        const deleteStmt = db.prepare('DELETE FROM bookings WHERE id = ?');
        deleteStmt.run(id);

        console.log(`\n=== BOOKING CANCELLED ===`);
        console.log(`   Booking ID: #${id}`);
        console.log(`   Cancelled By: User ${user.id} (${user.name})`);
        console.log(`   Reason: ${reason || 'Not provided'}`);
        console.log(`=========================\n`);

        return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error("Booking Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
