"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // modern icons (auto-available)
import AnnouncementBar from "./AnnouncementBar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnnouncementBar />
      <nav className="w-full bg-white px-36 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-pink-600">
            ToyVerse
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6">
            <Link href="/services" className="hover:text-[#c650e4] cursor-pointer transition text-2xl font-bold text-[#c650e4d3]">
              Login
            </Link>
            <Link href="/contact" className="hover:text-[#c650e4] cursor-pointer text-2xl transition font-bold text-[#c650e4d3]">
              Cart (0)
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
