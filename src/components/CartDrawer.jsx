"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateQuantity, removeFromCart, clearCart } from "@/redux/cartSlice";
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CartDrawer() {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleQuantityChange = (item, newQty) => {
    if (newQty < 1) return;
    if (newQty > item.stock) {
      toast.warning(`Only ${item.stock} units available!`, {
        position: "top-center",
      });
      return;
    }
    dispatch(updateQuantity({ id: item.id, quantity: newQty }));
  };

  const totalAmount = items.reduce((sum, i) => {
    const price = Number(i.rate || i.price) || 0;
    return sum + price * i.quantity;
  }, 0);

  return (
    <>
      {/* Cart Icon Button */}
      <button
        onClick={toggleDrawer}
        className="fixed top-5 right-5 p-3 bg-pink-500 text-white rounded-full shadow-lg z-50"
      >
        <ShoppingBag size={24} />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 text-xs text-white rounded-full flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={toggleDrawer} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto h-[calc(100%-80px)]">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Your cart is empty 🛒</p>
          ) : (
            items.map((item) => {
              const price = Number(item.rate || item.price) || 0;
              const itemTotal = (price * item.quantity).toFixed(2);
              const imageSrc = item.image || item.images?.[0] || "/placeholder.png";

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image src={imageSrc} alt={item.name} fill className="object-cover rounded-lg" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">₹{price.toFixed(2)}</p>
                      <p className="text-sm font-semibold text-green-600">Total: ₹{itemTotal}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleQuantityChange(item, item.quantity - 1)}>
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <button onClick={() => dispatch(removeFromCart(item.id))} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t flex flex-col gap-2">
            <p className="text-lg font-semibold">Total: ₹{totalAmount.toFixed(2)}</p>
            <button className="w-full py-2 bg-pink-500 text-white rounded-lg">
              Checkout
            </button>
            <button
              onClick={() => dispatch(clearCart())}
              className="w-full py-2 mt-2 border rounded-lg"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={toggleDrawer}
        ></div>
      )}
    </>
  );
}
