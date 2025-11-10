"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ImageUploadModal from "./ImageUploadModal";
import { fetchAllData } from "@/redux/adminProductSlice"; // <-- make sure path is correct

export default function ProductImageUpdate() {
  const dispatch = useDispatch();

  const products = useSelector(
    (state) => state.adminProducts?.productCollection ?? []
  );

  useEffect(() => {
    dispatch(fetchAllData());
  }, [dispatch]);

  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.barcode || "").toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Image Update</h1>

      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, barcode or code..."
          className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="text-sm text-gray-500 col-span-full">
            No products found.
          </div>
        )}

        {filtered.map((product) => {
          const image = product?.images?.[0] || "/placeholder.png";
          return (
            <div
              key={product.id}
              className="p-3 bg-white border rounded-md shadow-sm hover:shadow-md transition"
            >
              <img
                src={image}
                alt={product.name}
                className="w-full h-40 object-cover rounded-md"
              />
              <h3 className="mt-3 text-lg font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600">₹{product.rate}</p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 bg-[#691080] text-white px-3 py-2 rounded-md hover:bg-[#55105f]"
                >
                  Add Images
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ImageUploadModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUploaded={(url) => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
