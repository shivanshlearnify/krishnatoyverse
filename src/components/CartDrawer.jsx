"use client";

import { useDispatch, useSelector } from "react-redux";
import { updateQuantity, removeFromCart, clearCart } from "@/redux/cartSlice";
import { closeDrawer } from "@/redux/cartDrawerSlice";
import { Minus, Plus, Trash2, X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

export default function CartDrawer() {
  const { items } = useSelector((state) => state.cart);
  const isOpen = useSelector((state) => state.cartDrawer.isOpen);
  const dispatch = useDispatch();

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

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleClose = () => dispatch(closeDrawer());

  return (
    <>
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-[60] rounded-l-2xl flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-purple-800">🛒 Your Cart</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Image
                src="/empty-cart.png"
                alt="Empty Cart"
                width={120}
                height={120}
              />
              <p className="mt-4 text-center text-base">
                Your cart looks empty! <br /> Start adding some fun toys 🧸
              </p>
            </div>
          ) : (
            items.map((item) => {
              const price = Number(item.rate || item.price) || 0;
              const itemTotal = (price * item.quantity).toFixed(2);
              const imageSrc = item.image || item.images?.[0] || "/placeholder.png";

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-white rounded-xl p-3 shadow-sm mb-3 border border-gray-200 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100">
                      <Image
                        src={imageSrc}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">₹{price.toFixed(2)}</p>
                      <p className="text-sm font-semibold text-purple-700">
                        Total: ₹{itemTotal}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-gray-100 border rounded-full px-2 py-1">
                      <button
                        onClick={() =>
                          handleQuantityChange(item, item.quantity - 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item, item.quantity + 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Checkout Section */}
        {items.length > 0 && (
          <div className="p-4 border-t border-purple-200 bg-white rounded-t-2xl shadow-inner">
            <div className="border border-purple-300 rounded-xl p-3 mb-3 bg-purple-50">
              <div className="flex justify-between text-gray-800 font-semibold text-base">
                <span>Total Items:</span>
                <span>{totalQty}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-purple-700 mt-1">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all">
              <ShoppingBag size={18} />
              Buy Now (₹{totalAmount.toFixed(2)})
            </button>

            <button
              onClick={() => dispatch(clearCart())}
              className="w-full py-2 mt-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={handleClose}
        ></div>
      )}
    </>
  );
}
