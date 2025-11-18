"use client";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function BulkUpdateControls({
  searchWord,
  setSearchWord,
  fieldToUpdate,
  setFieldToUpdate,
  newValue,
  setNewValue,
  previewResults,
  updating,
  onPreview,
  onConfirm,
}) {
  // ✅ Correct Redux path (your store already correct)
  const dataState = useSelector((state) => state.adminProducts);

  // Local states
  const [availableOptions, setAvailableOptions] = useState([]);
  const [customMode, setCustomMode] = useState(false);

  // ✅ Map UI field to correct DB field
  const fieldMap = {
    brand: "brand",
    category: "category",
    group: "group",
    subCategory: "subCategory", // ensure matching your DB
    subcategory: "subCategory",
  };

  useEffect(() => {
    if (!dataState?.productCollection) return;

    const mappedField = fieldMap[fieldToUpdate];
    if (!mappedField) {
      setAvailableOptions([]);
      return;
    }

    const uniqueSet = new Set();

    dataState.productCollection.forEach((item) => {
      // Extract value safely
      const val =
        item[mappedField] ||
        item[mappedField.toLowerCase()] ||
        item[mappedField.toUpperCase()];

      if (val) uniqueSet.add(String(val).trim());
    });

    setAvailableOptions([...uniqueSet]);
    setCustomMode(false);
    setNewValue("");
  }, [fieldToUpdate, dataState]);

  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">

      {/* Search Input */}
      <input
        type="text"
        placeholder="Enter word to match (e.g. Dove)"
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
        className="border p-2 rounded-md flex-1 min-w-[200px]"
      />

      {/* Field Selection */}
      <select
        value={fieldToUpdate}
        onChange={(e) => setFieldToUpdate(e.target.value)}
        className="border p-2 rounded-md"
      >
        <option value="brand">brand</option>
        <option value="category">category</option>
        <option value="group">group</option>
        <option value="subCategory">subcategory</option>
      </select>

      {/* Dynamic Value Selector */}
      {!customMode ? (
        <select
          value={newValue}
          onChange={(e) => {
            if (e.target.value === "__custom__") {
              setCustomMode(true);
              setNewValue("");
            } else {
              setNewValue(e.target.value);
            }
          }}
          className="border p-2 rounded-md min-w-[160px]"
        >
          <option value="">Select value</option>
          {availableOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__custom__">➕ Create new...</option>
        </select>
      ) : (
        <input
          type="text"
          placeholder="Enter new value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="border p-2 rounded-md min-w-[160px]"
        />
      )}

      {/* Buttons */}
      <button
        onClick={onPreview}
        disabled={updating}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        {updating ? "Checking..." : "Preview"}
      </button>

      {previewResults.length > 0 && (
        <button
          onClick={onConfirm}
          disabled={updating}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          {updating ? "Updating..." : "Confirm Update"}
        </button>
      )}
    </div>
  );
}
