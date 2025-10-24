// components/admin/ProductsSection.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { IProduct } from '@/lib/types'

const ProductsSection = () => {
    const [products, setProducts] = useState<IProduct[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        desc: '',
        price: 0,
        imgurl: '',
        quantity: 0
    })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products')
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (err) {
            console.error('Failed to fetch products:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenModal = (product?: IProduct) => {
        if (product) {
            setEditingProduct(product)
            setFormData({
                name: product.name,
                desc: product.desc,
                price: product.price,
                imgurl: product.imgurl,
                quantity: product.quantity
            })
        } else {
            setEditingProduct(null)
            setFormData({
                name: '',
                desc: '',
                price: 0,
                imgurl: '',
                quantity: 0
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingProduct(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingProduct
                ? `/api/admin/products/${editingProduct.id}`
                : '/api/admin/products'

            const method = editingProduct ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                await fetchProducts()
                handleCloseModal()
            } else {
                alert('Failed to save product')
            }
        } catch (err) {
            console.error('Failed to save product:', err)
            alert('Failed to save product')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                await fetchProducts()
            } else {
                alert('Failed to delete product')
            }
        } catch (err) {
            console.error('Failed to delete product:', err)
            alert('Failed to delete product')
        }
    }

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
        <div className="space-y-4">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Products</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => handleOpenModal()}
                >
                    Add New Product
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="card bg-base-100 shadow-xl">
                        <figure className="h-48">
                            <img
                                src={product.imgurl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </figure>
                        <div className="card-body">
                            <h3 className="card-title text-lg">{product.name}</h3>
                            <p className="text-sm opacity-70 line-clamp-2">{product.desc}</p>
                            <div className="mt-2">
                                <p className="text-xl font-bold">{formatRupiah(product.price)}</p>
                                <p className="text-sm opacity-70">Stock: {product.quantity}</p>
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <button
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => handleOpenModal(product)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-error"
                                    onClick={() => handleDelete(product.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Add/Edit Product */}
            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <h3 className="font-bold text-lg mb-4">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Product Name</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Description</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered h-24"
                                    value={formData.desc}
                                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Price (Rp)</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        required
                                        min="0"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Quantity</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Image URL</span>
                                </label>
                                <input
                                    type="url"
                                    className="input input-bordered"
                                    value={formData.imgurl}
                                    onChange={(e) => setFormData({ ...formData, imgurl: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    {editingProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={handleCloseModal}></div>
                </div>
            )}
        </div>
    )
}

export default ProductsSection