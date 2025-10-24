// app/admin/dashboard/page.tsx
'use client'

import React, { useState } from 'react'
import NavBar from '@/app/components/navBar'
import OverviewSection from '@/app/components/admin/overviewSection'
import OrdersSection from '@/app/components/admin/orderSection'
import ProductsSection from '@/app/components/admin/productSection'

type TabType = 'overview' | 'orders' | 'products'

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview')

    return (
        <div className="min-h-screen bg-base-200">
            <NavBar />

            <div className="container mx-auto px-4 py-6">
                {/* Tabs Navigation */}
                <div className="tabs tabs-boxed bg-base-100 mb-6 w-fit">
                    <a
                        className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </a>
                    <a
                        className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </a>
                    <a
                        className={`tab ${activeTab === 'products' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </a>
                </div>

                {/* Content Sections */}
                {activeTab === 'overview' && <OverviewSection />}
                {activeTab === 'orders' && <OrdersSection />}
                {activeTab === 'products' && <ProductsSection />}
            </div>
        </div>
    )
}

export default AdminDashboard