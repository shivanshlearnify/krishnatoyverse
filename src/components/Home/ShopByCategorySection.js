"use client";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchAllData } from "@/redux/productSlice";

export default function ShopByCategorySection() {
  const dispatch = useDispatch();
  const { productCollection, loading, error } = useSelector(
    (state) => state.productData
  );

  useEffect(() => {
    dispatch(fetchAllData());
  }, [dispatch]);

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 py-6">Error: {error}</p>;

  // ✅ Only keep products that have at least one image
  const productsWithImages = productCollection?.filter(
    (item) => Array.isArray(item.images) && item.images.length > 0
  );
  console.log(productsWithImages);
  

  return (
    <section className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Shop by Category</h2>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {productsWithImages?.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* ✅ Show first image */}
            <img
              src={item.images[0]}
              alt={item.name}
              className="w-full h-48 object-cover"
            />

            {/* Product Info */}
            <div className="p-3">
              <h3 className="font-medium text-sm sm:text-base mb-1 truncate">
                {item.name}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                MRP: ₹{item.mrp}
              </p>
              <p className="text-pink-600 font-semibold text-sm sm:text-base">
                Price: ₹{item.rate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
