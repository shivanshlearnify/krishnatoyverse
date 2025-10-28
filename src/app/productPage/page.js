"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllData } from "@/redux/productSlice";

import UpdateProduct from "@/components/UpdateProduct";
import Tabs from "@/components/ProductPage/Tabs";
import BulkUpdateControls from "@/components/ProductPage/BulkUpdateControls";
import PreviewList from "@/components/ProductPage/PreviewList";

import { getActiveData, getTabCounts } from "@/utils/dataHelpers";
import { handlePreview, handleConfirmUpdate } from "@/utils/handleBulkActions";

const collections = [
  { name: "Product Collection", key: "productCollection" },
  { name: "Group", key: "groups" },
  { name: "Brand", key: "brands" },
  { name: "Category", key: "categories" },
  { name: "Subcategory", key: "subcategories" },
];

export default function ProductPage() {
  const dispatch = useDispatch();
  const dataState = useSelector((state) => state.productData);

  const {
    productCollection,
    groups,
    brands,
    categories,
    subcategories,
    loading,
  } = dataState || {};

  // main tab (for top section: controls, preview, etc.)
  const [activeTab, setActiveTab] = useState(collections[0].key);

  // browse tab (for the grouped browser UI). Keeps browsing isolated from top tabs.
  const [browseTab, setBrowseTab] = useState("category");

  const [selectedProduct, setSelectedProduct] = useState(null);

  // Bulk update states
  const [searchWord, setSearchWord] = useState("");
  const [fieldToUpdate, setFieldToUpdate] = useState("brand");
  const [newValue, setNewValue] = useState("");
  const [previewResults, setPreviewResults] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Grouped data states
  const [selectedValue, setSelectedValue] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    dispatch(fetchAllData());
  }, [dispatch]);

  const data = getActiveData(activeTab, dataState);
  const tabCounts = getTabCounts(dataState);

  // Build groupedData once (category, brand, group, subCategory)
  const groupedData = useMemo(() => {
    // ensure we have an array, otherwise return empty buckets
    const list = Array.isArray(productCollection) ? productCollection : [];
    const buckets = { category: {}, brand: {}, group: {}, subCategory: {} };

    list.forEach((item) => {
      // Use the exact keys used in your product objects.
      // If your DB uses lowercase 'subcategory' instead of 'subCategory' adjust here.
      const mappingKeys = ["category", "brand", "group", "subCategory"];

      mappingKeys.forEach((k) => {
        const val = item[k];
        if (val) {
          if (!buckets[k][val]) buckets[k][val] = [];
          buckets[k][val].push(item);
        }
      });
    });

    return buckets;
  }, [productCollection]);

  // Preview & Confirm handlers (keep your implementations)
  const previewHandler = () =>
    handlePreview({
      activeTab,
      searchWord,
      fieldToUpdate,
      newValue,
      setUpdating,
      setPreviewResults,
    });

  const confirmHandler = () =>
    handleConfirmUpdate({
      activeTab,
      searchWord,
      fieldToUpdate,
      newValue,
      previewResults,
      setUpdating,
      dispatch,
      setPreviewResults,
    });

  return (
    <div className="p-6 flex gap-6 relative">
      {/* Left Section */}
      <div className="flex-1">
        <Tabs
          collections={collections}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabCounts={tabCounts}
          setSelectedProduct={setSelectedProduct}
          setPreviewResults={setPreviewResults}
        />

        <BulkUpdateControls
          searchWord={searchWord}
          setSearchWord={setSearchWord}
          fieldToUpdate={fieldToUpdate}
          setFieldToUpdate={setFieldToUpdate}
          newValue={newValue}
          setNewValue={setNewValue}
          previewResults={previewResults}
          updating={updating}
          onPreview={previewHandler}
          onConfirm={confirmHandler}
        />

        <PreviewList previewResults={previewResults} />

        {/* 🔹 Category / Brand / Group / Subcategory Browser */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Browse Products
          </h2>

          {/* Tabs for choosing grouping (uses browseTab, not activeTab) */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["category", "brand", "group", "subCategory"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedValue(null);
                  setBrowseTab(tab);
                }}
                className={`px-4 py-2 rounded-lg border text-sm capitalize transition ${
                  browseTab === tab
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Display grouped items safely */}
          {!selectedValue ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {groupedData?.[browseTab] &&
              Object.keys(groupedData[browseTab] || {}).length > 0 ? (
                Object.keys(groupedData[browseTab]).map((value) => (
                  <div
                    key={value}
                    onClick={() => setSelectedValue(value)}
                    className="p-3 border rounded-lg shadow-sm hover:shadow-md cursor-pointer transition bg-white text-center"
                  >
                    <h3 className="font-medium text-gray-800 truncate">{value}</h3>
                    <p className="text-xs text-gray-500">
                      {groupedData[browseTab][value]?.length || 0} items
                    </p>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-gray-500 text-center">
                  No data found for this section.
                </p>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedValue(null)}
                className="mb-4 text-blue-600 hover:underline text-sm"
              >
                ← Back
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(groupedData?.[browseTab]?.[selectedValue] || []).map((item) => (
                  <div
                    key={item.id}
                    className="border p-4 rounded-lg shadow hover:shadow-md cursor-pointer"
                    onClick={() => setSelectedProduct(item)}
                  >
                    <h2 className="font-semibold text-gray-800">{item.name}</h2>
                    <p className="text-sm text-gray-600">Code: {item.code}</p>
                    <p className="text-sm text-gray-600">MRP: ₹{item.mrp}</p>
                    <p className="text-sm text-gray-600">Rate: ₹{item.rate}</p>
                    <p className="text-sm text-gray-600">Brand: {item.brand}</p>
                    <p className="text-sm text-gray-600">Category: {item.category}</p>
                    <p className="text-sm text-gray-600">Group: {item.group}</p>
                    <p className="text-sm text-gray-600">
                      Subcategory: {item.subCategory}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Sliding Edit Panel */}
      {selectedProduct && (
        <>
          <div className="fixed inset-y-0 right-0 w-full md:w-1/3 bg-white shadow-xl z-50">
            <div className="p-6 flex flex-col h-full">
              <button
                onClick={() => setSelectedProduct(null)}
                className="self-end text-gray-600 hover:text-black mb-4"
              >
                ✖
              </button>
              <h2 className="text-xl font-semibold text-center mb-4">
                Edit Product
              </h2>
              <UpdateProduct
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
              />
            </div>
          </div>

          {/* Mobile Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSelectedProduct(null)}
          ></div>
        </>
      )}
    </div>
  );
}
