import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongo';
import { generateOTP, sendWhatsAppOTP } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email harus diisi' },
                { status: 400 }
            );
        }

        const db = await getDB();
        const usersCollection = db.collection('users');
        const otpCollection = db.collection('otp_codes');

        // Cari user berdasarkan email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { error: 'Email tidak terdaftar' },
                { status: 404 }
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

        // Hapus OTP lama jika ada
        await otpCollection.deleteMany({ email, type: 'forgot_password' });

        // Simpan OTP baru
        await otpCollection.insertOne({
            email,
            phone: user.phone,
            otp,
            type: 'forgot_password',
            expiresAt: otpExpiry,
            createdAt: new Date(),
        });

        // Kirim OTP via WhatsApp
        const formatPhone = user.phone.startsWith('08')
            ? user.phone.replace('08', '628')
            : user.phone;

        const otpSent = await sendWhatsAppOTP(formatPhone, otp);

        if (!otpSent) {
            await otpCollection.deleteOne({ email, type: 'forgot_password' });

            return NextResponse.json(
                { error: 'Gagal mengirim OTP, silakan coba lagi' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'OTP telah dikirim ke WhatsApp Anda',
            email,
            phone: user.phone.replace(/(\d{4})\d{4}(\d{3})/, '$1****$2'), // Mask phone number
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}