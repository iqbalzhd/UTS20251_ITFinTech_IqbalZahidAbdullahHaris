import { NextResponse } from "next/server";
import { getData } from "../../../lib/mongo";

interface CartItem {
    productId: number;
    quantity: number;
}

export async function POST(req: Request) {
    try {
        const { productId, quantity }: CartItem = await req.json();
        const cartCollection = await getData("cart");

        const existing = await cartCollection.findOne({ productId });
        if (existing) {
            await cartCollection.updateOne(
                { productId },
                { $set: { quantity } }
            );
        } else {
            await cartCollection.insertOne({ productId, quantity });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
