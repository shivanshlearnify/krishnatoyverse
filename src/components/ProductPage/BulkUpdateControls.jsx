"use client";

import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import debounce from "lodash.debounce";
import {
  fetchMeta,
  searchProductsByNameOrBarcode,
} from "@/redux/adminProductSlice";

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const [availableOptions, setAvailableOptions] = useState([]);
  const [customMode, setCustomMode] = useState(false);

  const fieldToCollection = {
    brand: "brands",
    category: "categories",
    subCategory: "subcategories",
    group: "groups",
    supplier: "supplierCollection",
    suppinvo: "suppinvoCollection",
  };

  // Load all meta initially
  useEffect(() => {
    dispatch(fetchMeta("brands"));
    dispatch(fetchMeta("categories"));
    dispatch(fetchMeta("subcategories"));
    dispatch(fetchMeta("groups"));
    dispatch(fetchMeta("supplierCollection"));
    dispatch(fetchMeta("suppinvoCollection"));
  }, [dispatch]);

  // Load available options
  useEffect(() => {
    const colName = fieldToCollection[fieldToUpdate];
    if (!colName) return setAvailableOptions([]);

    const list = meta?.[colName] || [];
    const names = list.map((i) => i?.name || i?.supplier || i?.suppinvo).filter(Boolean);

    setAvailableOptions(names);
    setCustomMode(false);
    setNewValue("");
  }, [fieldToUpdate, meta, setNewValue]);

  // Create new meta value (brand/category/group/etc)
  const createIfNotExists = async (collectionName, value) => {
    if (!value.trim()) return;

    const colRef = collection(db, collectionName);
    const q = query(colRef, where("name", "==", value.trim()));
    const snap = await getDocs(q);

    if (!snap.empty) return;

    await addDoc(colRef, {
      name: value.trim(),
      createdAt: Date.now(),
    });

    dispatch(fetchMeta(collectionName));
  };

  const handleAddNewValue = async () => {
    if (!newValue.trim()) return;
    const col = fieldToCollection[fieldToUpdate];

    if (col) {
      await createIfNotExists(col, newValue.trim());
      setAvailableOptions((p) => [...p, newValue.trim()]);
      setCustomMode(false);
    }
  };

  // ----------------------------------------------------
  // 🔍 FIXED SEARCH (same as ProductPage search system)
  // ----------------------------------------------------

  const [localSearchResults, setLocalSearchResults] = useState([]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (term) => {
        if (!term.trim()) {
          setLocalSearchResults([]);
          onPreview([]); // clear preview results
          return;
        }

        const res = await dispatch(
          searchProductsByNameOrBarcode({
            term,
            limitResults: 100,
          })
        );

        const data = res?.payload?.data || [];
        setLocalSearchResults(data);
        onPreview(data); // send results to parent
      }, 400),
    [dispatch]
  );

  useEffect(() => {
    debouncedSearch(searchWord);
    return () => debouncedSearch.cancel();
  }, [searchWord, debouncedSearch]);

  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">

      {/* Search input */}
      <input
        type="text"
        placeholder="Enter word to match (e.g. Dove)"
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
        className="border p-2 rounded-md flex-1 min-w-[220px]"
      />

      {/* Field selector */}
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

      {/* Value selector */}
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
          <option value="">Select value</option>
          {availableOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
          <option value="__custom__">➕ Create new…</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter new value"
            value={newValue}
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

      {/* Preview Button */}
      <button
        onClick={() => onPreview(localSearchResults)}
        disabled={updating}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        {updating ? "Checking..." : "Preview"}
      </button>

      {/* Confirm Button */}
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
  );
}
