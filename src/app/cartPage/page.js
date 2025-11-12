"use client";

import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { updateQuantity, removeFromCart, clearCart } from "@/redux/cartSlice";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";

export default function CartPage() {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // ✅ Checkout form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "COD",
  });

  // 🔹 Handle input
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🔹 Quantity handler
  const handleQuantityChange = (item, newQty) => {
    if (newQty < 1) return;

    if (newQty > item.stock) {
      toast.warning(`Only ${item.stock} units available in stock!`, {
        position: "top-center",
        autoClose: 1800,
        theme: "colored",
        style: { backgroundColor: "#facc15", color: "#000", fontWeight: 500 },
      });
      return;
    }

    dispatch(updateQuantity({ id: item.id, quantity: newQty }));
  };

  // 🔹 Total amount
  const totalAmount = items.reduce((sum, i) => {
    const price = Number(i.rate || i.price) || 0;
    return sum + price * i.quantity;
  }, 0);

  // 🔹 Handle order placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!items.length) {
      toast.error("Your cart is empty!");
      return;
    }

    const { name, phone, address, paymentMethod } = formData;
    if (!name || !phone || !address) {
      toast.error("Please fill all checkout details!");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "orders"), {
        ...formData,
        items,
        totalAmount,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      dispatch(clearCart());
      setFormData({ name: "", phone: "", address: "", paymentMethod: "COD" });

      toast.success("Order placed successfully 🎉", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Something went wrong!");
      console.error("Order Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Empty cart view
  if (!items.length)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
        <Image
          src="/empty-cart.png"
          alt="Empty Cart"
          width={160}
          height={160}
          className="mb-4 opacity-80"
        />
        <p className="text-lg font-medium">Your cart is empty 🛒</p>
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
      {/* 🛒 Cart Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Your Cart</h1>
          <button
            onClick={() => dispatch(clearCart())}
            className="text-sm text-red-500 hover:underline"
          >
            Clear All
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const price = Number(item.rate || item.price) || 0;
            const imageSrc =
              item.image || item.images?.[0] || "/placeholder.png";
            const itemTotal = (price * item.quantity).toFixed(2);

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white shadow-md rounded-2xl p-4"
              >
                {/* Left: Image + Info */}
                <div className="flex items-center gap-4 w-full sm:w-1/2">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={imageSrc}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover rounded-xl border"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ₹{price.toFixed(2)} each
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      Total: ₹{itemTotal}
                    </p>
                    <p className="text-xs text-gray-400">
                      In stock: {item.stock ?? "N/A"}
                    </p>
                  </div>
                </div>

                {/* Right: Quantity Controls */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-1/2 mt-4 sm:mt-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleQuantityChange(item, item.quantity - 1)
                      }
                      className="p-2 border rounded-full hover:bg-gray-100 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item, item.quantity + 1)
                      }
                      className="p-2 border rounded-full hover:bg-gray-100 transition cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="ml-4 text-red-500 hover:text-red-600 transition cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
