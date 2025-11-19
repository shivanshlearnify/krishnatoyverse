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
      const productRef = collection(db, "productCollection");
      const supplierRef = collection(db, "supplierCollection");
      const suppInvoRef = collection(db, "suppinvoCollection");

      // 1️⃣ Combine duplicates on barcode + name
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

      for (const item of finalDataArray) {
        if (!item.barcode) continue;

        // ----------------------------
        // 2️⃣ CREATE SUPPLIER COLLECTION (NO UPDATE)
        // ----------------------------
        if (item.supplier) {
          const supplierQ = query(
            supplierRef,
            where("supplier", "==", item.supplier)
          );
          const supplierSnap = await getDocs(supplierQ);

          if (supplierSnap.empty) {
            await addDoc(supplierRef, {
              supplier: item.supplier,
              createdAt: new Date().toISOString(),
            });
          }
        }

        // ----------------------------
        // 3️⃣ CREATE SUPPINVO COLLECTION (NO UPDATE)
        // ----------------------------
        if (item.suppinvo) {
          const invoQ = query(
            suppInvoRef,
            where("suppinvo", "==", item.suppinvo)
          );
          const invoSnap = await getDocs(invoQ);

          if (invoSnap.empty) {
            await addDoc(suppInvoRef, {
              suppinvo: item.suppinvo,
              supplier: item.supplier || "",
              suppdate: item.suppdate || "",
              createdAt: new Date().toISOString(),
            });
          }
        }

        // ----------------------------
        // 4️⃣ PRODUCT COLLECTION (USE EXISTING LOGIC)
        // ----------------------------
        const q = query(
          productRef,
          where("barcode", "==", item.barcode),
          where("name", "==", item.name)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const existingDoc = querySnapshot.docs[0];
          const existingData = existingDoc.data();

          const updatedFields = {
            stock: Number(item.stock),
            cost: item.cost,
            value: item.value,
            mrp: item.mrp,
            rate: item.rate,
            updatedAt: new Date().toISOString(),
          };

          const preservedFields = {
            brand: existingData.brand || "",
            category: existingData.category || "",
            subCategory: existingData.subCategory || "",
            group: existingData.group || "",
          };

          await updateDoc(existingDoc.ref, {
            ...existingData,
            ...updatedFields,
            ...preservedFields,
          });
        } else {
          await addDoc(productRef, {
            ...item,
            stock: Number(item.stock),
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
