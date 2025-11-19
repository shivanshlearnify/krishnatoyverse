"use client";

import { useState, useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import { useDispatch, useSelector } from "react-redux";
import { searchProductsByNameOrBarcode } from "@/redux/adminProductSlice";

export default function ImageUploadModal({ onSelect, onClose }) {
  const dispatch = useDispatch();
  const admin = useSelector((s) => s.adminProducts);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  // 🔥 Debounced Firestore Search (copied from ProductPage)
  const debouncedSearch = useMemo(
    () =>
      debounce(async (term) => {
        if (!term || term.trim().length === 0) {
          setResults([]);
          return;
        }

        // dispatch same search thunk
        const res = await dispatch(
          searchProductsByNameOrBarcode({
            term,
            limitResults: 50,
          })
        );

        const latest =
          res.payload?.data ||
          (admin.filtered.search && admin.filtered.search.last) ||
          [];

        setResults(latest);
      }, 400),
    [dispatch, admin.filtered]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Search Product to Upload Images
        </h2>

        {/* 🔎 Search Input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product name or barcode…"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black mb-4"
        />

        {/* Results */}
        {admin.loadingFiltered ? (
          <p className="text-gray-500 text-center">Searching…</p>
        ) : results.length > 0 ? (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {results.map((item) => (
              <div
                key={item.id || item.code}
                className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Barcode: {item.barcode || "N/A"}
                  </p>
                </div>

                <button className="px-3 py-1 bg-black text-white rounded">
                  Select
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center mt-6">
            Start typing to search products…
          </p>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-gray-600 hover:bg-black text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
