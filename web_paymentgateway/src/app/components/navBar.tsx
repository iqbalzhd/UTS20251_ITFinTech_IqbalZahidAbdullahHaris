'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const NavBar = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Cek status login saat component mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/verify');
                if (res.ok) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                setIsLoggedIn(false);
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
                <Link href="/">
                    <div className="btn btn-ghost text-xl">ZZZ Store</div>
                </Link>

            </div>

            <div className="flex-none">
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
            </div>


            <div className="flex-none">
                <div className="dropdown dropdown-end">
                    <Link href="/admin/dashboard">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <div className="indicator">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-user-star-icon lucide-user-star"
                                >
                                    <path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
                                    <path d="M8 15H7a4 4 0 0 0-4 4v2" />
                                    <circle cx="10" cy="7" r="4" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>


            <div className="flex-none">
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