"use client";
import React, { useState } from "react";

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  image: string;
  description: string;
  onAdd: () => void;
  onRemove: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
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
    <div className="card bg-base-100 w-96 shadow-sm mx-auto">
      <figure>
        <img src={image} alt={title} />
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
