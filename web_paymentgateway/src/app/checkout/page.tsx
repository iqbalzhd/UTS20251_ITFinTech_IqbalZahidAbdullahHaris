"use client";

import React, { useEffect, useState } from "react";
import ProductItem from "../components/productItem"; // path sesuai
import { IProduct, CartProduct } from "../../lib/types";


const CheckoutPage = () => {
    const [cart, setCart] = useState<CartProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCart() {
            try {
                const res = await fetch("/api/cart");
                const data: CartProduct[] = await res.json();
                setCart(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchCart();
    }, []);

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.035); // misal 3.5% pajak
    const total = subtotal + tax;

    if (loading) return <p className="text-center mt-10">Loading cart...</p>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Checkout</h2>

            {/* Daftar Produk */}
            <div className="card bg-base-100 shadow-md mb-4">
                <div className="card-body space-y-4">
                    {cart.map((item) => (
                        <ProductItem key={item.id} name={item.name} price={item.price} imgurl={item.imgurl} />
                    ))}
                </div>
            </div>

            {/* Ringkasan */}
            <div className="bg-base-100 shadow-md rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                    <span>Pajak</span>
                    <span>Rp {tax.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
                <button className="btn btn-primary w-full mt-4">
                    Continue to Payment →
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;
