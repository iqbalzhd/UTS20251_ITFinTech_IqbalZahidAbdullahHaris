// src/app/api/webhook/route.ts
import { NextResponse } from "next/server";
import { getData } from "../../../lib/mongo";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Webhook Xendit:", body);

        const status = body.status || body.data?.status;
        const invoiceId = body.id || body.data?.id;
        const externalId = body.external_id || body.data?.external_id;

        if (!status) {
            return NextResponse.json({ ok: false }, { status: 400 });
        }

        const orders = await getData("orders");
        const carts = await getData("cart");
        const products = await getData("products");

        // filter order
        const filter = invoiceId
            ? { invoice_id: invoiceId }
            : externalId
                ? { external_id: externalId }
                : null;

        if (!filter) {
            console.warn("Webhook tanpa identifier");
            return NextResponse.json({ ok: false }, { status: 400 });
        }

        const newStatus =
            status === "PAID"
                ? "PAID"
                : status === "EXPIRED"
                    ? "FAILED"
                    : status.toUpperCase();

        // ambil order terkait
        const order = await orders.findOne(filter);
        if (!order) {
            return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
        }

        // update status order
        await orders.updateOne(filter, {
            $set: { status: newStatus, updatedAt: new Date() },
        });

        // kurangi stok + kosongkan cart
        if (newStatus === "PAID") {
            if (order.items && Array.isArray(order.items)) {
                for (const item of order.items) {
                    console.log("before qty", item.qty)
                    await products.updateOne(
                        { _id: item.productId },
                        { $inc: { stock: -item.qty } }
                    );
                    console.log("after qty", item.qty)
                }
            }
            // kosongkan cart
            await carts.deleteMany({});
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Webhook error", err);
        return NextResponse.json({ error: "Invalid webhook" }, { status: 500 });
    }
}
