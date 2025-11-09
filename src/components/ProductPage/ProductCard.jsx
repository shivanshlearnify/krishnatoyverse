"use client";
import { useState } from "react";
import { ref, deleteObject } from "firebase/storage";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";

export default function ProductCard({ item, uploading, onUpload, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 🔹 Small reusable label/value renderer
  const DetailRow = ({ label, value }) => (
    <p className="text-sm text-gray-600 flex justify-between">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="truncate ml-2">{value || "-"}</span>
    </p>
  );

  // 🔹 Delete image from Firebase & Firestore
  const handleDeleteImage = async (url) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    setDeleting(true);
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);

      const productRef = doc(db, "productCollection", item.id);
      await updateDoc(productRef, { images: arrayRemove(url) });

      alert("✅ Image deleted successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting image");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between relative">
      {/* Product Header */}
      <div className="mb-3">
        <h2 className="font-semibold text-gray-900 text-lg truncate">
          {item.name}
        </h2>
        <p className="text-xs text-gray-500 truncate">Code: {item.code}</p>
      </div>

      {/* Compact Info */}
      <div className="space-y-1 text-sm">
        <DetailRow label="MRP" value={`₹${item.mrp}`} />
        <DetailRow label="Rate" value={`₹${item.rate}`} />
        <DetailRow label="Stock" value={item.stock} /> {/* 🆕 Added here */}
        <DetailRow label="Brand" value={item.brand} />
        <DetailRow label="Category" value={item.category} />
        {isExpanded && (
          <>
            <DetailRow label="Group" value={item.group} />
            <DetailRow label="Subcategory" value={item.subCategory} />
            <DetailRow label="Supplier" value={item.supplier} />
            <DetailRow label="Barcode" value={item.barcode} />
          </>
        )}
      </div>

      {/* Expand / Collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-blue-600 mt-2 hover:underline self-end"
      >
        {isExpanded ? "Hide Details ↑" : "View More ↓"}
      </button>

      {/* Image Info + Upload */}
      <div className="mt-3">
        <p className="text-sm text-gray-700 flex justify-between items-center">
          <span>
            Images Available:{" "}
            <span className="font-semibold text-gray-900">
              {item.images?.length || 0}
            </span>
          </span>

          {item.images?.length > 0 && (
            <button
              onClick={() => setShowImages(true)}
              className="text-blue-600 text-sm hover:underline"
            >
              View
            </button>
          )}
        </p>

        <label className="mt-2 block w-full">
          <span className="block text-center py-2 rounded-lg bg-blue-500 text-white text-sm font-medium cursor-pointer hover:bg-blue-600 transition">
            Add Image
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment" // 👈 Opens back camera on mobile
            hidden
            onChange={(e) => onUpload(item.id, e)}
          />
        </label>

        {uploading && (
          <p className="text-blue-500 mt-1 text-xs text-center">Uploading...</p>
        )}
      </div>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(item)}
        className="mt-3 w-full py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
      >
        Edit Item
      </button>

      {/* 🖼 Image Modal */}
      {showImages && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowImages(false)}
          ></div>

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6 relative">
              <button
                onClick={() => setShowImages(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
              >
                ✖
              </button>

              <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
                Images of {item.name}
              </h3>

              {item.images?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {item.images.map((url, i) => (
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
                        onClick={() => handleDeleteImage(url)}
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
