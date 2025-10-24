// app/api/order/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getData } from "../../../../lib/mongo";
import { sendOrderNotification } from "../../../../lib/whatsapp-notification";
import { verifyToken } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
    try {
        // Ambil token dari cookie atau header
        const token = req.cookies.get('auth_token')?.value ||
            req.headers.get('authorization')?.replace('Bearer ', '');

        console.log("Token received:", token ? "exists" : "missing");

        if (!token) {
            return NextResponse.json({
                error: "Unauthorized - Please login first",
                code: "NO_TOKEN"
            }, { status: 401 });
        }

        // Verify token untuk ambil user info
        const decoded = verifyToken(token);
        console.log("Token decoded:", decoded ? "success" : "failed");

        if (!decoded) {
            return NextResponse.json({
                error: "Invalid or expired token. Please login again.",
                code: "INVALID_TOKEN"
            }, { status: 401 });
        }

        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        const body = await req.json();
        const { items, subtotal, tax, total } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Cart kosong" }, { status: 400 });
        }

        // Ambil data user dari database untuk mendapatkan nomor WhatsApp
        const users = await getData("users");
        const user = await users.findOne({ email: decoded.email });

        console.log("User found:", user ? user.email : "not found");

        if (!user) {
            return NextResponse.json({
                error: "User not found in database",
                code: "USER_NOT_FOUND"
            }, { status: 404 });
        }

        // Generate external_id (unik)
        const external_id = typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `order-${Date.now()}`;

        // Buat Invoice di Xendit
        const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Basic " + Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString("base64"),
            },
            body: JSON.stringify({
                external_id,
                amount: total,
                description: "Pembayaran order " + external_id,
                success_redirect_url: `${baseUrl}/success`,
                failure_redirect_url: `${baseUrl}/failed`,
                customer: {
                    email: decoded.email,
                    ...(user.phone && { mobile_number: user.phone })
                }
            }),
        });

        const xenditData = await xenditRes.json();

        if (!xenditRes.ok) {
            console.error("Xendit error:", xenditData);
            return NextResponse.json(
                { error: "Gagal membuat invoice di Xendit", details: xenditData },
                { status: 502 }
            );
        }

        // Simpan order ke DB
        const orders = await getData("orders");
        const now = new Date();
        const orderDoc = {
            external_id,
            invoice_id: xenditData.id,
            invoice_url: xenditData.invoice_url,
            user_id: decoded.userId,
            user_email: decoded.email,
            user_phone: user.phone || null,
            items,
            subtotal,
            tax,
            total,
            status: "PENDING",
            createdAt: now,
            updatedAt: now,
            whatsapp_notification_sent: false,
        };

        await orders.insertOne(orderDoc);
        console.log(`Order created: ${external_id}`);

        // Kirim notifikasi WhatsApp (jika user punya nomor WA)
        let whatsappSent = false;
        if (user.phone) {
            console.log(`Sending order notification to: ${user.phone}`);

            whatsappSent = await sendOrderNotification({
                phone: user.phone,
                orderId: external_id,
                items,
                subtotal,
                tax,
                total,
                invoiceUrl: xenditData.invoice_url,
            });

            if (whatsappSent) {
                console.log(`✅ Order notification sent successfully to ${user.phone}`);

                // Update flag notifikasi terkirim
                await orders.updateOne(
                    { external_id },
                    {
                        $set: {
                            whatsapp_notification_sent: true,
                            whatsapp_notification_sent_at: now
                        }
                    }
                );
            } else {
                console.warn(`⚠️ Failed to send order notification to ${user.phone}`);
            }
        } else {
            console.warn(`⚠️ User ${decoded.email} has no phone number registered`);
        }

        // Kembalikan invoice_url ke frontend
        return NextResponse.json({
            success: true,
            invoice_url: xenditData.invoice_url,
            order: {
                external_id,
                whatsapp_sent: whatsappSent,
                has_phone: !!user.phone
            },
        });

    } catch (err) {
        console.error("Order creation error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}