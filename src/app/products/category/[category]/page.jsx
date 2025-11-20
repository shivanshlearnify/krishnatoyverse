"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { fetchProductsByFilter } from "@/redux/productSlice";
import ProductCard from "@/components/ProductCard";

export default function CategoryPage() {
  const params = useParams();
  const dispatch = useDispatch();

  // Decode URL parameter to match Firestore value
  const category = decodeURIComponent(params.category);

  const filteredCategory =
    useSelector((state) => state.products.filtered.category[category]) || {};

  const products = filteredCategory.products || [];
  const lastVisibleId = filteredCategory.lastVisibleId || null;
  const loading = useSelector((state) => state.products.loadingFiltered);

  const observer = useRef();

  // Infinite scroll
  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && lastVisibleId) {
          dispatch(
            fetchProductsByFilter({
              field: "category",
              value: category,
              pageSize: 20,
            })
          );
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, lastVisibleId, dispatch, category]
  );

  // Fetch initial products
  useEffect(() => {
    dispatch(
      fetchProductsByFilter({
        field: "category",
        value: category,
        pageSize: 20,
      })
    );
  }, [dispatch, category]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{category}</h1>

      {products.length === 0 && loading && (
        <p className="text-gray-500">Loading products...</p>
      )}

      {products.length === 0 && !loading && (
        <p className="text-gray-500">No products found in this category.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((product, index) => {
          if (products.length === index + 1) {
            return (
              <div key={product.id} ref={lastProductRef}>
                <ProductCard product={product} />
              </div>
            );
          } else {
            return <ProductCard key={product.id} product={product} />;
          }
        })}
      </div>

      {loading && products.length > 0 && (
        <p className="text-center text-gray-500 mt-4">
          Loading more products...
        </p>
      )}
      {!loading && lastVisibleId === null && products.length > 0 && (
        <p className="text-center text-gray-500 mt-4">
          That’s all folks 👋 No more products to show.
        </p>
      )}
    </div>
  );
}
