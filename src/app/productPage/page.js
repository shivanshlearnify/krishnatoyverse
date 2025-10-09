"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllData } from "@/redux/productSlice";
import UpdateProduct from "@/components/UpdateProduct";

const collections = [
  { name: "Product Collection", key: "productCollection" },
  { name: "Group", key: "groups" },
  { name: "Brand", key: "brands" },
  { name: "Category", key: "categories" },
  { name: "Subcategory", key: "subcategories" },
];

export default function ProductPage() {
  const dispatch = useDispatch();

  // Redux data
  const { productCollection, groups, brands, categories, subcategories, loading } = useSelector(
    (state) => state.productData
  );

  const [activeTab, setActiveTab] = useState(collections[0].key);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch once on mount
  useEffect(() => {
    dispatch(fetchAllData());
  }, [dispatch]);

  // Select correct collection data based on active tab
  const getActiveData = () => {
    switch (activeTab) {
      case "brands":
        return brands;
      case "categories":
        return categories;
      case "groups":
        return groups;
      case "subcategories":
        return subcategories;
      case "productCollection":
      default:
        return productCollection;
    }
  };

  const data = getActiveData();

  const getNameById = (list, id) => list.find((item) => item.id === id)?.name || "-";

  return (
    <div className="p-6 flex gap-6 relative">
      {/* Left: Product List */}
      <div className="flex-1">
        {/* Tabs */}
        <div className="flex gap-3 mb-6 border-b pb-2">
          {collections.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelectedProduct(null);
              }}
              className={`px-4 py-2 rounded-t-md font-medium ${
                activeTab === tab.key
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

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

                {/* Product Details */}
                {activeTab === "productCollection" && (
                  <>
                    <p>Barcode: {item.barcode}</p>
                    <p>Brand: {getNameById(brands, item.brand)}</p>
                    <p>Category: {getNameById(categories, item.category)}</p>
                    <p>Group: {getNameById(groups, item.group)}</p>
                    <p>Subcategory: {getNameById(subcategories, item.subcategory)}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No items found.</p>
        )}
      </div>

      {/* Right: Sliding Modal */}
      {selectedProduct && (
        <div className="fixed inset-y-0 right-0 w-full md:w-1/3 bg-white shadow-xl z-50 transform transition-transform duration-300">
          <div className="p-6 flex flex-col h-full">
            <button
              onClick={() => setSelectedProduct(null)}
              className="self-end text-gray-600 hover:text-black mb-4"
            >
              ✖
            </button>
            <h2 className="text-xl font-semibold text-center mb-4">Edit Product</h2>
            <UpdateProduct
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSelectedProduct(null)}
        ></div>
      )}
    </div>
  );
}
