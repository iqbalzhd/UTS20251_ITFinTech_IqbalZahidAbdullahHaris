import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface JWTPayload {
    userId: string;
    email: string;
    role: 'user' | 'admin';
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d',
    });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error('JWT verification failed:', err.message);
        } else {
            console.error('JWT verification failed with unknown error');
        }
        return null;
    }
}
// Generate OTP
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Fonnte WhatsApp
export async function sendWhatsAppOTP(
    phone: string,
    otp: string
): Promise<boolean> {
    try {
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': process.env.FONNTE_API_KEY || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target: phone,
                message: `Kode OTP Anda: ${otp}\n\nKode ini berlaku selama 5 menit.\nJangan bagikan kode ini kepada siapapun.`,
                countryCode: '62', // Indonesia
            }),
        });

        const data = await response.json();
        return data.status === true;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return false;
    }
}