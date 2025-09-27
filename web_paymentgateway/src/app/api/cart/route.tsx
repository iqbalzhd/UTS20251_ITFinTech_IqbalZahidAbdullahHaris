import { NextResponse } from "next/server";
import { getData } from "../../../lib/mongo";
import { IProduct } from "../../../lib/types";
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

export async function GET() {
    try {
        const cartCollection = await getData<CartItem>("cart");
        const productCollection = await getData<IProduct>("product");

        const cartItems = await cartCollection.find({}).toArray();

        // Ambil product info dari productCollection
        const products = await productCollection
            .find({ id: { $in: cartItems.map((c) => c.productId) } })
            .toArray();

        // Gabungkan quantity dari cart
        const result = cartItems.map((c) => {
            const product = products.find((p) => p.id === c.productId);
            return product
                ? {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: c.quantity,
                    imgurl: product.imgurl
                }
                : null;
        }).filter(Boolean); // hilangkan null

        return NextResponse.json(result);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
    }
}