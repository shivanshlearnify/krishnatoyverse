"use client";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { openDrawer } from "@/redux/cartDrawerSlice";
import { toast } from "react-toastify";
import Image from "next/image";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const image = product?.images?.[0] || "/placeholder.png";

  const rate = Number(product?.rate) || 0;
  const mrp = Number(product?.mrp) || 0;
  const discount = mrp > rate ? Math.round(((mrp - rate) / mrp) * 100) : 0;

  const handleAddToCart = () => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    // Always open drawer
    dispatch(openDrawer());

    // Check stock
    if (currentQty + 1 > product.stock) {
      toast.warning(`Only ${product.stock} units available!`, {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    dispatch(addToCart(product));
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 relative">
      {discount > 0 && (
        <div className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
          SALE
        </div>
      )}

      <div className="w-full aspect-square overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={product?.name || "Product image"}
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
          onError={(e) => (e.target.src = "/placeholder.png")}
        />
      </div>

      <div className="mt-3">
        <h3
          className="text-base sm:text-lg font-semibold text-gray-900 truncate"
          title={product.name}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xl font-bold text-[#691080]">₹{rate}</span>
          {mrp > rate && (
            <>
              <span className="text-gray-500 line-through text-sm">₹{mrp}</span>
              <span className="text-green-600 text-sm font-medium">{discount}% off</span>
            </>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-4 w-full bg-[#691080] text-white py-2.5 rounded-xl hover:bg-[#aa1ccf] transition-all font-medium"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
