// app/api/auth/verify/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '';
const encoder = new TextEncoder();

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        await jwtVerify(token, encoder.encode(JWT_SECRET));
        return NextResponse.json({ authenticated: true }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}