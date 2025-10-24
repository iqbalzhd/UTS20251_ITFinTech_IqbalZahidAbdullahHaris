"use client";
import React, { useEffect, useState } from "react";
import ProductItem from "../components/productItem";
import { CartProduct } from "../../lib/types";

const CheckoutPage = () => {
    const [cart, setCart] = useState<CartProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        async function fetchCart() {
            try {
                const res = await fetch("/api/cart");
                if (!res.ok) {
                    throw new Error(`Failed to fetch cart: ${res.status}`);
                }
                const data: CartProduct[] = await res.json();
                setCart(data);
            } catch (err) {
                console.error("Error fetching cart:", err);
                alert("Gagal memuat keranjang. Silakan refresh halaman.");
            } finally {
                setLoading(false);
            }
        }

        fetchCart();
    }, []);

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.11); // PPN 11%
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (processing) return; // Prevent double-click

        setProcessing(true);

        try {
            const payload = {
                items: cart.map(i => ({
                    productId: i.id,
                    name: i.name,
                    qty: i.quantity,
                    price: i.price
                })),
                subtotal,
                tax,
                total,
            };

            console.log("Sending checkout payload:", payload);

            const res = await fetch("/api/order/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log("Checkout response:", data);

            if (!res.ok) {
                // Handle specific error cases
                if (res.status === 401) {
                    alert("Anda belum login. Silakan login terlebih dahulu.");
                    window.location.href = "/login"; // Redirect ke halaman login
                    return;
                }
                throw new Error(data.error || "Gagal membuat order");
            }

            if (data.invoice_url) {
                // Tampilkan info jika WhatsApp tidak terkirim
                if (data.order?.has_phone === false) {
                    alert("Order berhasil dibuat! Namun nomor WhatsApp tidak terdaftar. Silakan tambahkan nomor WhatsApp di profil Anda.");
                } else if (data.order?.whatsapp_sent === false) {
                    alert("Order berhasil dibuat! Namun notifikasi WhatsApp gagal dikirim. Link pembayaran akan tetap dibuka.");
                }

                // Redirect ke Xendit payment page
                window.location.href = data.invoice_url;
            } else {
                throw new Error("Invoice URL tidak ditemukan");
            }
        } catch (err) {
            console.error("Checkout error:", err);
            alert(err instanceof Error ? err.message : "Terjadi kesalahan saat checkout. Silakan coba lagi.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
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
    }

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
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">
                                    Tidak ada barang dalam keranjang
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => window.location.href = "/products"}
                                >
                                    Belanja Sekarang
                                </button>
                            </div>
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
                                        try {
                                            await fetch("/api/cart", {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    productId: item.id,
                                                    quantity: item.quantity + 1,
                                                }),
                                            });
                                        } catch (err) {
                                            console.error("Error updating cart:", err);
                                        }
                                    }}
                                    onRemove={async () => {
                                        if (item.quantity <= 1) {
                                            // hapus item dari cart
                                            setCart((prev) => prev.filter((p) => p.id !== item.id));
                                            try {
                                                await fetch("/api/cart", {
                                                    method: "DELETE",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ productId: item.id }),
                                                });
                                            } catch (err) {
                                                console.error("Error removing from cart:", err);
                                            }
                                        } else {
                                            // kurangi qty
                                            setCart((prev) =>
                                                prev.map((p) =>
                                                    p.id === item.id
                                                        ? { ...p, quantity: p.quantity - 1 }
                                                        : p
                                                )
                                            );
                                            try {
                                                await fetch("/api/cart", {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        productId: item.id,
                                                        quantity: item.quantity - 1,
                                                    }),
                                                });
                                            } catch (err) {
                                                console.error("Error updating cart:", err);
                                            }
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
                            <span>PPN (11%)</span>
                            <span>Rp {tax.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>Rp {total.toLocaleString("id-ID")}</span>
                        </div>
                        <button
                            className={`btn btn-primary w-full mt-4 ${processing ? 'loading' : ''}`}
                            onClick={handleCheckout}
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : 'Continue to Payment →'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;