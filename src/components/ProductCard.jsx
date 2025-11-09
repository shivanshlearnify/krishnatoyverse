"use client";

import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  // ✅ Correct key: images
  const image = product?.images?.[0] || "/placeholder.png";

  return (
    <div className="p-4 shadow-lg rounded-lg border hover:shadow-xl transition">
      <img
        src={image}
        alt={product.name}
        className="rounded-md w-full h-40 object-cover"
      />

      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <p className="font-medium text-gray-700">₹{product.rate}</p>

      <button
        onClick={() => dispatch(addToCart(product))}
        className="bg-[#691080] text-white px-4 py-2 rounded-lg mt-3 w-full hover:bg-[#aa1ccf]"
      >
        Add to Cart
      </button>
    </div>
  );
}
