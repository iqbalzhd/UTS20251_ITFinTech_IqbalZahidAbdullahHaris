import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongo';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, otp } = body;

        if (!email || !password || !otp) {
            return NextResponse.json(
                { error: 'Semua field harus diisi' },
                { status: 400 }
            );
        }

        const db = await getDB();
        const usersCollection = db.collection('users');
        const otpCollection = db.collection('otp_codes');

        // Verifikasi OTP
        const otpRecord = await otpCollection.findOne({
            email,
            otp,
            type: 'forgot_password',
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            return NextResponse.json(
                { error: 'OTP tidak valid atau sudah kadaluarsa' },
                { status: 400 }
            );
        }

        // Hash password baru
        const hashedPassword = await hashPassword(password);

        // Update password
        const result = await usersCollection.updateOne(
            { email },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        // Hapus OTP setelah digunakan
        await otpCollection.deleteOne({ _id: otpRecord._id });

        return NextResponse.json({
            success: true,
            message: 'Password berhasil direset',
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}