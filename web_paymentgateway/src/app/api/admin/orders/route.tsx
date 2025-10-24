// app/api/admin/orders/route.ts
import { NextResponse } from 'next/server'
import { getData } from '@/lib/mongo'

export async function GET() {
    try {
        const ordersCollection = await getData('orders')
        const orders = await ordersCollection
            .find({})
            .sort({ createdAt: -1 }) // Sort by newest first
            .toArray()

        return NextResponse.json(orders)
    } catch (err) {
        console.error('Failed to fetch orders:', err)
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        )
    }
}