"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // modern icons (auto-available)

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-md px-6 py-3">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-pink-600">
          MyBrand
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-800 focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6">
          <Link href="/adminPannel" className="hover:text-pink-500 transition">
            Admin pannel
          </Link>
          <Link href="/addProduct" className="hover:text-pink-500 transition">
            Add product
          </Link>
          <Link href="/about" className="hover:text-pink-500 transition">
            About
          </Link>
          <Link href="/services" className="hover:text-pink-500 transition">
            Services
          </Link>
          <Link href="/contact" className="hover:text-pink-500 transition">
            Contact
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden flex flex-col mt-3 space-y-3">
          <Link
            href="/adminPannel"
            className="hover:text-pink-500 transition"
            onClick={() => setIsOpen(false)}
          >
            Admin pannel
          </Link>
          <Link
            href="/addProduct"
            className="hover:text-pink-500 transition"
            onClick={() => setIsOpen(false)}
          >
            Add product
          </Link>
          <Link
            href="/about"
            className="hover:text-pink-500 transition"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link
            href="/services"
            className="hover:text-pink-500 transition"
            onClick={() => setIsOpen(false)}
          >
            Services
          </Link>
          <Link
            href="/contact"
            className="hover:text-pink-500 transition"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}
