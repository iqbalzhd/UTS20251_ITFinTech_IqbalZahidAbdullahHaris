"use client";
import React, { useState } from "react";
import ProductCard from "./productCard";
import { IProduct } from "../../lib/types";

interface ProductGridProps {
    products: IProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    const [cart, setCart] = useState<{ [id: number]: number }>({});

    const handleAdd = async (id: number) => {
        const qty = (cart[id] || 0) + 1;
        setCart((prev) => ({ ...prev, [id]: qty }));

        await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id, quantity: qty }),
        });
    };

    const handleRemove = async (id: number) => {
        const qty = Math.max((cart[id] || 0) - 1, 0);
        setCart((prev) => ({ ...prev, [id]: qty }));

        await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id, quantity: qty }),
        });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-8 mx-auto ">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.name}
                    price={product.price}
                    image={product.imgurl}
                    description={product.desc}
                    onAdd={() => handleAdd(product.id)}
                    onRemove={() => handleRemove(product.id)}
                />
            ))}
        </div>
    );
}
