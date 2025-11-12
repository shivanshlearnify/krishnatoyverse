"use client";

import { clearProducts, fetchProducts } from "@/redux/productSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "@/components/ProductCard";

export default function AllProducts() {
  const dispatch = useDispatch();
  const { data = [], loading, error, lastVisibleId, lastFetchedAt } =
    useSelector((state) => state.products ?? {});

  useEffect(() => {
    const isExpired = Date.now() - (lastFetchedAt || 0) > 6 * 60 * 60 * 1000;

    if (data.length === 0 || isExpired) {
      console.log("🔄 Fetching fresh data from Firestore...");
      dispatch(clearProducts());
      dispatch(fetchProducts({ pageSize: 20 }));
    } else {
      console.log("✅ Using cached data from Redux Persist");
    }
  }, [dispatch]);

  const handleLoadMore = () => {
    if (!loading && lastVisibleId) {
      dispatch(fetchProducts({ lastVisibleId, pageSize: 20 }));
    }
  };

  const sortedProducts = [...data].sort(
    (a, b) => (b.images?.length || 0) - (a.images?.length || 0)
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>

      {loading && data.length === 0 && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

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
