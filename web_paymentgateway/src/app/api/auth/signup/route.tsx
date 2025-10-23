import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongo';
import { hashPassword, generateOTP, sendWhatsAppOTP } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, phone, role } = body;

        // Validasi input
        if (!email || !password || !name || !phone || !role) {
            return NextResponse.json(
                { error: 'Semua field harus diisi' },
                { status: 400 }
            );
        }

        // Validasi role
        if (role !== 'user' && role !== 'admin') {
            return NextResponse.json(
                { error: 'Role tidak valid' },
                { status: 400 }
            );
        }

        // Validasi format phone (harus dimulai dengan 08 atau 628)
        const phoneRegex = /^(08|628)[0-9]{8,11}$/;
        if (!phoneRegex.test(phone)) {
            return NextResponse.json(
                { error: 'Format nomor WhatsApp tidak valid (contoh: 08123456789)' },
                { status: 400 }
            );
        }

        const db = await getDB();
        const usersCollection = db.collection('users');
        const otpCollection = db.collection('otp_codes');

        // Cek apakah email sudah terdaftar
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email sudah terdaftar' },
                { status: 409 }
            );
        }

        // Cek apakah phone sudah terdaftar
        const existingPhone = await usersCollection.findOne({ phone });
        if (existingPhone) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp sudah terdaftar' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

        // Simpan data user sementara (belum verified)
        const tempUser = {
            email,
            password: hashedPassword,
            name,
            phone,
            role,
            isVerified: false,
            createdAt: new Date(),
        };

        await usersCollection.insertOne(tempUser);

        // Simpan OTP
        await otpCollection.insertOne({
            email,
            phone,
            otp,
            type: 'signup',
            expiresAt: otpExpiry,
            createdAt: new Date(),
        });

        // Kirim OTP via WhatsApp
        const formatPhone = phone.startsWith('08') ? phone.replace('08', '628') : phone;
        const otpSent = await sendWhatsAppOTP(formatPhone, otp);

        if (!otpSent) {
            // Hapus user dan OTP jika gagal kirim
            await usersCollection.deleteOne({ email });
            await otpCollection.deleteOne({ email });

            return NextResponse.json(
                { error: 'Gagal mengirim OTP, silakan coba lagi' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'OTP telah dikirim ke WhatsApp Anda',
            email,
        });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}