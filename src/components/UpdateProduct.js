"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SelectOrAdd } from "@/components/SelectOrAdd";
import { fetchAllData } from "@/redux/adminProductSlice";

export default function UpdateProduct({ product, onClose }) {
  const dispatch = useDispatch();
  const dataState = useSelector((state) => state.products);

  const [form, setForm] = useState({
    brand: "",
    category: "",
    subCategory: "",
    group: "",
  });

  const [options, setOptions] = useState({
    brand: [],
    category: [],
    subCategory: [],
    group: [],
  });

  // ✅ Reset form whenever product changes
  useEffect(() => {
    if (product) {
      setForm({
        brand: product.brand || "",
        category: product.category || "",
        subCategory: product.subCategory || "",
        group: product.group || "",
      });
    }
  }, [product]);

  // ✅ Fetch latest data once
  useEffect(() => {
    dispatch(fetchAllData());
  }, [dispatch]);

  // ✅ Extract unique options from DB
  useEffect(() => {
    if (!dataState?.productCollection) return;

    const getUnique = (key) => {
      const s = new Set();
      dataState.productCollection.forEach((p) => {
        const val = p[key];
        if (val) s.add(val.trim());
      });
      return [...s];
    };

    setOptions({
      brand: getUnique("brand"),
      category: getUnique("category"),
      subCategory: getUnique("subCategory"),
      group: getUnique("group"),
    });
  }, [dataState]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Update product in Firestore
  const handleUpdate = async () => {
    try {
      const ref = doc(db, "productCollection", product.id);
      await updateDoc(ref, {
        brand: form.brand || "",
        category: form.category || "",
        subCategory: form.subCategory || "",
        group: form.group || "",
        updatedAt: new Date().toISOString(),
      });

      alert("✅ Product updated successfully!");
      dispatch(fetchAllData());
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update product");
    }
  };

  // ✅ When new option added, instantly reflect in dropdown
  const handleAddNewOption = (field, newValue) => {
    setOptions((prev) => ({
      ...prev,
      [field]: [...prev[field], newValue],
    }));
    handleChange(field, newValue);
  };

  return (
    <div className="p-6 space-y-4">
      <SelectOrAdd
        label="Brand"
        options={options.brand}
        value={form.brand}
        onChange={(val) => handleChange("brand", val)}
        collectionName="brands"
        onAddNew={(val) => handleAddNewOption("brand", val)}
      />

      <SelectOrAdd
        label="Category"
        options={options.category}
        value={form.category}
        onChange={(val) => handleChange("category", val)}
        collectionName="categories"
        onAddNew={(val) => handleAddNewOption("category", val)}
      />

      <SelectOrAdd
        label="Subcategory"
        options={options.subCategory}
        value={form.subCategory}
        onChange={(val) => handleChange("subCategory", val)}
        collectionName="subcategories"
        onAddNew={(val) => handleAddNewOption("subCategory", val)}
      />

      <SelectOrAdd
        label="Group"
        options={options.group}
        value={form.group}
        onChange={(val) => handleChange("group", val)}
        collectionName="groups"
        onAddNew={(val) => handleAddNewOption("group", val)}
      />

      <button
        onClick={handleUpdate}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Update Product
      </button>
    </div>
  );
}
