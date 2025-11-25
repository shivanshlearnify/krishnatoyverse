import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const collectionName = searchParams.get("collection") || "";
    const cursor = searchParams.get("cursor") || "";
    const pageLimit = 100;

    if (!collectionName) {
      return Response.json({ error: "collection is required" }, { status: 400 });
    }

    const productsRef = collection(db, "products");

    // Base query
    let q = query(
      productsRef,
      where("group", "==", collectionName),
      where("visible", "==", true),
      orderBy("createdAt", "desc"),
      limit(pageLimit)
    );

    if (cursor) {
      q = query(
        productsRef,
        where("group", "==", collectionName),
        where("visible", "==", true),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageLimit)
      );
    }

    let snap = await getDocs(q);

    // If no 'group' match → try 'category'
    if (snap.empty) {
      q = query(
        productsRef,
        where("category", "==", collectionName),
        where("visible", "==", true),
        orderBy("createdAt", "desc"),
        limit(pageLimit)
      );
      snap = await getDocs(q);
    }

    const products = snap.docs.map((doc) => {
      const p = doc.data();
      const image = p.images?.[0] || p.image || "";

      return {
        id: String(doc.id),
        title: p.name || "",
        body_html: "",
        vendor: p.company || "",
        product_type: p.category || "",
        status: "active",

        variants: [
          {
            id: String(doc.id) + "-v1",
            title: "Default",
            price: String(p.rate || 0),
            quantity: p.stock || 0,
            sku: p.barcode || "",
            updated_at: p.updatedAt || new Date().toISOString(),
            weight: p.weight || 0.5,
            image: { src: image },
          },
        ],

        image: { src: image },
      };
    });

    const lastDoc = snap.docs[snap.docs.length - 1];

    return Response.json({
      products,
      next_page_cursor: lastDoc?.id || null,
      has_more: Boolean(lastDoc),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
