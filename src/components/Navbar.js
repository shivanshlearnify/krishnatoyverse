"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import AnnouncementBar from "./AnnouncementBar";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "react-toastify";
import { toggleDrawer } from "@/redux/cartDrawerSlice"; // ✅ import Redux action

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch(); // ✅ useDispatch

  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully 👋", { autoClose: 2000 });
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout. Please try again.", { autoClose: 2500 });
    }
  };

  return (
    <>
      <AnnouncementBar />
      <nav className="w-full bg-white px-6 md:px-36 py-3 shadow-sm relative z-50">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-pink-600 whitespace-nowrap"
          >
            ToyVerse
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              <Link
                href="/login"
                className="hover:text-[#c650e4] cursor-pointer transition text-2xl font-bold text-[#c650e4d3]"
              >
                Login
              </Link>
            ) : (
              <div className="relative group">
                <button className="flex items-center gap-1 text-2xl font-bold text-[#c650e4d3] hover:text-[#c650e4] transition">
                  Account <ChevronDown size={18} />
                </button>

                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Cart — Redux controlled */}
            <div
              className="relative flex items-center gap-2 text-2xl font-bold text-[#c650e4d3] hover:text-[#c650e4] transition cursor-pointer"
              onClick={() => dispatch(toggleDrawer())} // ✅ Redux toggle
            >
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
              <ShoppingCart size={28} />
              <span className="text-base ml-1">Cart</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-pink-600"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-3 space-y-3 bg-white p-4 rounded-lg shadow-lg">
            {!user ? (
              <Link
                href="/login"
                className="block text-lg font-semibold text-[#c650e4d3] hover:text-[#c650e4]"
              >
                Login
              </Link>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="block text-lg font-semibold text-[#c650e4d3] hover:text-[#c650e4]"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-lg font-semibold text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            )}

            {/* Mobile Cart */}
            <div
              className="relative flex items-center gap-2 text-lg font-semibold text-[#c650e4d3] hover:text-[#c650e4] cursor-pointer"
              onClick={() => dispatch(toggleDrawer())} // ✅ Redux toggle
            >
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
              <ShoppingCart size={24} />
              <span className="ml-1">Cart</span>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
