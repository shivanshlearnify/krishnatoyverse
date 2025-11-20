"use client";

import AllProducts from "@/components/AllProducts";
import CategoryGrid from "@/components/CategoryGrid";
import ShopByCategorySection from "@/components/Home/ShopByCategorySection";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="min-h-3/6 text-[#F9FAFB] flex items-center justify-between mx-4">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-[60%]"
        >
          <h3 className="text-[#c650e4d3]">A unit of Krishna super mart</h3>
          <h2 className="text-4xl font-extrabold text-[#8b1da7] drop-shadow-lg">
            Welcome to Krishna ToyVerse 🎮
          </h2>
          <p className="mt-6 text-lg text-[#c650e4d3]">
            Discover a universe of fun! From action figures to plush toys, find
            your favorites all in one place.
          </p>
          <div className="mt-8 flex flex-col lg:flex-row gap-4 space-x-4">
            <button className="bg-[#8b1da7] hover:bg-[#a322c4c5] text-white text-lg px-8 py-3 rounded-full shadow-lg transition cursor-pointer">
              Shop Now
            </button>
            <button className="backdrop-blur-md bg-white/30 border-2 border-[#8b1da7] text-[#8b1da7] hover:bg-[#8b1da7] hover:text-white text-lg px-8 py-3 rounded-full transition cursor-pointer">
              View Categories
            </button>
          </div>
        </motion.section>
        <Image
          src="/toyBannerBg.png"
          alt="Toy Store Banner"
          width={600}
          height={500}
          className="right-2 md:top-7 absolute md:static -z-50 opacity-30 md:opacity-100"
        />
      </div>
      {/* <ShopByCategorySection /> */}
      <CategoryGrid/>
    </>
  );
}
