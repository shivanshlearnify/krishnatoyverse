"use client";

export default function PreviewList({ previewResults = [], onClose }) {
  if (!Array.isArray(previewResults) || previewResults.length === 0) return null;

  return (
    <div className="bg-gray-50 border rounded-md p-3 my-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-800">
          {previewResults.length} product
          {previewResults.length > 1 ? "s" : ""} will be updated:
        </p>

        <button
          onClick={onClose}
          className="text-sm text-gray-600 hover:text-black hover:underline transition"
        >
          Close
        </button>
      </div>

      {/* List */}
      <ul className="max-h-60 overflow-y-auto text-sm text-gray-700 space-y-2 pr-1">
        {previewResults.map((item) => {
          const name = item?.name || "Unnamed Product";
          const field = item?.field || "field";
          const oldVal = item?.oldValue ?? "none";
          const newVal = item?.newValue ?? "";

          return (
            <li
              key={item?.id}
              className="flex items-start gap-2 border-b pb-2 last:border-none"
            >
              <div className="pt-1">•</div>

              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{name}</span>
                  <span className="text-gray-500 text-xs">({field})</span>
                </div>

                <div className="text-xs mt-1">
                  <span className="text-red-600 font-medium">{oldVal}</span>
                  {" → "}
                  <span className="text-green-600 font-medium">{newVal}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
