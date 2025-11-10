"use client";

import React, { useState, useEffect } from "react";
import { storage, db } from "@/lib/firebase";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function ImageUploadModal({ product, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e) => {
    setError("");
    const f = e.target.files?.[0];
    if (!f) return;
    // Optional: validate type/size
    if (!f.type.startsWith("image/")) {
      setError("Please capture a valid image.");
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please capture an image first.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const timestamp = Date.now();
      const path = `productImages/${product.id}/${timestamp}.jpg`;
      const sRef = storageRef(storage, path);

      const uploadTask = uploadBytesResumable(sRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(pct);
        },
        (uploadError) => {
          console.error(uploadError);
          setError("Upload failed. Try again.");
          setUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          // Append to Firestore images array
          const prodRef = doc(db, "productCollection", product.id);
          await updateDoc(prodRef, {
            images: arrayUnion(url)
          });
          setUploading(false);
          setFile(null);
          setProgress(0);
          if (onUploaded) onUploaded(url);
        }
      );
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
      setUploading(false);
    }
  };

  return (
    // Modal backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!uploading) onClose();
        }}
      />

      <div className="relative bg-white w-full max-w-lg mx-4 rounded-lg shadow-xl z-10 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Image — {product.name}</h2>
          <button
            onClick={() => {
              if (!uploading) onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capture Image (camera only)
          </label>

          {/* Camera-only file input */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="block w-full"
            disabled={uploading}
          />

          {preview && (
            <div className="mt-4">
              <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          {uploading && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-purple-600 transition-all"
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{progress}%</p>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`flex-1 px-4 py-2 rounded-md text-white ${
                uploading ? "bg-gray-400" : "bg-[#691080] hover:bg-[#55105f]"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>

            <button
              onClick={() => {
                if (!uploading) {
                  setFile(null);
                  setPreview(null);
                }
              }}
              className="px-4 py-2 rounded-md border"
              disabled={uploading}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
