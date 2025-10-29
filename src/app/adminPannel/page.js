"use client";

import React, { useEffect, useState } from "react";
import ExcelUploader from "@/components/ExcelUploader";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // 🔍 Get the user's token and check admin claim
      const tokenResult = await user.getIdTokenResult(true);
      const admin = tokenResult.claims.isAdmin;

      if (!admin) {
        router.push("/home");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking admin access...
      </div>
    );
  }

  // ✅ Only admin can see this section
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Access Denied
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Upload and manage product data via Excel sheets.
          </p>
        </div>

        <Link
          href="/productPage"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
        >
          Go to Products <ArrowRight size={16} />
        </Link>
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
    </div>
  );
}
