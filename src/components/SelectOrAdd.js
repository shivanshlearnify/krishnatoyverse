"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function SelectOrAdd({
  label,
  options = [],
  value,
  onChange,
  collectionName,
  onAddNew,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState("");

  const handleAdd = async () => {
    if (!newItem.trim()) return;

    try {
      // Add new value in Firestore
      await addDoc(collection(db, collectionName), { name: newItem });

      // ✅ Instantly show in dropdown
      onAddNew?.(newItem);
      setShowAdd(false);
      setNewItem("");
      alert(`${label} added successfully ✅`);
    } catch (e) {
      console.error(e);
      alert("❌ Failed to add new value");
    }
  };

  return (
    <div className="space-y-1">
      <label className="font-medium">{label}</label>

      {!showAdd ? (
        <select
          value={value || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "__custom__") {
              setShowAdd(true);
            } else {
              onChange(val);
            }
          }}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select {label}</option>
          {options.map((opt, idx) => (
            <option key={`${opt}-${idx}`} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__custom__">➕ Create new...</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`New ${label}`}
            className="flex-1 border rounded px-2 py-1"
          />
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
