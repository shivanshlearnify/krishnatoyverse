"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import AnnouncementBar from "./AnnouncementBar";
import { useAuth } from "@/app/hooks/useAuth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    alert("Logged out successfully 👋");
    router.push("/");
  };

  return (
    <>
      <AnnouncementBar />
      <nav className="w-full bg-white px-6 md:px-36 py-3 shadow-sm relative z-50">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-pink-600">
            ToyVerse
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            {/* Conditionally render Login or Account Dropdown */}
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

                {/* Dropdown visible on hover */}
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

            <Link
              href="/cart"
              className="hover:text-[#c650e4] cursor-pointer text-2xl transition font-bold text-[#c650e4d3]"
            >
              Cart (0)
            </Link>
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

            <Link
              href="/cartPage"
              className="block text-lg font-semibold text-[#c650e4d3] hover:text-[#c650e4]"
            >
              Cart (0)
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
