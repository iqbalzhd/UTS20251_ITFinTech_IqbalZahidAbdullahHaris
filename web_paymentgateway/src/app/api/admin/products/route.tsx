// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getData } from '@/lib/mongo'

// GET all products
export async function GET() {
    try {
        const productsCollection = await getData('product')
        const products = await productsCollection
            .find({})
            .sort({ id: 1 })
            .toArray()

        return NextResponse.json(products)
    } catch (err) {
        console.error('Failed to fetch products:', err)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}

// POST new product
export async function POST(req: NextRequest) {
    try {
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

        // Get the highest id to generate new id
        const lastProduct = await productsCollection
            .find({})
            .sort({ id: -1 })
            .limit(1)
            .toArray()

        const newId = lastProduct.length > 0 ? lastProduct[0].id + 1 : 1

        const newProduct = {
            id: newId,
            name,
            desc,
            price: Number(price),
            imgurl,
            quantity: Number(quantity)
        }

        await productsCollection.insertOne(newProduct)

        return NextResponse.json(newProduct, { status: 201 })
    } catch (err) {
        console.error('Failed to create product:', err)
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        )
    }
}