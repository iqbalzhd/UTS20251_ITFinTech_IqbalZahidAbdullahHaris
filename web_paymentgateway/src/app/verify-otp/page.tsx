'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyOTPPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || 'signup';

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    useEffect(() => {
        if (!email) {
            router.push('/login');
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, type }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verifikasi gagal');
            }

            if (type === 'signup') {
                // Redirect berdasarkan role
                router.push(data.redirectTo);
                router.refresh();
            } else if (type === 'forgot_password') {
                // Redirect ke reset password
                router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setResendSuccess(false);
        setResendLoading(true);

        try {
            const endpoint = type === 'signup' ? '/api/auth/resend-otp' : '/api/auth/forgot-password';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengirim ulang OTP');
            }

            setResendSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verifikasi OTP
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Kode OTP telah dikirim ke WhatsApp Anda
                    </p>
                    <p className="mt-1 text-center text-sm font-medium text-gray-900">
                        {email}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {resendSuccess && (
                        <div className="rounded-md bg-green-50 p-4">
                            <p className="text-sm text-green-800">OTP berhasil dikirim ulang</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                            Kode OTP
                        </label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest sm:text-sm"
                            placeholder="000000"
                        />
                        <p className="mt-1 text-xs text-gray-500 text-center">
                            Masukkan 6 digit kode OTP
                        </p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Memverifikasi...' : 'Verifikasi'}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? 'Mengirim...' : 'Kirim ulang OTP'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-600 hover:text-gray-500"
                        >
                            Kembali ke login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}