"use client";

import { useState, useEffect } from "react";
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
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      setTimer(0); // reset timer when starting
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSave = async () => {
    if (!dataArray || dataArray.length === 0) {
      setStatus("No data to save!");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const productRef = collection(db, "productCollection");
      const supplierRef = collection(db, "supplierCollection");
      const suppInvoRef = collection(db, "suppinvoCollection");

      const aggregatedData = dataArray.reduce((acc, item) => {
        const key = `${item.barcode}_${item.name}`;
        if (acc[key]) acc[key].stock += Number(item.stock || 0);
        else acc[key] = { ...item, stock: Number(item.stock || 0) };
        return acc;
      }, {});
      const finalDataArray = Object.values(aggregatedData);

      for (const item of finalDataArray) {
        if (!item.barcode) continue;

        // Supplier
        if (item.supplier) {
          const supplierSnap = await getDocs(
            query(supplierRef, where("supplier", "==", item.supplier))
          );
          if (supplierSnap.empty) {
            await addDoc(supplierRef, {
              supplier: item.supplier,
              createdAt: new Date().toISOString(),
            });
          }
        }

        // SuppInvo
        if (item.suppinvo) {
          const invoSnap = await getDocs(
            query(suppInvoRef, where("suppinvo", "==", item.suppinvo))
          );
          if (invoSnap.empty) {
            await addDoc(suppInvoRef, {
              suppinvo: item.suppinvo,
              supplier: item.supplier || "",
              suppdate: item.suppdate || "",
              createdAt: new Date().toISOString(),
            });
          }
        }

        // Product
        const productSnap = await getDocs(
          query(
            productRef,
            where("barcode", "==", item.barcode),
            where("name", "==", item.name)
          )
        );
        if (!productSnap.empty) {
          const existingDoc = productSnap.docs[0];
          const existingData = existingDoc.data();
          await updateDoc(existingDoc.ref, {
            ...existingData,
            stock: Number(item.stock),
            cost: item.cost,
            value: item.value,
            mrp: item.mrp,
            rate: item.rate,
            updatedAt: new Date().toISOString(),
            brand: existingData.brand || "",
            category: existingData.category || "",
            subCategory: existingData.subCategory || "",
            group: existingData.group || "",
          });
        } else if (Number(item.stock) > 0) {
          await addDoc(productRef, {
            ...item,
            stock: Number(item.stock),
            visible: false,
            createdAt: new Date().toISOString(),
          });
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
    <div className="p-4 border rounded-md space-y-2">
      <button
        onClick={handleSave}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
      >
        {loading ? "Saving..." : "Save to Firestore"}
      </button>

      {loading && (
        <p className="text-gray-600 font-semibold">
          Saving in progress... {timer}s elapsed
        </p>
      )}

      {status && <p className="mt-2 font-semibold">{status}</p>}
    </div>
  );
}
