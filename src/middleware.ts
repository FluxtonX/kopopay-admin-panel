import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('admin_token');
    const { pathname } = request.nextUrl;

    // Public routes that dont require auth
    if (pathname === '/login') {
        if (token) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Protect all other routes
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Protected paths
    matcher: [
        '/',
        '/support/:path*',
        '/users/:path*',
        '/analytics/:path*',
        '/security/:path*',
        '/settings/:path*',
    ],
};
