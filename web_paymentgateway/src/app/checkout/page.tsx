"use client";
import React, { useEffect, useState } from "react";
import ProductItem from "../components/productItem";
import { CartProduct } from "../../lib/types";



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
    const tax = Math.round(subtotal * 0.11); // misal 3.5% pajak
    const total = subtotal + tax;

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-2xl bg-base-100 shadow-md rounded-lg p-6">
                    <div className="flex justify-center items-center h-64">
                        <p className="text-lg font-medium text-gray-600 animate-pulse">
                            Loading cart...
                        </p>
                    </div>
                </div>
            </div>
        );

    // Jika kondisi cart kosong
    const isCartEmpty = cart.length === 0 || cart.every((item) => item.quantity === 0);

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-base-100 shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Checkout</h2>

                {/* Daftar Produk */}
                <div className="card bg-base-100 shadow-md mb-4">
                    <div className="card-body space-y-4">
                        {isCartEmpty ? (
                            <p className="text-center text-gray-500">
                                Tidak ada barang dalam keranjang
                            </p>
                        ) : (
                            cart.map((item) => (
                                <ProductItem
                                    key={item.id}
                                    name={item.name}
                                    price={item.price}
                                    imgurl={item.imgurl}
                                    quantity={item.quantity}
                                    onAdd={async () => {
                                        setCart((prev) =>
                                            prev.map((p) =>
                                                p.id === item.id
                                                    ? { ...p, quantity: p.quantity + 1 }
                                                    : p
                                            )
                                        );
                                        await fetch("/api/cart", {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                productId: item.id,
                                                quantity: item.quantity + 1,
                                            }),
                                        });
                                    }}
                                    onRemove={async () => {
                                        if (item.quantity <= 1) {
                                            // hapus item dari cart
                                            setCart((prev) => prev.filter((p) => p.id !== item.id));
                                            await fetch("/api/cart", {
                                                method: "DELETE",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ productId: item.id }),
                                            });
                                        } else {
                                            // kurangi qty
                                            setCart((prev) =>
                                                prev.map((p) =>
                                                    p.id === item.id
                                                        ? { ...p, quantity: p.quantity - 1 }
                                                        : p
                                                )
                                            );
                                            await fetch("/api/cart", {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    productId: item.id,
                                                    quantity: item.quantity - 1,
                                                }),
                                            });
                                        }
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Ringkasan */}
                {!isCartEmpty && (
                    <div className="bg-base-100 shadow-md rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>PPN</span>
                            <span>Rp {tax.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>Rp {total.toLocaleString("id-ID")}</span>
                        </div>
                        <button
                            className="btn btn-primary w-full mt-4"
                            onClick={async () => {
                                try {
                                    const payload = {
                                        items: cart.map(i => ({ productId: i.id, name: i.name, qty: i.quantity, price: i.price })),
                                        subtotal,
                                        tax,
                                        total,
                                    };
                                    const res = await fetch("/api/order/create", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(payload),
                                    });
                                    const data = await res.json();
                                    if (data.invoice_url) {
                                        window.location.href = data.invoice_url; // redirect ke Xendit
                                    } else {
                                        alert("Gagal membuat invoice");
                                        console.error(data);
                                    }
                                } catch (err) {
                                    console.error(err);
                                    alert("Terjadi error, cek console");
                                }
                            }}
                        >
                            Continue to Payment →
                        </button>

                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
