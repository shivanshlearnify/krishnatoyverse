"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeta, fetchProductsByFilter } from "@/redux/productSlice";
import { useRouter } from "next/navigation";

export default function CategoryGrid() {
  const dispatch = useDispatch();
  const router = useRouter();

  const categories = useSelector((state) => state.products.meta.categories);
  const loading = useSelector((state) => state.products.loadingMeta);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchMeta("categories"));
  }, [dispatch]);

  const handleCategoryClick = async (categoryName) => {
    await dispatch(
      fetchProductsByFilter({
        field: "category",
        value: categoryName,
        pageSize: 20,
      })
    );

    // Navigate to category page
    router.push(`/products/category/${categoryName}`);
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading categories...</p>}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <p className="text-gray-500">No categories found.</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.name || cat.title)}
            className="border p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer text-center"
          >
            <p className="font-medium text-gray-700">
              {cat.name || cat.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
