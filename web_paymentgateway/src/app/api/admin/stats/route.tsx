// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import { getData } from '@/lib/mongo'

export async function GET() {
    try {
        const ordersCollection = await getData('orders')
        const orders = await ordersCollection.find({}).toArray()

        // Calculate statistics
        const totalOrders = orders.length
        const paidOrders = orders.filter(order => order.status === 'PAID').length
        const pendingPayments = orders.filter(order => order.status === 'PENDING').length

        // Calculate total revenue from paid orders only
        const totalRevenue = orders
            .filter(order => order.status === 'PAID')
            .reduce((sum, order) => sum + (order.total || 0), 0)

        return NextResponse.json({
            totalRevenue,
            totalOrders,
            paidOrders,
            pendingPayments
        })
    } catch (err) {
        console.error('Failed to fetch stats:', err)
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        )
    }
}