"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { fetchAllData } from "@/redux/productSlice";
import debounce from "lodash.debounce";
import UpdateProduct from "@/components/UpdateProduct";
import BulkUpdateControls from "@/components/ProductPage/BulkUpdateControls";
import PreviewList from "@/components/ProductPage/PreviewList";
import ProductCard from "@/components/ProductPage/ProductCard";

import { getActiveData, getTabCounts } from "@/utils/dataHelpers";
import { handlePreview, handleConfirmUpdate } from "@/utils/handleBulkActions";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";

const collections = [
  { name: "Product Collection", key: "productCollection" },
  { name: "Group", key: "groups" },
  { name: "Brand", key: "brands" },
  { name: "Category", key: "categories" },
  { name: "Subcategory", key: "subcategories" },
  { name: "Supplier", key: "suppliers" },
  { name: "Invoice", key: "suppinvo" },
];

export default function ProductPage() {
  // 🔒 Auth states
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // ✅ Redux setup
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

  // ✅ Local UI states
  const [activeTab, setActiveTab] = useState(collections[0].key);
  const [browseTab, setBrowseTab] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchWord, setSearchWord] = useState("");
  const [fieldToUpdate, setFieldToUpdate] = useState("brand");
  const [newValue, setNewValue] = useState("");
  const [previewResults, setPreviewResults] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 🔐 Check admin login
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsAuthenticated(true);
    } else {
      router.push("/adminlogin");
    }
    setLoadingAuth(false);
  }, [router]);

  // 🔄 Fetch data after authentication
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchAllData());
  }, [dispatch, isAuthenticated]);

  // 🧮 Helpers
  const data = getActiveData(activeTab, dataState);
  const tabCounts = getTabCounts(dataState);

  // 🔍 Debounced Search
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

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  // 📦 Grouped Data
  const groupedData = useMemo(() => {
    const list = Array.isArray(productCollection) ? productCollection : [];
    const buckets = {
      category: {},
      brand: {},
      group: {},
      subCategory: {},
      supplier: {},
      suppinvo: {},
    };

    list.forEach((item) => {
      ["category", "brand", "group", "subCategory", "supplier", "suppinvo"].forEach(
        (key) => {
          const val = item[key];
          if (val) {
            if (!buckets[key][val]) buckets[key][val] = [];
            buckets[key][val].push(item);
          }
        }
      );
    });
    return buckets;
  }, [productCollection]);

  // 🧰 Bulk Update Handlers
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

  // 📤 Image Upload Handler
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
      dispatch(fetchAllData());
    } catch (err) {
      console.error(err);
      alert("❌ Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const displayedProducts =
    searchTerm.trim() !== "" ? filteredProducts : productCollection || [];

  // 🔒 Auth Loading State
  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Checking authentication...
      </div>
    );
  }

  // 🚫 Redirect if not authenticated
  if (!isAuthenticated) return null;

  // ✅ Protected Page Render
  return (
    <div className="p-6 flex gap-6 relative">
      <div className="flex-1">
        {/* Bulk Update Controls */}
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

        {/* Product Browser */}
        <div className="mt-6">
          <div className="flex gap-4 mb-2">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Browse Products
            </h2>
            <Link
              href="/adminPannel"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
            >
              Go to Admin Panel <ArrowRight size={16} />
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["all", "category", "brand", "group", "subCategory", "supplier","suppinvo"].map(
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

          {/* Display Products */}
          {browseTab === "all" ? (
            <div>
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {searchTerm
                    ? `Search Results (${displayedProducts.length})`
                    : `All Products (${displayedProducts.length})`}
                </h3>
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
                    <ProductCard
                      key={item.code}
                      item={item}
                      uploading={uploading}
                      onUpload={handleUpload}
                      onEdit={setSelectedProduct}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-6">
                  No products found.
                </p>
              )}
            </div>
          ) : !selectedValue ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {groupedData?.[browseTab] &&
              Object.keys(groupedData[browseTab] || {}).length > 0 ? (
                Object.keys(groupedData[browseTab]).map((value) => (
                  <div
                    key={value}
                    onClick={() => setSelectedValue(value)}
                    className="p-3 border rounded-lg shadow-sm hover:shadow-md cursor-pointer bg-white text-center"
                  >
                    <h3 className="font-medium text-gray-800 truncate">
                      {value}
                    </h3>
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
            <div>
              <button
                onClick={() => setSelectedValue(null)}
                className="mb-4 text-blue-600 hover:underline text-sm"
              >
                ← Back
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(groupedData?.[browseTab]?.[selectedValue] || []).map(
                  (item) => (
                    <ProductCard
                      key={item.code}
                      item={item}
                      uploading={uploading}
                      onUpload={handleUpload}
                      onEdit={setSelectedProduct}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right-side Edit Panel */}
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
