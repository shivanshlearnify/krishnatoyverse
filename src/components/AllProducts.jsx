"use client";

import { clearProducts, fetchProducts } from "@/redux/productSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "@/components/ProductCard"; // ✅ import it

export default function AllProducts() {
  const dispatch = useDispatch();

  const {
    data = [],
    loading,
    error,
    lastVisibleId,
  } = useSelector((state) => state.products ?? {});

  console.log("FROM COMPONENT:", { data, loading, error, lastVisibleId });

  useEffect(() => {
    dispatch(clearProducts());
    dispatch(fetchProducts({ pageSize: 5000 }));
  }, []);

  const handleLoadMore = () => {
    if (loading) return;
    if (lastVisibleId) {
      dispatch(fetchProducts({ lastVisibleId, pageSize: 20 }));
    }
  };

  // ✅ Sort only once & log
  const sortedProducts = [...data].sort(
    (a, b) => (b.images?.length || 0) - (a.images?.length || 0)
  );

  console.log("✅ Sorted Products:", sortedProducts);

  // Optional: show name + image count only
  console.log(sortedProducts);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>

      {loading && data.length === 0 && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* ✅ Render Products */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="flex justify-center mt-6">
        {loading ? (
          <p>Loading...</p>
        ) : lastVisibleId ? (
          <button
            onClick={handleLoadMore}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
          >
            Load More
          </button>
        ) : data.length > 0 ? (
          <p className="text-gray-500">No more products</p>
        ) : null}
      </div>
    </div>
  );
}
