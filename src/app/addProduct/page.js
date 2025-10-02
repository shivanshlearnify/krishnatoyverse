"use client";
import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BarcodeScanner from "@/components/BarcodeScanner";

export default function AddProductImage() {
  const [searchType, setSearchType] = useState(""); // barcode | name
  const [barcodeMode, setBarcodeMode] = useState("type"); // type | scan
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Search Firestore by barcode or name
  const handleSearch = async () => {
    let q;
    if (searchType === "barcode") {
      q = query(
        collection(db, "stockCollection"),
        where("barcode", "==", searchQuery)
      );
    } else if (searchType === "name") {
      q = query(
        collection(db, "stockCollection"),
        where("name", "==", searchQuery)
      );
    } else {
      alert("Please select search type");
      return;
    }
    const snap = await getDocs(q);
    const results = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProducts(results);
  };

  // Upload image to Firebase Storage & save reference in Firestore
  const handleUpload = async (productId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      const storageRef = ref(storage, `products/${productId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        images: arrayUnion(url), // store multiple image URLs
      });

      alert("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    }
    setUploading(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Add Product Image</h1>

      {/* Choose search type */}
      <div className="flex gap-4">
        <button
          onClick={() => setSearchType("barcode")}
          className={`px-4 py-2 rounded ${
            searchType === "barcode" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Search by Barcode
        </button>
        <button
          onClick={() => setSearchType("name")}
          className={`px-4 py-2 rounded ${
            searchType === "name" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Search by Name
        </button>
      </div>

      {/* Barcode scan or search input */}
      {searchType === "barcode" && (
        <div className="space-y-3">
          {/* Toggle between Type and Scan */}
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${
                barcodeMode === "scan"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setBarcodeMode("scan")}
            >
              Scan with Camera
            </button>
            <button
              className={`px-3 py-1 rounded ${
                barcodeMode === "type"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setBarcodeMode("type")}
            >
              Type Barcode
            </button>
          </div>

          {/* Type Mode */}
          {barcodeMode === "type" && (
            <input
              type="text"
              placeholder="Enter Barcode"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 rounded w-full"
            />
          )}

          {/* Scan Mode */}
          {barcodeMode === "scan" && (
            <BarcodeScanner onScan={(code) => setSearchQuery(code)} />
          )}
        </div>
      )}

      {searchType === "name" && (
        <input
          type="text"
          placeholder="Enter Item Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full"
        />
      )}

      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Search
      </button>

      {/* Show products */}
      <div className="space-y-4">
        {products.map((p) => (
          <div key={p.id} className="border p-4 rounded shadow">
            <h2 className="font-semibold">{p.name}</h2>
            <p>Barcode: {p.barcode}</p>
            <p>Images Available: {p.images?.length || 0}</p>

            <label className="block mt-2">
              <span className="px-3 py-1 bg-blue-500 text-white rounded cursor-pointer">
                Add Image
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment" // 👈 opens back camera directly
                hidden
                onChange={(e) => handleUpload(p.id, e)}
              />
            </label>
          </div>
        ))}
      </div>

      {uploading && <p className="text-blue-500">Uploading...</p>}
    </div>
  );
}
