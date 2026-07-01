import { NextResponse } from 'next/server';
import { getUser } from '../../../actions/authActions';
import { writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        // Secure it to authenticated users only
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
        }

        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file received.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({ success: true, fileUrl });
    } catch (error) {
        console.error("General Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
