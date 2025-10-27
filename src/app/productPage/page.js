"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllData } from "@/redux/productSlice";

import UpdateProduct from "@/components/UpdateProduct";
import Tabs from "@/components/ProductPage/Tabs";
import BulkUpdateControls from "@/components/ProductPage/BulkUpdateControls";
import PreviewList from "@/components/ProductPage/PreviewList";

import { getActiveData, getNameById, getTabCounts } from "@/utils/dataHelpers";
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
  } = dataState;

  const [activeTab, setActiveTab] = useState(collections[0].key);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Bulk update states
  const [searchWord, setSearchWord] = useState("");
  const [fieldToUpdate, setFieldToUpdate] = useState("brand");
  const [newValue, setNewValue] = useState("");
  const [previewResults, setPreviewResults] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Fetch all data on load
  useEffect(() => {
    dispatch(fetchAllData());
  }, [dispatch]);

  const data = getActiveData(activeTab, dataState);
  const tabCounts = getTabCounts(dataState);

  // 🔹 Step 1: Preview & Step 2: Confirm
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
console.log(data);

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

        {/* Products Grid */}
        {loading ? (
          <p>Loading...</p>
        ) : data?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((item) => (
              <div
                key={item.id}
                className="border p-4 rounded-lg shadow hover:shadow-md cursor-pointer"
                onClick={() => setSelectedProduct(item)}
              >
                <h2 className="font-semibold">{item.name}</h2>
                {activeTab === "productCollection" && (
                  <>
                    <p>Brand: {item.brand}</p>
                    <p>Category: {item.category}</p>
                    <p>Group: {item.group}</p>
                    <p>
                      Subcategory: {item.subcategory}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No items found.</p>
        )}
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
