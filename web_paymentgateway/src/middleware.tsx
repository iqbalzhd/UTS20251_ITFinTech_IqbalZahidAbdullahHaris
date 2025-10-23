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

    // Daftar public routes
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/verify-otp'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    console.log('Is public route:', isPublicRoute);

    // Jika tidak ada token dan bukan public route
    if (!token && !isPublicRoute) {
        console.log('❌ No token -> redirect to /login');
        console.log('=== MIDDLEWARE END ===\n');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Jika ada token, verify
    if (token) {
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

        // Redirect user yang sudah login jika akses login/signup
        if ((pathname === '/login' || pathname === '/signup')) {
            const redirectUrl = payload.role === 'admin' ? '/admin/dashboard' : '/';
            console.log('🔄 Already logged in, redirect to', redirectUrl);
            console.log('=== MIDDLEWARE END ===\n');
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

        // Proteksi route admin
        if (pathname.startsWith('/admin') && payload.role !== 'admin') {
            console.log('❌ Non-admin trying to access admin route -> redirect to /');
            console.log('=== MIDDLEWARE END ===\n');
            return NextResponse.redirect(new URL('/', request.url));
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
