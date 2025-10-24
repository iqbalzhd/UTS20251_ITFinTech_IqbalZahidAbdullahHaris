export interface IProduct {
    id: number;
    name: string;
    desc: string;
    price: number;
    imgurl: string;
    quantity: number;
}

export interface CartProduct {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imgurl: string;
}

export interface ProductCardProps {
    title: string;
    price: number;
    image: string;
    description: string;
    onAdd: () => void;
    onRemove: () => void;
}

export interface ProductItemProps {
    name: string;
    price: number;
    imgurl: string;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
}

export interface User {
    _id?: string;
    email: string;
    password: string;
    phone: string;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

export interface Order {
    _id?: string;
    external_id: string;
    invoice_id: string;
    invoice_url: string;
    user_id: string;
    user_email: string;
    user_phone: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
    createdAt: Date;
    updatedAt: Date;
    paid_at?: Date;
}

export interface OrderItem {
    productId: number;
    name: string;
    qty: number;
    price: number;
}