import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
        return NextResponse.json({ user: null });
    }

    try {
        const user = JSON.parse(session.value);
        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ user: null });
    }
}
