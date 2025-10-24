'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Package, DollarSign, ShoppingCart, TrendingUp, Plus, Edit, Trash2, X } from 'lucide-react'

const AdminDashboard = () => {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('overview')
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        pendingPayments: 0,
        paidOrders: 0
    })
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showProductModal, setShowProductModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        stock: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            // Fetch orders
            const ordersRes = await fetch('/api/orders')
            const ordersData = await ordersRes.json()
            setOrders(ordersData)

            // Fetch products
            const productsRes = await fetch('/api/products')
            const productsData = await productsRes.json()
            setProducts(productsData)

            // Calculate stats
            calculateStats(ordersData)
            generateChartData(ordersData)
        } catch (err) {
            console.error('Error fetching data:', err)
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (ordersData) => {
        const totalRevenue = ordersData
            .filter(o => o.status === 'paid' || o.status === 'PAID' || o.status === 'lunas')
            .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0)

        const totalOrders = ordersData.length
        const pendingPayments = ordersData.filter(o =>
            o.status === 'pending' || o.status === 'PENDING' || o.status === 'waiting payment'
        ).length
        const paidOrders = ordersData.filter(o =>
            o.status === 'paid' || o.status === 'PAID' || o.status === 'lunas'
        ).length

        setStats({ totalRevenue, totalOrders, pendingPayments, paidOrders })
    }

    const generateChartData = (ordersData) => {
        const dailyData = {}
        ordersData.forEach(order => {
            if (order.status === 'paid' || order.status === 'PAID' || order.status === 'lunas') {
                const date = new Date(order.createdAt || order.date).toLocaleDateString('id-ID')
                if (!dailyData[date]) {
                    dailyData[date] = { date, revenue: 0, orders: 0 }
                }
                dailyData[date].revenue += order.totalAmount || order.total || 0
                dailyData[date].orders += 1
            }
        })
        setChartData(Object.values(dailyData).slice(-7))
    }

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' })
            if (res.ok) {
                router.push('/login')
            }
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    const handleProductSubmit = async (e) => {
        e.preventDefault()
        try {
            const method = editingProduct ? 'PUT' : 'POST'
            const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...productForm,
                    price: parseFloat(productForm.price),
                    stock: parseInt(productForm.stock)
                })
            })

            if (res.ok) {
                setShowProductModal(false)
                setEditingProduct(null)
                setProductForm({ name: '', price: '', description: '', image: '', stock: '' })
                fetchData()
            }
        } catch (err) {
            console.error('Error saving product:', err)
        }
    }

    const handleDeleteProduct = async (id) => {
        if (!confirm('Yakin ingin menghapus produk ini?')) return

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchData()
            }
        } catch (err) {
            console.error('Error deleting product:', err)
        }
    }

    const openEditModal = (product) => {
        setEditingProduct(product)
        setProductForm({
            name: product.name,
            price: product.price.toString(),
            description: product.description || '',
            image: product.image || '',
            stock: product.stock?.toString() || '0'
        })
        setShowProductModal(true)
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const getStatusBadge = (status) => {
        const normalizedStatus = status?.toLowerCase()
        if (normalizedStatus === 'paid' || normalizedStatus === 'lunas') {
            return <span className="badge badge-success">Lunas</span>
        }
        return <span className="badge badge-warning">Waiting Payment</span>
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* NAVBAR */}
            <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">ZZZ Store Admin</a>
                </div>
                <div className="flex-none">
                    <button onClick={handleLogout} className="btn btn-ghost">
                        Logout
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="tabs tabs-boxed w-full max-w-7xl mx-auto mt-6 bg-base-100 p-2">
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

            <div className="max-w-7xl mx-auto p-6">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="card bg-base-100 shadow-md">
                                <div className="card-body">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-60">Total Revenue</p>
                                            <h3 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</h3>
                                        </div>
                                        <DollarSign className="w-10 h-10 text-success" />
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-md">
                                <div className="card-body">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-60">Total Orders</p>
                                            <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                                        </div>
                                        <ShoppingCart className="w-10 h-10 text-info" />
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-md">
                                <div className="card-body">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-60">Paid Orders</p>
                                            <h3 className="text-2xl font-bold">{stats.paidOrders}</h3>
                                        </div>
                                        <TrendingUp className="w-10 h-10 text-success" />
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-md">
                                <div className="card-body">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-60">Pending Payments</p>
                                            <h3 className="text-2xl font-bold">{stats.pendingPayments}</h3>
                                        </div>
                                        <Package className="w-10 h-10 text-warning" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="card bg-base-100 shadow-md">
                                <div className="card-body">
                                    <h3 className="card-title">Revenue (7 Hari Terakhir)</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-md">
                                <div className="card-body">
                                    <h3 className="card-title">Orders (7 Hari Terakhir)</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="orders" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div className="card bg-base-100 shadow-md">
                        <div className="card-body">
                            <h2 className="card-title mb-4">Daftar Pembelian</h2>
                            <div className="overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Produk</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order._id}>
                                                <td className="font-mono text-sm">{order._id?.slice(-8)}</td>
                                                <td>{order.customerName || order.email || 'N/A'}</td>
                                                <td>
                                                    {order.items?.map((item, i) => (
                                                        <div key={i} className="text-sm">
                                                            {item.name || item.productName} x{item.quantity}
                                                        </div>
                                                    )) || 'N/A'}
                                                </td>
                                                <td className="font-semibold">{formatCurrency(order.totalAmount || order.total || 0)}</td>
                                                <td>{getStatusBadge(order.status)}</td>
                                                <td className="text-sm">
                                                    {new Date(order.createdAt || order.date).toLocaleDateString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Kelola Produk</h2>
                            <button
                                className="btn btn-primary gap-2"
                                onClick={() => {
                                    setEditingProduct(null)
                                    setProductForm({ name: '', price: '', description: '', image: '', stock: '' })
                                    setShowProductModal(true)
                                }}
                            >
                                <Plus className="w-5 h-5" />
                                Tambah Produk
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map((product) => (
                                <div key={product._id} className="card bg-base-100 shadow-md">
                                    {product.image && (
                                        <figure className="h-48 bg-base-200">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        </figure>
                                    )}
                                    <div className="card-body">
                                        <h3 className="card-title">{product.name}</h3>
                                        <p className="text-sm opacity-70">{product.description}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                                            <span className="badge">Stock: {product.stock || 0}</span>
                                        </div>
                                        <div className="card-actions justify-end mt-4">
                                            <button
                                                className="btn btn-sm btn-ghost gap-2"
                                                onClick={() => openEditModal(product)}
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-ghost text-error gap-2"
                                                onClick={() => handleDeleteProduct(product._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* PRODUCT MODAL */}
            {showProductModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">
                                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                            </h3>
                            <button
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={() => setShowProductModal(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleProductSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Nama Produk</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Harga</span>
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered"
                                    value={productForm.price}
                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Deskripsi</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered"
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">URL Gambar</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={productForm.image}
                                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Stock</span>
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered"
                                    value={productForm.stock}
                                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-action">
                                <button type="button" className="btn" onClick={() => setShowProductModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard