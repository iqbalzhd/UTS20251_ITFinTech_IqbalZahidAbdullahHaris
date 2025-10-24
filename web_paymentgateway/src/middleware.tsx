// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, JWTVerifyResult } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '';
const encoder = new TextEncoder();

// Fungsi verifikasi JWT yang aman untuk Edge Runtime
async function verifyToken(token: string) {
    try {
        const { payload }: JWTVerifyResult = await jwtVerify(token, encoder.encode(JWT_SECRET));
        return payload; // berisi userId, email, role, dll
    } catch (err) {
        console.error('Token verification failed:', err);
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    console.log('=== MIDDLEWARE START ===');
    console.log('Path:', pathname);
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

    // Daftar protected routes (hanya admin dashboard yang perlu login)
    const isAdminRoute = pathname.startsWith('/admin');

    console.log('Is admin route:', isAdminRoute);

    // Jika akses admin route tanpa token
    if (isAdminRoute && !token) {
        console.log('❌ No token on admin route -> redirect to /login');
        console.log('=== MIDDLEWARE END ===\n');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Jika ada token, verify (hanya untuk admin routes)
    if (token && isAdminRoute) {
        console.log('🔍 Verifying token...');
        const payload = await verifyToken(token);

        if (!payload) {
            console.log('❌ Invalid token -> redirect to /login and delete cookie');
            console.log('=== MIDDLEWARE END ===\n');
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
        }

        console.log('✅ Token valid');
        console.log('User role:', payload.role);
        console.log('User email:', payload.email);

        // Proteksi route admin - hanya admin yang bisa akses
        if (payload.role !== 'admin') {
            console.log('❌ Non-admin trying to access admin route -> redirect to /');
            console.log('=== MIDDLEWARE END ===\n');
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Redirect user yang sudah login sebagai admin jika akses login/signup
    if (token && (pathname === '/login' || pathname === '/signup')) {
        const payload = await verifyToken(token);
        if (payload && payload.role === 'admin') {
            console.log('🔄 Admin already logged in, redirect to /admin/dashboard');
            console.log('=== MIDDLEWARE END ===\n');
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    console.log('✅ Middleware passed -> Continue to page');
    console.log('=== MIDDLEWARE END ===\n');
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};