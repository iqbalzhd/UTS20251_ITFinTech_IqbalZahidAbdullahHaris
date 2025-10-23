import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // Public routes yang tidak perlu autentikasi
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/verify-otp'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Jika tidak ada token dan bukan public route
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Jika ada token, verify dan check role
    if (token) {
        const payload = verifyToken(token);

        // Token tidak valid
        if (!payload) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
        }

        // Redirect ke halaman sesuai role jika mengakses login/signup
        if (isPublicRoute && pathname !== '/verify-otp') {
            if (payload.role === 'admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Protect admin routes
        if (pathname.startsWith('/admin') && payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};