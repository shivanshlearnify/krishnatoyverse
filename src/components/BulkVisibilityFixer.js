"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc } from "firebase/firestore";

export default function BulkVisibilityFixer() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const fixVisibility = async () => {
    setLoading(true);
    setStatus("Updating visibility...");

    try {
      const productRef = collection(db, "productCollection");
      const snapshot = await getDocs(productRef);

      let updatedCount = 0;

      const updates = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const images = data.images || [];
        const visible = Array.isArray(images) && images.length > 0;

        if (data.visible !== visible) {
          await updateDoc(docSnap.ref, { visible });
          updatedCount++;
        }
      });

      await Promise.all(updates);

      setStatus(`✔️ Done! Updated ${updatedCount} products.`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Error while updating visibility.");
    }

    setLoading(false);
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-md border p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Fix Product Visibility
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        This tool will automatically set <b>visible: true</b> where product
        images exist and <b>visible: false</b> where images are empty.
      </p>

      <button
        onClick={fixVisibility}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Run Visibility Fix"}
      </button>

      {status && <p className="mt-3 font-semibold">{status}</p>}
    </div>
  );
}
