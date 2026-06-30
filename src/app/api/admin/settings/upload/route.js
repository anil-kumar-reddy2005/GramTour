import { NextResponse } from 'next/server';
import { getUser } from '../../../../actions/authActions';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getDb } from '../../../../../db';

export async function POST(request) {
    try {
        // Secure it to admin only
        const user = await getUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file received.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename and create a path in the public directory
        const filename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, filename);

        // Ensure directory exists (we'll just try to write, if it fails because missing dir we can catch or pre-create)
        // Usually Next.js public/ is there. We might need public/uploads/
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${filename}`;

        // Automatically save to settings database
        const db = getDb();
        const stmt = db.prepare(`
            INSERT INTO settings (key, value) 
            VALUES ('payment_qr_code_url', ?) 
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `);
        stmt.run(fileUrl);

        return NextResponse.json({ success: true, qrCodeUrl: fileUrl });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
