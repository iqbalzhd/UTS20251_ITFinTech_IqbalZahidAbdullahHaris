'use client'

import React from 'react'
import { useRouter } from 'next/navigation'


const AdminDashboard = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                router.push('/login');
            }
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }

    return (
        <div>
            {/* START NAVBAR */}
            <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">ZZZ Store</a>
                </div>

                <div className="flex-none">
                    <button onClick={handleLogout} className="btn btn-ghost text-md">
                        Logout
                    </button>
                </div>
            </div>
            {/* END NAVBAR */}

            {/* ISI PAGE */}
            <div>
                <h1>ini admin dashboard</h1>

            </div>
            {/* END PAGE */}
        </div>


    )
}

export default AdminDashboard