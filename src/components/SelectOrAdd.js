"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export function SelectOrAdd({
  label,
  options = [],
  value,
  onChange,
  collectionName,
  onAddNew,
}) {
  const [showInput, setShowInput] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Firestore Add Logic
  const saveToFirestore = async (rawName) => {
    const name = rawName.trim().toUpperCase();
    if (!name) return false;

    const ref = collection(db, collectionName);
    const q = query(ref, where("name", "==", name));
    const snap = await getDocs(q);

    if (!snap.empty) {
      alert(`${label} already exists ❗`);
      return false;
    }

    await addDoc(ref, {
      name,
      createdAt: Date.now(),
    });

    return name;
  };

  // 🔥 ADD Handler
  const handleAdd = async () => {
    const name = newValue.trim();
    if (!name) return;

    setLoading(true);
    const saved = await saveToFirestore(name);
    setLoading(false);

    if (!saved) return;

    onAddNew?.(saved);
    onChange(saved);

    setNewValue("");
    setShowInput(false);

    alert(`${label} added successfully ✅`);
  };

  return (
    <div className="space-y-1">
      <label className="font-medium">{label}</label>

      {!showInput ? (
        <select
          value={value || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "__add__") {
              setShowInput(true);
            } else {
              onChange(val);
            }
          }}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select {label}</option>

          {options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}

          <option value="__add__">➕ Create new...</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`New ${label}`}
            className="flex-1 border rounded px-2 py-1"
          />

          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            {loading ? "Saving..." : "Add"}
          </button>

          <button
            onClick={() => setShowInput(false)}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
