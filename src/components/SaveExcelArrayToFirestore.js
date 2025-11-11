"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export default function SaveExcelArrayToFirestore({ dataArray }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSave = async () => {
    if (!dataArray || dataArray.length === 0) {
      setStatus("No data to save!");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const colRef = collection(db, "productCollection");

      // 1️⃣ Combine duplicate entries (by barcode + name)
      const aggregatedData = dataArray.reduce((acc, item) => {
        const key = `${item.barcode}_${item.name}`;
        if (acc[key]) {
          acc[key].stock += Number(item.stock || 0);
        } else {
          acc[key] = { ...item, stock: Number(item.stock || 0) };
        }
        return acc;
      }, {});

      const finalDataArray = Object.values(aggregatedData);

      // 2️⃣ Sync with Firestore
      for (const item of finalDataArray) {
        if (!item.barcode) continue;

        const q = query(
          colRef,
          where("barcode", "==", item.barcode),
          where("name", "==", item.name)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const existingDoc = querySnapshot.docs[0];
          const existingData = existingDoc.data();

          // ✅ Preserve existing brand/category/subCategory/group
          const updatedFields = {
            stock: Number(item.stock),
            cost: item.cost,
            value: item.value,
            mrp: item.mrp,
            rate: item.rate,
            updatedAt: new Date().toISOString(),
          };

          // 🧠 Merge existing brand/category only if they already exist
          const preservedFields = {
            brand: existingData.brand || "",
            category: existingData.category || "",
            subCategory: existingData.subCategory || "",
            group: existingData.group || "",
          };

          await updateDoc(existingDoc.ref, {
            ...existingData,
            ...updatedFields,
            ...preservedFields, // ✅ ensures no null overwrites
          });

          // console.log(
          //   `UPDATED: ${item.name} (${item.barcode}) | New Stock: ${item.stock}`
          // );
        } else {
          // 🆕 Create new document
          await addDoc(colRef, {
            ...item,
            stock: Number(item.stock),
            createdAt: new Date().toISOString(),
          });
          console.log(
            `CREATED: ${item.name} (${item.barcode}) | Initial Stock: ${item.stock}`
          );
        }
      }

      setStatus("✅ Data synced successfully!");
    } catch (error) {
      console.error("❌ Error saving data:", error);
      setStatus("Error saving data!");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-md">
      <button
        onClick={handleSave}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
      >
        {loading ? "Saving..." : "Save to Firestore"}
      </button>

      {status && <p className="mt-2 font-semibold">{status}</p>}
    </div>
  );
}
