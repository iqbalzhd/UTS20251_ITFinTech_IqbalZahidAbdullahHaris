import React from 'react'
import Link from 'next/link'

const Success = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#cce0f5] p-4">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-sm w-full text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <svg
                            className="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-lg font-medium text-gray-700 mb-2">Pembayaran berhasil!</h2>
                <hr className="my-4 border-gray-200" />
                <Link href="/" className="btn btn-primary w-full">
                    Kembali ke Home
                </Link>
            </div>
        </div>
    )
}

export default Success