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
    imgurl: string
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
    quantity: number; // initial dari DB
    onAdd: () => void;
    onRemove: () => void;
}
