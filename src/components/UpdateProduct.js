// src/components/UpdateProduct.js
"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollectionsData } from "@/hooks/useCollectionsData";
import { SelectOrAdd } from "@/components/SelectOrAdd";

export default function UpdateProduct({ product, onClose }) {
  const { brands, categories, subcategories, groups } = useCollectionsData();
  const [form, setForm] = useState({
    brand: product.brand || "",
    category: product.category || "",
    subCategory: product.subCategory || "",
    group: product.group || "",
  });

  const handleUpdate = async () => {
    try {
      const ref = doc(db, "productCollection", product.id);
      await updateDoc(ref, { ...form, updatedAt: new Date().toISOString() });
      alert("Product updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <SelectOrAdd
        label="Brand"
        options={brands}
        collectionName="brands"
        value={form.brand}
        onChange={(val) => setForm({ ...form, brand: val })}
      />
      <SelectOrAdd
        label="Category"
        options={categories}
        collectionName="categories"
        value={form.category}
        onChange={(val) => setForm({ ...form, category: val })}
      />
      <SelectOrAdd
        label="Subcategory"
        options={subcategories}
        collectionName="subcategories"
        value={form.subCategory}
        onChange={(val) => setForm({ ...form, subCategory: val })}
      />
      <SelectOrAdd
        label="Group"
        options={groups}
        collectionName="groups"
        value={form.group}
        onChange={(val) => setForm({ ...form, group: val })}
      />
      <button
        onClick={handleUpdate}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Update Product
      </button>
    </div>
  );
}
