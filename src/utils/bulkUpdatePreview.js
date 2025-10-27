import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

/**
 * Preview and optionally bulk update Firestore documents
 * Updates only existing keys like brand, category, group, subcategory
 */
export async function bulkUpdatePreview(collections, word, fieldToUpdate, newValue, confirmUpdate = false) {
  const lowerWord = word.toLowerCase();
  const previewResults = [];

  for (const colName of collections) {
    const snap = await getDocs(collection(db, colName));

    // find matching docs
    const matchedDocs = snap.docs.filter((docSnap) => {
      const name = docSnap.data().name?.toLowerCase() || "";
      return name.includes(lowerWord);
    });

    matchedDocs.forEach((docSnap) => {
      const data = docSnap.data();
      previewResults.push({
        collection: colName,
        id: docSnap.id,
        name: data.name,
        oldValue: data[fieldToUpdate],
      });
    });

    // ✅ Only update if confirmed
    if (confirmUpdate && matchedDocs.length > 0) {
      await Promise.all(
        matchedDocs.map((docSnap) =>
          updateDoc(doc(db, colName, docSnap.id), {
            [fieldToUpdate]: newValue,
          })
        )
      );
    }
  }

  return previewResults;
}
