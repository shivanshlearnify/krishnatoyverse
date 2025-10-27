export default function PreviewList({ previewResults }) {
  if (!previewResults.length) return null;

  return (
    <div className="bg-gray-50 border rounded-md p-3 my-3">
      <p className="font-semibold text-gray-700 mb-2">
        {previewResults.length} matching items:
      </p>
      <ul className="max-h-40 overflow-y-auto text-sm text-gray-600">
        {previewResults.map((item) => (
          <li key={item.id}>
            • {item.name} ({item.collection}) → old:{" "}
            <span className="text-red-600">{item.oldValue || "none"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
