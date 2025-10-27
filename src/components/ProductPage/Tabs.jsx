export default function Tabs({
  collections,
  activeTab,
  setActiveTab,
  tabCounts,
  setSelectedProduct,
  setPreviewResults,
}) {
  return (
    <div className="flex gap-3 mb-6 border-b pb-2 flex-wrap">
      {collections.map((tab) => (
        <button
          key={tab.key}
          onClick={() => {
            setActiveTab(tab.key);
            setSelectedProduct(null);
            setPreviewResults([]);
          }}
          className={`px-4 py-2 rounded-t-md font-medium flex items-center gap-2 ${
            activeTab === tab.key
              ? "bg-pink-500 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {tab.name}
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              activeTab === tab.key
                ? "bg-white text-pink-800"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            {tabCounts[tab.key]}
          </span>
        </button>
      ))}
    </div>
  );
}
