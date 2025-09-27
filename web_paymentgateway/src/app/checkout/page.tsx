'use client'

import React from 'react'
import ProductItem from '../components/productItem' // pastikan path sesuai

const CheckoutPage = () => {
    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Checkout</h2>

            {/* Daftar Produk */}
            <div className="card bg-base-100 shadow-md mb-4">
                <div className="card-body">
                    <ProductItem name="Sepatu Keren" price={200000} />
                    <ProductItem name="Tas Kulit" price={139000} />
                </div>
            </div>

            {/* Ringkasan */}
            <div className="bg-base-100 shadow-md rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp 339.000</span>
                </div>
                <div className="flex justify-between">
                    <span>Pajak</span>
                    <span>Rp 12.000</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>Rp 351.000</span>
                </div>
                <button className="btn btn-primary w-full mt-4">
                    Continue to Payment →
                </button>
            </div>
        </div>
    )
}

export default CheckoutPage
