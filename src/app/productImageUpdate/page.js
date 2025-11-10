"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ImageUploadModal from "./ImageUploadModal";
import { fetchAllData } from "@/redux/adminProductSlice";
import { ref, deleteObject } from "firebase/storage";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";

export default function ProductImageUpdate() {
  const dispatch = useDispatch();

  const products = useSelector(
    (state) => state.adminProducts?.productCollection ?? []
  );
  const handleImageUploaded = (url) => {
    setSelectedProduct((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
    }));
  };

  useEffect(() => {
    dispatch(fetchAllData());
  }, [dispatch]);

  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImages, setShowImages] = useState(false);
  const [activeProductForView, setActiveProductForView] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteImage = async (url, product) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    setDeleting(true);
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);

      const productRef = doc(db, "productCollection", product.id);
      await updateDoc(productRef, { images: arrayRemove(url) });

      alert("✅ Image deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting image");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Image Update Page</h1>

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

              <p className="text-sm text-gray-700 flex justify-between items-center">
                <span>
                  Images Available:{" "}
                  <span className="font-semibold text-gray-900">
                    {product.images?.length || 0}
                  </span>
                </span>

                {product.images?.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveProductForView(product);
                      setShowImages(true);
                    }}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View
                  </button>
                )}
              </p>

              <button
                onClick={() => setSelectedProduct(product)}
                className="w-full bg-[#691080] text-white px-3 py-2 rounded-md hover:bg-[#55105f] mt-3"
                type="button"
              >
                Add Images
              </button>
            </div>
          );
        })}
      </div>

      {/* ---- UPLOAD IMAGES MODAL ---- */}
      {selectedProduct && (
        <ImageUploadModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUploaded={handleImageUploaded}
        />
      )}

      {/* ---- VIEW IMAGES MODAL ---- */}
      {showImages && activeProductForView && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowImages(false)}
          />
          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6 relative">
              <button
                onClick={() => setShowImages(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
              >
                ✖
              </button>

              <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
                Images of {activeProductForView.name}
              </h3>

              {activeProductForView.images?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {activeProductForView.images.map((url, i) => (
                    <div
                      key={i}
                      className="border rounded-lg overflow-hidden shadow-sm relative group"
                    >
                      <img
                        src={url}
                        alt="product"
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() =>
                          handleDeleteImage(url, activeProductForView)
                        }
                        disabled={deleting}
                        className="absolute top-1 right-1 bg-white/80 hover:bg-red-600 hover:text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        {deleting ? "..." : "🗑"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-4">
                  No images available.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
