import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  return (
    <div className="p-4 shadow-lg rounded-lg">
      <img src={product.image} alt={product.name} className="rounded-md" />
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p>₹{product.price}</p>
      <button
        onClick={() => dispatch(addToCart(product))}
        className="bg-pink-500 text-white px-4 py-2 rounded-lg mt-2"
      >
        Add to Cart
      </button>
    </div>
  );
}
