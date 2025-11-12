"use client";

import React, { useEffect, useState } from "react";
import ExcelUploader from "@/components/ExcelUploader";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchAllData } from "@/redux/adminProductSlice";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsAuthenticated(true);
    } else {
      router.push("/adminlogin");
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/adminlogin");
  };

  const handleRefresh = async () => {
    try {
      const result = await dispatch(fetchAllData(true)).unwrap(); // ✅ unwrap to get actual payload

      if (result.cached) {
        toast.info("Using cached data ⚡", { position: "top-center" });
      } else {
        toast.success("Data refreshed successfully! 🎉", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data ❌", { position: "top-center" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) return null;

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
          <button
            onClick={handleRefresh}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
          >
            🔄 Refresh Data
          </button>
          <Link
            href="/productImageUpdate"
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
          >
            productImageUpdate <ArrowRight size={16} />
          </Link>
          <Link
            href="/productPage"
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
          >
            Go to Products <ArrowRight size={16} />
          </Link>
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

      <ToastContainer />
    </div>
  );
}
