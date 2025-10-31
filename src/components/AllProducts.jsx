"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, clearProducts } from "@/redux/productSlice";

export default function AllProducts() {
  const dispatch = useDispatch();
  const { data: products, loading, error, lastVisible } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    // When component mounts, clear and fetch products
    dispatch(clearProducts());
    dispatch(fetchProducts({ pageSize: 20 }));
  }, [dispatch]);

  const handleLoadMore = () => {
    if (!loading && lastVisible) {
      dispatch(fetchProducts({ lastDoc: lastVisible, pageSize: 20 }));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>

      {loading && products.length === 0 && <p>Loading products...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <img
              src={product.imageUrl || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg"
            />
            <h2 className="text-lg font-medium mt-2">{product.name}</h2>
            <p className="text-gray-600">₹{product.rate}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        {loading ? (
          <p>Loading...</p>
        ) : lastVisible ? (
          <button
            onClick={handleLoadMore}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
          >
            Load More
          </button>
        ) : (
          <p className="text-gray-500">No more products</p>
        )}
      </div>
    </div>
  );
}
