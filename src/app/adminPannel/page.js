"use client";

import React, { useEffect, useState } from "react";
import ExcelUploader from "@/components/ExcelUploader";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { fetchMeta } from "@/redux/adminProductSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BulkVisibilityFixer from "@/components/BulkVisibilityFixer";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  // --------------------------------------
  // ✅ AUTH CHECK — Runs once on page load
  // --------------------------------------
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      setIsAuthenticated(true);
    } else {
      router.replace("/adminlogin");
    }

    setLoading(false);
  }, [router]);

  // --------------------------------------
  // 🔴 Logout
  // --------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/adminlogin");
  };

  // --------------------------------------
  // 🔄 Refresh meta collections
  // --------------------------------------
  const handleRefresh = async () => {
    setRefreshing(true);
    const collections = [
      "brands",
      "categories",
      "subcategories",
      "groups",
      "supplierCollection",
      "suppinvoCollection",
    ];

    try {
      await Promise.all(
        collections.map((col) => dispatch(fetchMeta(col)).unwrap())
      );
      toast.success("Meta collections refreshed successfully ✅", {
        position: "top-center",
      });
    } catch (err) {
      console.error("Refresh error:", err);
      toast.error("Failed to refresh meta collections ❌", {
        position: "top-center",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // --------------------------------------
  // Loading Screen
  // --------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleDeleteZeroStock = async () => {
    if (!confirm("Are you sure you want to delete all products with 0 stock?"))
      return;

    try {
      const q = query(
        collection(db, "productCollection"),
        where("stock", "==", 0)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        toast.info("No products with 0 stock found.", {
          position: "top-center",
        });
        return;
      }

      const deletePromises = snap.docs.map((d) =>
        deleteDoc(doc(db, "productCollection", d.id))
      );
      await Promise.all(deletePromises);

      toast.success(`Deleted ${snap.size} product(s) with 0 stock ✅`, {
        position: "top-center",
      });
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete products ❌", { position: "top-center" });
    }
  };

  // --------------------------------------
  // MAIN UI
  // --------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="md:flex items-center justify-between mb-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Upload and manage product data via Excel sheets.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/productPage"
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
          >
            Go to Products <ArrowRight size={16} />
          </Link>
          <button
            onClick={handleDeleteZeroStock}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
          >
            Delete Products with 0 Stock
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Excel Upload Section */}
      <div className="max-w-4xl bg-white rounded-2xl shadow-md border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Upload Excel File
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Please ensure your Excel file follows the proper product data format.
        </p>

        <ExcelUploader />
      </div>
      <BulkVisibilityFixer />
      <ToastContainer />
    </div>
  );
}
