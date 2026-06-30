import { getDb } from '../../../../db';
import { NextResponse } from 'next/server';
import { getUser } from '../../../actions/authActions';

export async function GET(request) {
    try {
        const db = getDb();
        const stmt = db.prepare(`SELECT value FROM settings WHERE key = 'payment_qr_code_url'`);
        const result = stmt.get();
        return NextResponse.json({ qrCodeUrl: result ? result.value : null });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        // Secure it to admin only
        const user = await getUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { qrCodeUrl } = body;

        const db = getDb();

        // Upsert into settings table
        const stmt = db.prepare(`
            INSERT INTO settings (key, value) 
            VALUES ('payment_qr_code_url', ?) 
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `);

        stmt.run(qrCodeUrl);

        return NextResponse.json({ success: true, qrCodeUrl });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
