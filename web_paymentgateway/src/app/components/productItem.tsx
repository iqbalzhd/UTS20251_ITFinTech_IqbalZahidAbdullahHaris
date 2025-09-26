import React, { useState } from "react";

// ProductItem Component
const ProductItem = ({ name, price }: { name: string; price: number }) => {
    const [quantity, setQuantity] = useState(1);

    return (
        <div className="flex items-center justify-between border-b py-4">
            {/* Kiri: Gambar + Nama + Quantity */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200" />
                <div>
                    <h3 className="font-semibold">{name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                        >
                            –
                        </button>
                        <span className="px-3">{quantity}</span>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setQuantity((q) => q + 1)}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <p className="font-semibold">Rp {price}</p>

            </div>
        </div>
    );
};

export default ProductItem;
