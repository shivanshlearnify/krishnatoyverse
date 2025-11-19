export default function PreviewList({ previewResults }) {
  if (!previewResults || !previewResults.length) return null;

  return (
    <div className="bg-gray-50 border rounded-md p-3 my-3">
      <p className="font-semibold text-gray-700 mb-2">
        {previewResults.length} products will be updated:
      </p>

      <ul className="max-h-40 overflow-y-auto text-sm text-gray-700 space-y-1">
        {previewResults.map((item) => (
          <li key={item.id}>
            • {item.name}  
            <span className="text-gray-500"> — {item.field}</span>
            :{" "}
            <span className="text-red-600">{item.oldValue || "none"}</span>
            {" → "}
            <span className="text-green-600">{item.newValue}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
