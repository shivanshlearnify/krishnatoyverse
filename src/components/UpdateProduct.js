"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { doc, updateDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SelectOrAdd } from "@/components/SelectOrAdd";
import { fetchMeta, fetchProductsByField, clearFilteredValue } from "@/redux/adminProductSlice";

export default function UpdateProduct({ product, onClose }) {
  const dispatch = useDispatch();
  const meta = useSelector((s) => s.adminProducts.meta) || {};

  const { brands = [], categories = [], subcategories = [], groups = [] } = meta;

  const [form, setForm] = useState({
    brand: "",
    category: "",
    subCategory: "",
    group: "",
  });

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

  useEffect(() => {
    dispatch(fetchMeta("brands"));
    dispatch(fetchMeta("categories"));
    dispatch(fetchMeta("subcategories"));
    dispatch(fetchMeta("groups"));
    dispatch(fetchMeta("supplierCollection"));
    dispatch(fetchMeta("suppinvoCollection"));
  }, [dispatch]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const createMetaIfNotExists = async (collectionName, value) => {
    if (!value || !value.trim()) return;
    const colRef = collection(db, collectionName);
    const q = query(colRef, where("name", "==", value.trim()));
    const snap = await getDocs(q);
    if (!snap.empty) return;
    await addDoc(colRef, { name: value.trim(), createdAt: new Date().toISOString() });
  };

  const handleAddNewOption = async (collectionName, newValue) => {
    await createMetaIfNotExists(collectionName, newValue);
    dispatch(fetchMeta(collectionName));
  };

  const handleUpdate = async () => {
    try {
      // Ensure meta docs exist
      await Promise.all([
        createMetaIfNotExists("brands", form.brand),
        createMetaIfNotExists("categories", form.category),
        createMetaIfNotExists("subcategories", form.subCategory),
        createMetaIfNotExists("groups", form.group),
      ]);

      // Update product document
      const ref = doc(db, "productCollection", product.id);
      await updateDoc(ref, {
        brand: form.brand || "",
        category: form.category || "",
        subCategory: form.subCategory || "",
        group: form.group || "",
        updatedAt: new Date().toISOString(),
      });

      // ✅ Clear only the updated cached values and refetch
      if (form.brand) {
        dispatch(clearFilteredValue({ field: "brand", value: form.brand }));
        dispatch(fetchProductsByField({ field: "brand", value: form.brand }));
      }
      if (form.category) {
        dispatch(clearFilteredValue({ field: "category", value: form.category }));
        dispatch(fetchProductsByField({ field: "category", value: form.category }));
      }
      if (form.subCategory) {
        dispatch(clearFilteredValue({ field: "subCategory", value: form.subCategory }));
        dispatch(fetchProductsByField({ field: "subCategory", value: form.subCategory }));
      }
      if (form.group) {
        dispatch(clearFilteredValue({ field: "group", value: form.group }));
        dispatch(fetchProductsByField({ field: "group", value: form.group }));
      }

      alert("✅ Product updated successfully");
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("❌ Error updating product");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <SelectOrAdd
        label="Brand"
        collectionName="brands"
        options={brands.map((b) => b.name)}
        value={form.brand}
        onChange={(v) => handleChange("brand", v)}
        onAddNew={(v) => handleAddNewOption("brands", v)}
      />
      <SelectOrAdd
        label="Category"
        collectionName="categories"
        options={categories.map((c) => c.name)}
        value={form.category}
        onChange={(v) => handleChange("category", v)}
        onAddNew={(v) => handleAddNewOption("categories", v)}
      />
      <SelectOrAdd
        label="Subcategory"
        collectionName="subcategories"
        options={subcategories.map((sc) => sc.name)}
        value={form.subCategory}
        onChange={(v) => handleChange("subCategory", v)}
        onAddNew={(v) => handleAddNewOption("subcategories", v)}
      />
      <SelectOrAdd
        label="Group"
        collectionName="groups"
        options={groups.map((g) => g.name)}
        value={form.group}
        onChange={(v) => handleChange("group", v)}
        onAddNew={(v) => handleAddNewOption("groups", v)}
      />
      <div className="pt-4">
        <button
          onClick={handleUpdate}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Update Product
        </button>
      </div>
    </div>
  );
}
