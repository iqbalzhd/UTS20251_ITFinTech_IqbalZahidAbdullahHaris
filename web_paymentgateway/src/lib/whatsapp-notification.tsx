
interface OrderItem {
    productId: number;
    name: string;
    qty: number;
    price: number;
}

interface OrderNotificationData {
    phone: string;
    orderId: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    invoiceUrl: string;
}

// Kirim notifikasi order baru
export async function sendOrderNotification(data: OrderNotificationData): Promise<boolean> {
    try {
        // Format item list
        const itemsList = data.items
            .map((item, idx) =>
                `${idx + 1}. ${item.name}\n   Qty: ${item.qty} x Rp ${item.price.toLocaleString('id-ID')}`
            )
            .join('\n');

        const message = `🛒 *PESANAN BARU*\n\n` +
            `Order ID: ${data.orderId}\n\n` +
            `📦 *Produk yang dibeli:*\n${itemsList}\n\n` +
            `💰 *Rincian Pembayaran:*\n` +
            `Subtotal: Rp ${data.subtotal.toLocaleString('id-ID')}\n` +
            `PPN: Rp ${data.tax.toLocaleString('id-ID')}\n` +
            `*Total: Rp ${data.total.toLocaleString('id-ID')}*\n\n` +
            `🔗 *Link Pembayaran:*\n${data.invoiceUrl}\n\n` +
            `Silakan lakukan pembayaran sebelum link expired.\n` +
            `Terima kasih! 😊`;

        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': process.env.FONNTE_API_KEY || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target: data.phone,
                message: message,
                countryCode: '62',
            }),
        });

        const result = await response.json();
        console.log('WhatsApp notification sent:', result);
        return result.status === true;
    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
        return false;
    }
}

// Kirim notifikasi pembayaran berhasil
export async function sendPaymentSuccessNotification(
    phone: string,
    orderId: string,
    items: OrderItem[],
    total: number
): Promise<boolean> {
    try {
        const itemsList = items
            .map((item, idx) =>
                `${idx + 1}. ${item.name} (${item.qty}x)`
            )
            .join('\n');

        const message = `✅ *PEMBAYARAN BERHASIL*\n\n` +
            `Order ID: ${orderId}\n\n` +
            `Terima kasih! Pembayaran Anda sebesar *Rp ${total.toLocaleString('id-ID')}* telah kami terima.\n\n` +
            `📦 *Produk yang dibeli:*\n${itemsList}\n\n` +
            `Pesanan Anda sedang diproses dan akan segera dikirim.\n\n` +
            `Terima kasih telah berbelanja! 🎉`;

        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': process.env.FONNTE_API_KEY || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target: phone,
                message: message,
                countryCode: '62',
            }),
        });

        const result = await response.json();
        console.log('Payment success notification sent:', result);
        return result.status === true;
    } catch (error) {
        console.error('Error sending payment success notification:', error);
        return false;
    }
}