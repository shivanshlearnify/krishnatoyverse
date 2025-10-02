"use client";
import { useState } from "react";
import BarcodeScanner from "./BarcodeScanner";

export default function BarcodeSearch({ searchQuery, setSearchQuery }) {
  const [mode, setMode] = useState("type"); // "type" | "scan"

  return (
    <div className="space-y-3">
      {/* Toggle Buttons */}
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded ${
            mode === "type" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("type")}
        >
          Type Barcode
        </button>
        <button
          className={`px-3 py-1 rounded ${
            mode === "scan" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("scan")}
        >
          Scan with Camera
        </button>
      </div>

      {/* Type Mode */}
      {mode === "type" && (
        <input
          type="text"
          placeholder="Enter Barcode"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full"
        />
      )}

      {/* Scan Mode */}
      {mode === "scan" && (
        <BarcodeScanner onScan={(code) => setSearchQuery(code)} />
      )}
    </div>
  );
}
