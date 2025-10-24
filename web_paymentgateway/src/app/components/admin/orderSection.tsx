// components/admin/OrdersSection.tsx
'use client'

import React, { useEffect, useState } from 'react'

interface OrderItem {
    productId: number
    name: string
    qty: number
    price: number
}

interface Order {
    _id: string
    external_id: string
    invoice_id: string
    invoice_url: string
    items: OrderItem[]
    subtotal: number
    tax: number
    total: number
    status: string
    createdAt: string
    updatedAt: string
}

const OrdersSection = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<string>('ALL')

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/admin/orders')
                if (res.ok) {
                    const data = await res.json()
                    setOrders(data)
                }
            } catch (err) {
                console.error('Failed to fetch orders:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, string> = {
            'PAID': 'badge-success',
            'PENDING': 'badge-warning',
            'EXPIRED': 'badge-error',
            'FAILED': 'badge-error'
        }
        return `badge ${statusMap[status] || 'badge-ghost'}`
    }

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(order => order.status === filter)

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="tabs tabs-boxed bg-base-100 w-fit">
                <a
                    className={`tab ${filter === 'ALL' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('ALL')}
                >
                    All
                </a>
                <a
                    className={`tab ${filter === 'PAID' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('PAID')}
                >
                    Paid
                </a>
                <a
                    className={`tab ${filter === 'PENDING' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('PENDING')}
                >
                    Pending
                </a>
                <a
                    className={`tab ${filter === 'EXPIRED' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('EXPIRED')}
                >
                    Expired
                </a>
            </div>

            {/* Orders Table */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Orders List</h2>

                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-8 opacity-70">
                            No orders found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id}>
                                            <td>
                                                <div className="font-mono text-xs">
                                                    {order.external_id.slice(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="text-sm">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td>
                                                <div className="text-sm">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx}>
                                                            {item.name} x{item.qty}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="font-semibold">
                                                {formatRupiah(order.total)}
                                            </td>
                                            <td>
                                                <span className={getStatusBadge(order.status)}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <a
                                                    href={order.invoice_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-ghost btn-xs"
                                                >
                                                    View Invoice
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OrdersSection