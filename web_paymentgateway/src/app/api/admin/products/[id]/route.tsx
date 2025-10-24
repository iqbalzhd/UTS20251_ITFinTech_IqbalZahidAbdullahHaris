// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getData } from '@/lib/mongo'

// PUT - Update product
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const productId = parseInt(params.id)
        const body = await req.json()
        const { name, desc, price, imgurl, quantity } = body

        // Validate required fields
        if (!name || !desc || price === undefined || !imgurl || quantity === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const productsCollection = await getData('product')

        const updateData = {
            name,
            desc,
            price: Number(price),
            imgurl,
            quantity: Number(quantity)
        }

        const result = await productsCollection.updateOne(
            { id: productId },
            { $set: updateData }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: 'Product updated successfully',
            ...updateData,
            id: productId
        })
    } catch (err) {
        console.error('Failed to update product:', err)
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        )
    }
}

// DELETE - Delete product
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const productId = parseInt(params.id)

        const productsCollection = await getData('product')

        const result = await productsCollection.deleteOne({ id: productId })

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: 'Product deleted successfully',
            id: productId
        })
    } catch (err) {
        console.error('Failed to delete product:', err)
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}