import { NextResponse } from 'next/server';
import { getDb } from '../../../../db';

export async function GET() {
    try {
        const db = getDb();
        const creators = db.prepare("SELECT count(*) as count FROM users WHERE role = 'creator'").get();
        const tourists = db.prepare("SELECT count(*) as count FROM users WHERE role = 'tourist'").get();
        const transactions = db.prepare("SELECT count(*) as count FROM bookings").get();
        const activities = db.prepare("SELECT count(*) as count FROM experiences").get();

        return NextResponse.json({
            creators: creators.count,
            tourists: tourists.count,
            transactions: transactions.count,
            activities: activities.count
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
