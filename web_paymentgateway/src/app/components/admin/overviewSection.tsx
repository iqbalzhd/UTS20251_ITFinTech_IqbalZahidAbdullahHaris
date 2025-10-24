// components/admin/OverviewSection.tsx
'use client'

import React, { useEffect, useState } from 'react'

interface StatsData {
    totalRevenue: number
    totalOrders: number
    paidOrders: number
    pendingPayments: number
}

const OverviewSection = () => {
    const [stats, setStats] = useState<StatsData>({
        totalRevenue: 0,
        totalOrders: 0,
        paidOrders: 0,
        pendingPayments: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats')
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [])

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue Card */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm opacity-70">Total Revenue</p>
                            <h2 className="text-2xl font-bold mt-2">
                                {formatRupiah(stats.totalRevenue)}
                            </h2>
                        </div>
                        <div className="text-cyan-400 text-3xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Orders Card */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm opacity-70">Total Orders</p>
                            <h2 className="text-2xl font-bold mt-2">{stats.totalOrders}</h2>
                        </div>
                        <div className="text-cyan-400 text-3xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Paid Orders Card */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm opacity-70">Paid Orders</p>
                            <h2 className="text-2xl font-bold mt-2">{stats.paidOrders}</h2>
                        </div>
                        <div className="text-green-400 text-3xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Payments Card */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm opacity-70">Pending Payments</p>
                            <h2 className="text-2xl font-bold mt-2">{stats.pendingPayments}</h2>
                        </div>
                        <div className="text-yellow-400 text-3xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverviewSection