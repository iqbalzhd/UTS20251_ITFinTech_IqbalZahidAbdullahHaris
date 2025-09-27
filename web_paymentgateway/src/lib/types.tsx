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
