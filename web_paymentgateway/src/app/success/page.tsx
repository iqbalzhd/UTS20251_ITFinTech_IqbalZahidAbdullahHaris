import React from 'react'
import Link from 'next/link'

const Success = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
            <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Payment Success</h1>
            <p className="text-lg text-gray-700 mb-6">
                Terima kasih! Pesanan kamu sudah berhasil diproses.
            </p>
            <Link
                href="/"
                className="btn btn-primary"
            >
                Kembali ke Home
            </Link>
        </div>
    )
}

export default Success