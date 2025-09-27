import Navbar from "./components/navBar";
import { getData } from "../lib/mongo";
import { IProduct } from "../lib/types";
import ProductGrid from "./components/productGrid";

export default async function Home() {
  const productCollection = await getData<IProduct>("product");
  const products = await productCollection.find({}).toArray();

  // Convert MongoDB document jadi plain object
  const cleanProducts: IProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    desc: p.desc,
    price: p.price,
    imgurl: p.imgurl,
    quantity: p.quantity,
  }));

  return (
    <div>
      <Navbar />
      <ProductGrid products={cleanProducts} />
    </div>
  );
}
