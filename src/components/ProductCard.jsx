"use client";

import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const image = product?.images?.[0] || "/placeholder.png";

  // 🧮 Calculate discount percentage
  const rate = Number(product?.rate) || 0;
  const mrp = Number(product?.mrp) || 0;
  const discount =
    mrp > rate ? Math.round(((mrp - rate) / mrp) * 100) : 0;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      {/* 🖼 Product Image */}
      <div className="w-full aspect-square overflow-hidden rounded-xl">
        <img
          src={image}
          alt={product?.name || "Product image"}
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
          onError={(e) => (e.target.src = "/placeholder.png")}
        />
      </div>

      {/* 📝 Product Info */}
      <div className="mt-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {product.name}
        </h3>

        {/* 💰 Price Section */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xl font-bold text-[#691080]">
            ₹{rate}
          </span>
          {mrp > rate && (
            <>
              <span className="text-gray-500 line-through text-sm">
                ₹{mrp}
              </span>
              <span className="text-green-600 text-sm font-medium">
                {discount}% off
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => dispatch(addToCart(product))}
          className="mt-4 w-full bg-[#691080] text-white py-2.5 rounded-xl hover:bg-[#aa1ccf] transition-all font-medium"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
