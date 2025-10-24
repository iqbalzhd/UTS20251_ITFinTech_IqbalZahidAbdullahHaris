import { NextRequest, NextResponse } from "next/server";
import { getData } from "../../../../lib/mongo";

export async function POST(req: NextRequest) {
    try {
        // Perbaikan: gunakan req (NextRequest) bukan request
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        const body = await req.json();
        const { items, subtotal, tax, total } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Cart kosong" }, { status: 400 });
        }

        // Generate external_id (unik)
        const external_id = typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `order-${Date.now()}`;

        // Buat Invoice
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
                failure_redirect_url: `${baseUrl}/failed`
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
            items,
            subtotal,
            tax,
            total,
            status: "PENDING",
            createdAt: now,
            updatedAt: now,
        };

        await orders.insertOne(orderDoc);

        // Kembalikan invoice_url ke frontend supaya bisa redirect
        return NextResponse.json({
            success: true,
            invoice_url: xenditData.invoice_url,
            order: { external_id }
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}