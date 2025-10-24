// src/app/api/webhook/route.ts
import { NextResponse } from "next/server";
import { getData } from "../../../lib/mongo";
import { sendPaymentSuccessNotification } from "../../../lib/whatsapp-notification";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📩 Webhook Xendit received:", body);

        // ✅ Verifikasi callback token
        const callbackToken = req.headers.get("x-callback-token");
        if (
            process.env.XENDIT_CALLBACK_TOKEN &&
            callbackToken !== process.env.XENDIT_CALLBACK_TOKEN
        ) {
            console.error("❌ Invalid callback token");
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        // ✅ Ambil status & ID order
        const status = body.status || body.data?.status;
        const invoiceId = body.id || body.data?.id;
        const externalId = body.external_id || body.data?.external_id;

        if (!status) {
            return NextResponse.json({ ok: false, error: "Missing status" }, { status: 400 });
        }

        const orders = await getData("orders");
        const carts = await getData("cart");
        const products = await getData("product");

        // ✅ Tentukan filter untuk order
        const filter = invoiceId
            ? { invoice_id: invoiceId }
            : externalId
                ? { external_id: externalId }
                : null;

        if (!filter) {
            console.warn("⚠️ Webhook tanpa identifier");
            return NextResponse.json({ ok: false, error: "Missing identifier" }, { status: 400 });
        }

        // ✅ Tentukan status baru
        const newStatus =
            status === "PAID"
                ? "PAID"
                : status === "EXPIRED"
                    ? "FAILED"
                    : status.toUpperCase();

        // ✅ Ambil order dari database
        const order = await orders.findOne(filter);
        if (!order) {
            console.error(`❌ Order not found: ${JSON.stringify(filter)}`);
            return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
        }

        // ✅ Update status order
        await orders.updateOne(filter, {
            $set: {
                status: newStatus,
                updatedAt: new Date(),
                paid_at: newStatus === "PAID" ? new Date() : order.paid_at,
            },
        });

        console.log(`📦 Order ${order.external_id} updated to ${newStatus}`);

        // ✅ Jika status PAID: kurangi stok + hapus cart + kirim notifikasi
        if (newStatus === "PAID") {
            console.log(`💰 Processing payment for order: ${order.external_id}`);

            // 🔹 Kurangi stok produk berdasarkan items di order
            if (order.items && Array.isArray(order.items)) {
                for (const item of order.items) {
                    console.log(`🔹 Reducing quantity for product id ${item.productId}, qty: ${item.qty}`);

                    const result = await products.updateOne(
                        { id: item.productId }, // pakai "id" (angka) dari koleksi products
                        { $inc: { quantity: -item.qty } } // kurangi field "quantity"
                    );

                    if (result.matchedCount === 0) {
                        console.warn(`⚠️ Product with id ${item.productId} not found`);
                    } else {
                        console.log(`✅ Quantity reduced for product id ${item.productId}`);
                    }
                }
            }


            // 🔹 Hapus semua data cart di MongoDB
            const deleteResult = await carts.deleteMany({});
            console.log(`🗑️ Cart collection cleared (${deleteResult.deletedCount} items removed)`);

            // 🔹 Kirim notifikasi WhatsApp
            if (order.user_phone) {
                console.log(`📲 Sending payment success notification to: ${order.user_phone}`);

                const whatsappSent = await sendPaymentSuccessNotification(
                    order.user_phone,
                    order.external_id,
                    order.items || [],
                    order.total
                );

                if (whatsappSent) {
                    console.log(`✅ WhatsApp notification sent to ${order.user_phone}`);

                    // Optional: tandai notifikasi terkirim
                    await orders.updateOne(filter, {
                        $set: {
                            whatsapp_notification_sent: true,
                            whatsapp_notification_sent_at: new Date(),
                        },
                    });
                } else {
                    console.warn(`⚠️ Failed to send WhatsApp notification to ${order.user_phone}`);
                }
            } else {
                console.warn(`⚠️ No phone number for order ${order.external_id}`);
            }
        }

        return NextResponse.json({
            success: true,
            status: newStatus,
            external_id: order.external_id,
        });
    } catch (err) {
        console.error("🔥 Webhook processing error:", err);
        return NextResponse.json({ error: "Invalid webhook" }, { status: 500 });
    }
}

// ✅ Endpoint GET untuk testing webhook
export async function GET() {
    return NextResponse.json({
        status: "Webhook endpoint active",
        timestamp: new Date().toISOString(),
    });
}
