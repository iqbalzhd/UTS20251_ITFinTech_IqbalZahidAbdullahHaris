import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log("Webhook dari Xendit:", body);

        // Contoh: update order di database
        if (body.status === "PAID") {
            // update DB: order paid
            console.log(`Invoice ${body.id} sudah dibayar ✅`);
        }

        // Wajib return 200 agar Xendit tahu webhook diterima
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
