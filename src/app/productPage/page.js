"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllData } from "@/redux/productSlice";

import debounce from "lodash.debounce";
import UpdateProduct from "@/components/UpdateProduct";
import BulkUpdateControls from "@/components/ProductPage/BulkUpdateControls";
import PreviewList from "@/components/ProductPage/PreviewList";

import { getActiveData, getTabCounts } from "@/utils/dataHelpers";
import { handlePreview, handleConfirmUpdate } from "@/utils/handleBulkActions";

// 🔹 Firebase imports
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { storage, db } from "@/lib/firebase"; // adjust path if needed

const collections = [
  { name: "Product Collection", key: "productCollection" },
  { name: "Group", key: "groups" },
  { name: "Brand", key: "brands" },
  { name: "Category", key: "categories" },
  { name: "Subcategory", key: "subcategories" },
  { name: "Supplier", key: "suppliers" },
];

export default function ProductPage() {
  const dispatch = useDispatch();
  const dataState = useSelector((state) => state.productData);
  const { productCollection, groups, brands, categories, subcategories, loading } =
    dataState || {};

  // 🔹 States
  const [activeTab, setActiveTab] = useState(collections[0].key);
  const [browseTab, setBrowseTab] = useState("category");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchWord, setSearchWord] = useState("");
  const [fieldToUpdate, setFieldToUpdate] = useState("brand");
  const [newValue, setNewValue] = useState("");
  const [previewResults, setPreviewResults] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);

  // 🔹 Search-specific
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 🔹 Fetch data initially
  useEffect(() => {
    dispatch(fetchAllData());
  }, [dispatch]);

  const data = getActiveData(activeTab, dataState);
  const tabCounts = getTabCounts(dataState);

  // 🔹 Debounced Search Handler
  const handleSearch = useMemo(
    () =>
      debounce((term) => {
        if (!term) {
          setFilteredProducts(productCollection || []);
          return;
        }
        const lowerTerm = term.toLowerCase();
        const filtered = (productCollection || []).filter(
          (p) =>
            p?.name?.toLowerCase().includes(lowerTerm) ||
            p?.barcode?.toLowerCase?.()?.includes(lowerTerm)
        );
        setFilteredProducts(filtered);
      }, 400),
    [productCollection]
  );

  // 🔹 Trigger search
  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  // 🔹 Grouped Data for Browsing
  const groupedData = useMemo(() => {
    const list = Array.isArray(productCollection) ? productCollection : [];
    const buckets = {
      category: {},
      brand: {},
      group: {},
      subCategory: {},
      supplier: {},
    };

    list.forEach((item) => {
      ["category", "brand", "group", "subCategory", "supplier"].forEach((key) => {
        const val = item[key];
        if (val) {
          if (!buckets[key][val]) buckets[key][val] = [];
          buckets[key][val].push(item);
        }
      });
    });
    return buckets;
  }, [productCollection]);

  // 🔹 Bulk Update Handlers
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

  // 🔹 Upload Handler
  const handleUpload = async (productId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      const storageRef = ref(storage, `products/${productId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const productRef = doc(db, "productCollection", productId);
      await updateDoc(productRef, { images: arrayUnion(url) });

      alert("✅ Image uploaded successfully!");
      dispatch(fetchAllData()); // refresh data after upload
    } catch (err) {
      console.error(err);
      alert("❌ Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Displayed products
  const displayedProducts =
    searchTerm.trim() !== "" ? filteredProducts : productCollection || [];

  return (
    <div className="p-6 flex gap-6 relative">
      <div className="flex-1">
        {/* 🔹 Bulk Update Controls */}
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

        {/* 🔹 Preview Results */}
        <PreviewList previewResults={previewResults} />

        {/* 🔹 Product Browser */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Browse Products
          </h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["all", "category", "brand", "group", "subCategory", "supplier"].map(
              (tab) => (
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
                  {tab === "all"
                    ? "All Products"
                    : tab === "subCategory"
                    ? "Subcategory"
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>

          {/* 🔹 All Products */}
          {browseTab === "all" ? (
            <div>
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {searchTerm
                    ? `Search Results (${displayedProducts.length})`
                    : `All Products (${displayedProducts.length})`}
                </h3>
                {/* 🔹 Search Input */}
                <div className="mt-6 mb-4">
                  <input
                    type="text"
                    placeholder="Search by name or barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {displayedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {displayedProducts.map((item) => (
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
                      <p className="text-sm text-gray-600">
                        Category: {item.category}
                      </p>
                      <p className="text-sm text-gray-600">Group: {item.group}</p>
                      <p className="text-sm text-gray-600">
                        Subcategory: {item.subCategory}
                      </p>
                      <p className="text-sm text-gray-600">
                        Supplier: {item.supplier}
                      </p>
                      <label className="block mt-3">
                        <span className="px-3 py-1 bg-blue-500 text-white rounded cursor-pointer">
                          Add Image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          hidden
                          onChange={(e) => handleUpload(item.id, e)}
                        />
                      </label>
                      {uploading && (
                        <p className="text-blue-500 mt-2 text-sm">Uploading...</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-6">
                  No products found.
                </p>
              )}
            </div>
          ) : !selectedValue ? (
            // 🔹 Grouped View
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {groupedData?.[browseTab] &&
              Object.keys(groupedData[browseTab] || {}).length > 0 ? (
                Object.keys(groupedData[browseTab]).map((value) => (
                  <div
                    key={value}
                    onClick={() => setSelectedValue(value)}
                    className="p-3 border rounded-lg shadow-sm hover:shadow-md cursor-pointer bg-white text-center"
                  >
                    <h3 className="font-medium text-gray-800 truncate">{value}</h3>
                    <p className="text-xs text-gray-500">
                      {groupedData[browseTab][value]?.length || 0} items
                    </p>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-gray-500 text-center">
                  No data found.
                </p>
              )}
            </div>
          ) : (
            // 🔸 Products inside a selected group
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
                    <p className="text-sm text-gray-600">
                      Category: {item.category}
                    </p>
                    <p className="text-sm text-gray-600">Group: {item.group}</p>
                    <p className="text-sm text-gray-600">
                      Subcategory: {item.subCategory}
                    </p>
                    <p className="text-sm text-gray-600">
                      Supplier: {item.supplier}
                    </p>
                    <label className="block mt-3">
                      <span className="px-3 py-1 bg-blue-500 text-white rounded cursor-pointer">
                        Add Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                        onChange={(e) => handleUpload(item.id, e)}
                      />
                    </label>
                    {uploading && (
                      <p className="text-blue-500 mt-2 text-sm">Uploading...</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Right Panel for Editing */}
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
              <p className="text-center text-gray-700 font-medium mb-4">
                {selectedProduct?.name || ""}
              </p>
              <UpdateProduct
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
              />
            </div>
          </div>

          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSelectedProduct(null)}
          ></div>
        </>
      )}
    </div>
  );
}
