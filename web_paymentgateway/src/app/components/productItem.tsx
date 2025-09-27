"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ProductItemProps {
    id: number;
    name: string;
    price: number;
    imgurl: string;
    quantity: number; // initial dari DB
    onAdd: () => void;
    onRemove: () => void;
}

const ProductItem: React.FC<ProductItemProps> = ({
    id,
    name,
    price,
    imgurl,
    quantity: initialQty,
    onAdd,
    onRemove,
}) => {
    const [quantity, setQuantity] = useState(initialQty);

    // kalau parent update quantity (misalnya sync dari DB), sinkronkan
    useEffect(() => {
        setQuantity(initialQty);
    }, [initialQty]);

    const increment = () => {
        setQuantity((q) => q + 1);
        onAdd();
    };

    const decrement = () => {
        if (quantity > 1) {
            setQuantity((q) => q - 1);
            onRemove();
        } else {
            // kalau 1 → klik minus = hapus item
            setQuantity(0);
            onRemove();
        }
    };

    return (
        <div className="flex items-center justify-between border-b py-4">
            {/* Kiri: Gambar + Nama + Quantity */}
            <div className="flex items-center gap-4">
                {imgurl ? (
                    <Image
                        src={imgurl}
                        alt={name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200" />
                )}
                <div>
                    <h3 className="font-semibold">{name}</h3>

                    <div className="flex items-center gap-2 mt-2">
                        {quantity === 0 ? (
                            <button onClick={increment} className="btn btn-sm btn-primary">
                                Add Again
                            </button>
                        ) : (
                            <div className="flex items-center border rounded-md overflow-hidden">
                                <button
                                    onClick={decrement}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                                >
                                    −
                                </button>
                                <span className="px-4">{quantity}</span>
                                <button
                                    onClick={increment}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Kanan: Harga total */}
            <div>
                <p className="font-semibold">
                    Rp {(price * quantity).toLocaleString("id-ID")}
                </p>
            </div>
        </div>
    );
};

export default ProductItem;
