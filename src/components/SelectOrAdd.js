"use client";

import { useState } from "react";

export function SelectOrAdd({
  label,
  options = [],
  value,
  onChange,
  onAddNew, // optional callback to handle new item externally
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (!newItem.trim()) return;

    // ✅ Instantly update dropdown and trigger parent callback
    onAddNew?.(newItem);
    onChange(newItem);

    // Reset local UI
    setShowAdd(false);
    setNewItem("");

    alert(`${label} added successfully ✅`);
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
          <button
            onClick={() => setShowAdd(false)}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
