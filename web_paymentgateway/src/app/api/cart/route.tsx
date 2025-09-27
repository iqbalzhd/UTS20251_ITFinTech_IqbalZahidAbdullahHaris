import { NextResponse } from "next/server";
import { getData } from "../../../lib/mongo";
import { IProduct } from "../../../lib/types";

interface CartItem {
    productId: number;
    quantity: number;
}

const cartCollection = await getData("cart");

// Tambah ke cart atau update quantity
export async function POST(req: Request) {
    try {
        const { productId, quantity }: CartItem = await req.json();

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

// Ambil cart lengkap dengan data produk
export async function GET() {
    try {
        const productCollection = await getData<IProduct>("product");
        const cartItems = await cartCollection.find({}).toArray();

        const products = await productCollection
            .find({ id: { $in: cartItems.map((c) => c.productId) } })
            .toArray();

        const result = cartItems
            .map((c) => {
                const product = products.find((p) => p.id === c.productId);
                return product
                    ? {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: c.quantity,
                        imgurl: product.imgurl,
                    }
                    : null;
            })
            .filter(Boolean);

        return NextResponse.json(result);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
    }
}

// Update quantity
export async function PUT(req: Request) {
    try {
        const { productId, quantity } = await req.json();

        if (!productId) {
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }

        await cartCollection.updateOne(
            { productId },
            { $set: { quantity } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
    }
}

// Hapus item dari cart
export async function DELETE(req: Request) {
    try {
        const { productId } = await req.json();

        if (!productId) {
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }

        await cartCollection.deleteOne({ productId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 });
    }
}
