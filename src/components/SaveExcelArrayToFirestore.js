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

      // 1️⃣ Aggregate duplicates by barcode + name (sum stock in Excel itself)
      const aggregatedData = dataArray.reduce((acc, item) => {
        const key = `${item.barcode}_${item.name}`;
        if (acc[key]) {
          acc[key].stock += Number(item.stock || 0);
        } else {
          acc[key] = { ...item, stock: Number(item.stock || 0) };
        }
        return acc;
      }, {});

      // Convert to array
      const finalDataArray = Object.values(aggregatedData);

      // 2️⃣ Sync with Firestore
      for (let item of finalDataArray) {
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

          const oldStock = Number(existingData.stock || 0);
          const newStock = Number(item.stock); // stock from Excel
          const stockChange = newStock - oldStock;

          await updateDoc(existingDoc.ref, {
            ...item,
            stock: newStock, // 🔥 overwrite with Excel stock
            updatedAt: new Date().toISOString(),
          });

          if (stockChange !== 0) {
            console.log(
              `UPDATED: ${item.name} (Barcode: ${
                item.barcode
              }) | Old: ${oldStock}, New: ${newStock}, Change: ${
                stockChange >= 0 ? "+" : ""
              }${stockChange}`
            );
          }
        } else {
          await addDoc(colRef, {
            ...item,
            stock: Number(item.stock),
            createdAt: new Date().toISOString(),
          });
          console.log(
            `CREATED: ${item.name} (Barcode: ${item.barcode}) | Initial Stock: ${item.stock}`
          );
        }
      }

      setStatus("Data synced successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
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

      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}
