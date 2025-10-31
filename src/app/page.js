"use client";

import AllProducts from "@/components/AllProducts";
import ShopByCategorySection from "@/components/Home/ShopByCategorySection";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="min-h-[80vh] text-[#F9FAFB] flex flex-col justify-center px-4">
        {/* <Image
          src="/toyBannerBg.png"
          alt="Toy Store Banner"
          width={600}
          height={500}
          className="absolute top-0 right-40"
        /> */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl ml-36"
        >
          <h3 className="text-white bg-[]">A unit of Krishna super mart</h3>      
          <h2 className="text-5xl font-extrabold text-[#8b1da7] drop-shadow-lg">
            Welcome to Krishna ToyVerse 🎮
          </h2>
          <p className="mt-6 text-lg text-[#c650e4d3]">
            Discover a universe of fun! From action figures to plush toys, find
            your favorites all in one place.
          </p>
          <div className="mt-8 flex space-x-4">
            <button className="bg-[#8b1da7] hover:bg-[#a322c4c5] text-white text-lg px-8 py-3 rounded-full shadow-lg transition cursor-pointer">
              Shop Now
            </button>
            <button className="border-2 border-[#8b1da7] text-[#8b1da7] hover:bg-[#8b1da7] hover:text-white text-lg px-8 py-3 rounded-full transition cursor-pointer">
              View Categories
            </button>
          </div>
        </motion.section>
      </div>
      {/* <ShopByCategorySection /> */}
      <AllProducts/>
    </>
  );
}
