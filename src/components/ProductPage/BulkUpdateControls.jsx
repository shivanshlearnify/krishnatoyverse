"use client";

import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import debounce from "lodash.debounce";

import { fetchMeta, bulkSearchProducts } from "@/redux/adminProductSlice";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import PreviewList from "./PreviewList";

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
  const dispatch = useDispatch();
  const meta = useSelector((s) => s.adminProducts.meta);

  const [isSearching, setIsSearching] = useState(false);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [customMode, setCustomMode] = useState(false);
  const [localPreview, setLocalPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // MAPPING
  const fieldToCollection = {
    brand: "brands",
    category: "categories",
    group: "groups",
    subCategory: "subcategories",
    supplier: "supplierCollection",
    suppinvo: "suppinvoCollection",
  };

  // -------------------------------
  // 🔥 LOAD META ONLY ONCE
  // -------------------------------
  useEffect(() => {
    Object.values(fieldToCollection).forEach((col) => dispatch(fetchMeta(col)));
  }, [dispatch]);

  // -------------------------------
  // 🔥 UPDATE DROPDOWN VALUES
  // -------------------------------
  useEffect(() => {
    const col = fieldToCollection[fieldToUpdate];
    if (!col) {
      setAvailableOptions([]);
      return;
    }

    const list = meta[col] || [];

    const names = list
      .map((i) => i.name || i.supplier || i.suppinvo)
      .filter(Boolean);

    setAvailableOptions(names);
    setCustomMode(false);
    setNewValue("");
  }, [fieldToUpdate, meta, setNewValue]);

  // -------------------------------
  // 🔥 CREATE META IF NOT EXISTS
  // -------------------------------
  const createIfNotExists = async (collectionName, value) => {
    if (!value.trim()) return;

    const colRef = collection(db, collectionName);
    const q = query(colRef, where("name", "==", value.trim()));
    const snap = await getDocs(q);

    if (!snap.empty) return;

    await addDoc(colRef, { name: value.trim(), createdAt: Date.now() });
    dispatch(fetchMeta(collectionName));
  };

  const handleAddNewValue = async () => {
    if (!newValue.trim()) return;

    const col = fieldToCollection[fieldToUpdate];

    await createIfNotExists(col, newValue.trim());
    setAvailableOptions((prev) => [...prev, newValue.trim()]);
    setCustomMode(false);
  };

  // -------------------------------
  // 🔥 DEBOUNCED SEARCH (STABLE!)
  // -------------------------------
  const debouncedSearchRef = useRef(
    debounce(async (term, field, value) => {
      if (!term.trim()) {
        setLocalPreview([]);
        onPreview([]);
        setIsSearching(false);
        return;
      }

      try {
        const res = await dispatch(
          bulkSearchProducts({
            term,
            limitResults: 500,
          })
        );

        const data = res?.payload?.data || [];

        const formatted = data.map((p) => ({
          id: p.id,
          name: p.name || p.productName || "Unnamed Product",
          field,
          oldValue: p[field] || "none",
          newValue: value,
        }));

        setLocalPreview(formatted);
        onPreview(formatted);
      } catch (err) {
        console.error("Bulk search error →", err);
        setLocalPreview([]);
        onPreview([]);
      }

      setIsSearching(false);
    }, 350)
  );

  const debouncedSearch = debouncedSearchRef.current;

  // -------------------------------
  // 🔥 TRIGGER SEARCH ONLY WHEN TYPING
  // -------------------------------
  useEffect(() => {
    if (!searchWord.trim()) {
      setLocalPreview([]);
      onPreview([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debouncedSearch(searchWord, fieldToUpdate, newValue);

    return () => debouncedSearch.cancel();
  }, [searchWord, fieldToUpdate, newValue]);

  // -------------------------------
  // 🔥 SHOW PREVIEW
  // -------------------------------
  const handlePreviewClick = () => {
    if (isSearching) {
      alert("Still processing… please wait.");
      return;
    }

    if (!localPreview.length) {
      alert("No matched products found.");
      setShowPreview(false);
      return;
    }

    setShowPreview(true);
  };

  // -------------------------------
  // 🔥 UI
  // -------------------------------
  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Enter matching word (e.g. Dove)"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          className="border p-2 rounded-md flex-1 min-w-[220px]"
        />

        {/* Field Dropdown */}
        <select
          value={fieldToUpdate}
          onChange={(e) => setFieldToUpdate(e.target.value)}
          className="border p-2 rounded-md"
        >
          <option value="brand">Brand</option>
          <option value="category">Category</option>
          <option value="group">Group</option>
          <option value="subCategory">Subcategory</option>
          <option value="supplier">Supplier</option>
          <option value="suppinvo">Invoice</option>
        </select>

        {/* Select or Add New Value */}
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
            className="border p-2 rounded-md min-w-[180px]"
          >
            <option value="">Select Value</option>

            {availableOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}

            <option value="__custom__">➕ Add New…</option>
          </select>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newValue}
              placeholder="Enter new value"
              onChange={(e) => setNewValue(e.target.value)}
              className="border p-2 rounded-md min-w-[160px]"
            />
            <button
              onClick={handleAddNewValue}
              className="bg-purple-600 text-white px-3 py-1 rounded-md"
            >
              Add
            </button>
            <button
              onClick={() => {
                setCustomMode(false);
                setNewValue("");
              }}
              className="border px-3 py-1 rounded-md"
            >
              Cancel
            </button>
          </div>
        )}

        {/* PREVIEW BUTTON */}
        <button
          onClick={handlePreviewClick}
          disabled={isSearching || updating}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          {isSearching ? (
            <span className="animate-pulse text-sm">Searching…</span>
          ) : (
            <span>Preview</span>
          )}

          {!!localPreview.length && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">
              {localPreview.length}
            </span>
          )}
        </button>

        {/* CONFIRM BUTTON */}
        {previewResults?.length > 0 && (
          <button
            onClick={onConfirm}
            disabled={updating}
            className="bg-green-600 text-white px-4 py-2 rounded-md"
          >
            {updating ? "Updating..." : "Confirm Update"}
          </button>
        )}
      </div>

      {/* PREVIEW LIST */}
      <div className="mt-3">
        {showPreview && (
          <PreviewList
            previewResults={previewResults}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  );
}
