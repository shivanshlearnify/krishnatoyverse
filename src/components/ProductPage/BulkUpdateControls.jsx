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
  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">
      <input
        type="text"
        placeholder="Enter word to match (e.g. Dove)"
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
        className="border p-2 rounded-md flex-1 min-w-[200px]"
      />
      <select
        value={fieldToUpdate}
        onChange={(e) => setFieldToUpdate(e.target.value)}
        className="border p-2 rounded-md"
      >
        <option value="brand">brand</option>
        <option value="category">category</option>
        <option value="group">group</option>
        <option value="subcategory">subcategory</option>
      </select>
      <input
        type="text"
        placeholder="New value (e.g. Dove)"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        className="border p-2 rounded-md w-40"
      />
      <button
        onClick={onPreview}
        disabled={updating}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        {updating ? "Checking..." : "Preview"}
      </button>
      {previewResults.length > 0 && (
        <button
          onClick={onConfirm}
          disabled={updating}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          {updating ? "Updating..." : "Confirm Update"}
        </button>
      )}
    </div>
  );
}
