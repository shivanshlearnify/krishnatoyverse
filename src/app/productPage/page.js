"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation"; // <— IMPORTANT
import debounce from "lodash.debounce";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { arrayUnion } from "firebase/firestore";
import { storage } from "@/lib/firebase";

import BulkUpdateControls from "@/components/ProductPage/BulkUpdateControls";
import ProductCard from "@/components/ProductPage/ProductCard";
import UpdateProduct from "@/components/UpdateProduct";

import {
  fetchMeta,
  fetchProductsByField,
  searchProductsByNameOrBarcode,
} from "@/redux/adminProductSlice";

export default function ProductPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const admin = useSelector((s) => s.adminProducts);

  // ---------------------------------------------------------
  // ✅ SAME AUTH SETUP AS ADMIN PANEL
  // ---------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  // UI state
  const [browseTab, setBrowseTab] = useState("all");
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Bulk update state (optional)
  const [searchWord, setSearchWord] = useState("");
  const [fieldToUpdate, setFieldToUpdate] = useState("brand");
  const [newValue, setNewValue] = useState("");
  const [previewResults, setPreviewResults] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      setIsAuthenticated(true);
    } else {
      router.replace("/adminlogin");
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    dispatch(fetchMeta("brands"));
    dispatch(fetchMeta("categories"));
    dispatch(fetchMeta("subcategories"));
    dispatch(fetchMeta("groups"));
    dispatch(fetchMeta("supplierCollection"));
    dispatch(fetchMeta("suppinvoCollection"));
  }, [dispatch]);
  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce(async (term) => {
        if (!term?.trim()) {
          setSearchResults([]);
          return;
        }

        try {
          const res = await dispatch(
            searchProductsByNameOrBarcode({ term, limitResults: 50 })
          );

          // Directly use payload data, fallback to empty array
          const latest = res.payload?.data || [];
          setSearchResults(latest);
        } catch (err) {
          console.error("Search error:", err);
          setSearchResults([]);
        }
      }, 400),
    [dispatch]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const loadingFiltered = admin.loadingFiltered;

  // Load meta once


  // Handle click on a meta value
  const handleValueClick = (field, value) => {
    setSelectedValue(value);
    dispatch(fetchProductsByField({ field, value }));
  };

  // Get meta list for each tab safely
  const getMetaListForTab = (tab) => {
    switch (tab) {
      case "brand":
        return admin.meta.brands || [];
      case "category":
        return admin.meta.categories || [];
      case "group":
        return admin.meta.groups || [];
      case "subCategory":
        return admin.meta.subcategories || [];
      case "supplier":
        return admin.meta.supplierCollection || [];
      case "suppinvo":
        return admin.meta.suppinvoCollection || [];
      default:
        return [];
    }
  };

  // Map meta item to display name
  const getMetaDisplayName = (tab, metaItem) => {
    switch (tab) {
      case "brand":
      case "category":
      case "group":
      case "subCategory":
        return metaItem.name;
      case "supplier":
        return metaItem.supplier;
      case "suppinvo":
        return metaItem.suppinvo;
      default:
        return "";
    }
  };

  const productsForSelected = (field, value) => {
    const fieldData = admin.filtered[field] || {};
    // Use safeValue in case value is empty
    const safeValue = value && value.trim() !== "" ? value : "__empty__";
    return fieldData[safeValue]?.products || [];
  };
  const handleConfirmBulkUpdate = async () => {
    if (!previewResults || previewResults.length === 0) {
      alert("No items to update.");
      return;
    }

    if (!newValue?.trim()) {
      alert("Select or enter a new value.");
      return;
    }

    const ok = confirm(
      `Are you sure? This will update ${previewResults.length} products.`
    );
    if (!ok) return;

    try {
      setUpdating(true);

      const updates = previewResults.map(async (item) => {
        console.log(item);

        const docRef = doc(db, "productCollection", item.id);
        return updateDoc(docRef, {
          [fieldToUpdate]: newValue.trim(),
          updatedAt: new Date().toISOString(),
        });
      });

      await Promise.all(updates);

      alert("Bulk update completed!");

      // Refresh meta lists
      dispatch(fetchMeta("brands"));
      dispatch(fetchMeta("categories"));
      dispatch(fetchMeta("subcategories"));
      dispatch(fetchMeta("groups"));
      dispatch(fetchMeta("supplierCollection"));
      dispatch(fetchMeta("suppinvoCollection"));

      // Clear UI
      setSearchWord("");
      setNewValue("");
      setPreviewResults([]);
    } catch (err) {
      console.error("Bulk update error:", err);
      alert("Failed to update products.");
    }

    setUpdating(false);
  };
  const handleUpload = async (productId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create file path
      const storageRef = ref(storage, `products/${productId}/${file.name}`);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get URL
      const downloadURL = await getDownloadURL(storageRef);

      // Add to Firestore images array
      const productRef = doc(db, "productCollection", productId);
      await updateDoc(productRef, {
        images: arrayUnion(downloadURL),
        updatedAt: new Date().toISOString(),
      });

      alert("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    }

    // Clear input for next upload
    e.target.value = "";
  };

  const tabs = [
    { name: "All Products", key: "all" },
    { name: "Brand", key: "brand" },
    { name: "Category", key: "category" },
    { name: "Group", key: "group" },
    { name: "Subcategory", key: "subCategory" },
    { name: "Supplier", key: "supplier" },
    { name: "Invoice", key: "suppinvo" },
  ];

  return (
    <div className="p-6 flex gap-6 relative">
      <div className="flex-1">
        {/* Bulk update panel */}
        <BulkUpdateControls
          searchWord={searchWord}
          setSearchWord={setSearchWord}
          fieldToUpdate={fieldToUpdate}
          setFieldToUpdate={setFieldToUpdate}
          newValue={newValue}
          setNewValue={setNewValue}
          previewResults={previewResults}
          updating={updating}
          onPreview={(items) => setPreviewResults(items)}
          onConfirm={handleConfirmBulkUpdate}
        />

        <div className="mt-6">
          <div className="flex gap-4 mb-2">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Browse Products
            </h2>
            <Link
              href="/adminPannel"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg"
            >
              Go to Admin Panel <ArrowRight size={16} />
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setBrowseTab(t.key);
                  setSelectedValue(null);
                  setSearchTerm("");
                }}
                className={`px-4 py-2 rounded-lg border text-sm capitalize transition ${
                  browseTab === t.key
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Content area */}
          {browseTab === "all" ? (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {searchTerm
                    ? `Search Results (${searchResults.length})`
                    : "Search Products"}
                </h3>

                <div className="mt-2 w-full max-w-lg">
                  <input
                    type="text"
                    placeholder="Search by name or barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {loadingFiltered ? (
                <p>Searching…</p>
              ) : searchTerm && searchResults.length === 0 ? (
                <p className="text-gray-500 mt-6">
                  No products found for "{searchTerm}".
                </p>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {searchResults.map((item) => (
                    <ProductCard
                      key={item.id || item.code}
                      item={item}
                      onEdit={setSelectedProduct}
                      onUpload={handleUpload}
                      uploading={false}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mt-6">
                  Enter a search term to find products.
                </p>
              )}
            </div>
          ) : !selectedValue ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {getMetaListForTab(browseTab).length > 0 ? (
                getMetaListForTab(browseTab)
                  .filter((m) => getMetaDisplayName(browseTab, m)?.trim())
                  .map((metaItem) => {
                    const displayName = getMetaDisplayName(browseTab, metaItem);
                    return (
                      <div
                        key={metaItem.id || displayName}
                        onClick={() => handleValueClick(browseTab, displayName)}
                        className="p-3 border rounded-lg shadow-sm hover:shadow-md cursor-pointer bg-white text-center"
                      >
                        <h3 className="font-medium text-gray-800 truncate">
                          {displayName}
                        </h3>
                      </div>
                    );
                  })
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

              {admin.loadingFiltered ? (
                <p>Loading…</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {productsForSelected(browseTab, selectedValue).length > 0 ? (
                    productsForSelected(browseTab, selectedValue).map(
                      (item) => (
                        <ProductCard
                          key={item.id || item.code}
                          item={item}
                          onEdit={setSelectedProduct}
                          onUpload={handleUpload}
                          uploading={false}
                        />
                      )
                    )
                  ) : (
                    <p className="text-gray-500">No products for this value.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit panel */}
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
          />
        </>
      )}
    </div>
  );
}
