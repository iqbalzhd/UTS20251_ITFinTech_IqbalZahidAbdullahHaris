import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongo';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, type } = body;

    if (!email || !otp || !type) {
      return NextResponse.json(
        { error: 'Email, OTP, dan type harus diisi' },
        { status: 400 }
      );
    }

    const db = await getDB();
    const otpCollection = db.collection('otp_codes');
    const usersCollection = db.collection('users');

    // Cari OTP yang valid
    const otpRecord = await otpCollection.findOne({
      email,
      otp,
      type,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'OTP tidak valid atau sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Jika untuk signup, update user menjadi verified
    if (type === 'signup') {
      const user = await usersCollection.findOneAndUpdate(
        { email },
        { $set: { isVerified: true } },
        { returnDocument: 'after' }
      );

      if (!user) {
        return NextResponse.json(
          { error: 'User tidak ditemukan' },
          { status: 404 }
        );
      }

      // Generate token
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Hapus OTP setelah digunakan
      await otpCollection.deleteOne({ _id: otpRecord._id });

      // Set cookie
      const response = NextResponse.json({
        success: true,
        message: 'Verifikasi berhasil',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
        redirectTo: user.role === 'admin' ? '/admin/dashboard' : '/',
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 hari
      });

      return response;
    }

    // Jika untuk forgot password, return success (akan dihandle di client untuk redirect ke reset password)
    if (type === 'forgot_password') {
      return NextResponse.json({
        success: true,
        message: 'OTP valid',
        email,
      });
    }

    return NextResponse.json(
      { error: 'Type tidak valid' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}