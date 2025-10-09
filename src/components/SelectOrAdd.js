// src/components/SelectOrAdd.js
"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function SelectOrAdd({ label, options, collectionName, value, onChange }) {
  const [newItem, setNewItem] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async () => {
    if (!newItem) return;
    const docRef = await addDoc(collection(db, collectionName), { name: newItem });
    onChange(docRef.id);
    setNewItem("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-1">
      <label className="font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name || opt.id}
          </option>
        ))}
      </select>
      {showAdd ? (
        <div className="flex gap-2 mt-1">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`New ${label} name`}
            className="flex-1 border rounded px-2 py-1"
          />
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="text-blue-600 text-sm mt-1 underline"
        >
          + Add new {label}
        </button>
      )}
    </div>
  );
}
