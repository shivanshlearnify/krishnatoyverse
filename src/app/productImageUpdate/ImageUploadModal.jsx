"use client";

import React, { useState, useEffect, useRef } from "react";
import { storage, db } from "@/lib/firebase";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function ImageUploadModal({ product, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputRef = useRef(null);

  // Preview effect
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Resize image to reduce memory usage on mobile
  const resizeImage = (file, maxWidth = 1024, maxHeight = 1024) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          0.8
        );
      };
      img.onerror = (err) => reject(err);
      img.src = URL.createObjectURL(file);
    });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setError("Please capture a valid image.");
      return;
    }

    setFile(f);
    setError("");
    setSuccess("");

    // Reset input for multiple captures
    e.target.value = null;
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please capture an image first.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError("");
    setSuccess("");

    try {
      // Resize image before upload
      const resizedFile = await resizeImage(file);

      const timestamp = Date.now();
      const path = `productImages/${product.id}/${timestamp}.jpg`;
      const sRef = storageRef(storage, path);

      const uploadTask = uploadBytesResumable(sRef, resizedFile);

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

          // Append URL to Firestore
          const prodRef = doc(db, "productCollection", product.id);
          await updateDoc(prodRef, { images: arrayUnion(url) });

          if (onUploaded) onUploaded(url);

          // Reset modal state for next upload
          setUploading(false);
          setFile(null);
          setPreview(null);
          setProgress(0);
          setSuccess("✅ Image uploaded successfully!");
        }
      );
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !uploading && onClose()}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg mx-4 rounded-lg shadow-xl z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Image — {product.name}</h2>
          <button
            type="button"
            onClick={() => !uploading && onClose()}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capture Image (camera only)
          </label>

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleFileChange}
            disabled={uploading}
          />

          {/* Trigger button */}
          <button
            type="button"
            className="w-full px-4 py-2 bg-[#691080] text-white rounded-md hover:bg-[#55105f]"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {file ? "Change Image" : "Capture Image"}
          </button>

          {/* Preview */}
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

          {/* Messages */}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          {success && <p className="text-sm text-green-600 mt-2">{success}</p>}

          {/* Progress */}
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

          {/* Upload / Clear buttons */}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`flex-1 px-4 py-2 rounded-md text-white ${
                uploading || !file
                  ? "bg-gray-400"
                  : "bg-[#691080] hover:bg-[#55105f]"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!uploading) {
                  setFile(null);
                  setPreview(null);
                  setError("");
                  setSuccess("");
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
