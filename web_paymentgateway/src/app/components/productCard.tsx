"use client";
import React, { useState } from "react";
import { ProductCardProps } from "@/lib/types";
import Image from "next/image";


const ProductCard: React.FC<ProductCardProps> = ({
  title,
  price,
  image,
  description,
  onAdd,
  onRemove,
}) => {
  const [quantity, setQuantity] = useState<number>(0);

  const increment = () => {
    setQuantity((q) => q + 1);
    onAdd();
  };

  const decrement = () => {
    if (quantity > 0) {
      setQuantity((q) => q - 1);
      onRemove();
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm mx-auto w-full">


      <figure>
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="rounded-md object-cover" />
      </figure>

      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <h2>Rp {price.toLocaleString("id-ID")}</h2>
        <p>{description}</p>

        <div className="card-actions justify-end">
          {quantity === 0 ? (
            <button onClick={increment} className="btn btn-primary">
              Buy Now
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
  );
};

export default ProductCard;
