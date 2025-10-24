'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NavBar = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Cek status login saat component mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setIsLoggedIn(true);
                    setUserRole(data.user.role);
                } else {
                    setIsLoggedIn(false);
                    setUserRole(null);
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                setIsLoggedIn(false);
                setUserRole(null);
            } finally {
                setIsLoading(false);
            }
        }

        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                setIsLoggedIn(false);
                setUserRole(null);
                router.push('/login');
            }
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }

    const handleLogin = () => {
        router.push('/login');
    }

    return (
        <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
            <div className="flex-1">
                <Link href="/" className="btn btn-ghost text-xl">
                    ZZZ Store
                </Link>
            </div>

            <div className="flex-none gap-2">
                {/* Admin Dashboard Link - hanya tampil jika user adalah admin */}
                {!isLoading && isLoggedIn && userRole === 'admin' && (
                    <Link href="/admin/dashboard" className="btn btn-ghost text-md">
                        Dashboard
                    </Link>
                )}

                {/* Cart Icon */}
                <div className="dropdown dropdown-end">
                    <Link href="/checkout">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <div className="indicator">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13
                       l-2.293 2.293c-.63.63-.184 1.707.707 
                       1.707H17m0 0a2 2 0 100 4 2 2 0 
                       000-4zm-8 2a2 2 0 11-4 0 2 2 
                       0 014 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Login/Logout Button */}
                {!isLoading && (
                    isLoggedIn ? (
                        <button onClick={handleLogout} className="btn btn-ghost text-md">
                            Logout
                        </button>
                    ) : (
                        <button onClick={handleLogin} className="btn btn-ghost text-md">
                            Login
                        </button>
                    )
                )}
            </div>
        </div>
    )
}

export default NavBar;