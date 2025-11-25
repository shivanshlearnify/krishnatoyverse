import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limitCount = Number(searchParams.get("limit") || 100);

    const productsRef = collection(db, "productCollection");
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const allProducts = snap.docs.map((docSnap) => {
      const p = docSnap.data();
      const id = docSnap.id;

      const image = p.images?.[0] || "";

      return {
        id: id, 
        title: p.name || "",
        body_html: "",
        vendor: p.company || "",
        product_type: p.category || "",
        created_at: p.updatedAt || new Date().toISOString(),
        handle: (p.name || "").toLowerCase().replace(/\s+/g, "-"),
        updated_at: p.updatedAt || new Date().toISOString(),
        tags: [] || "",
        status: p.visible ? "active" : "draft",

        image: { src: image },

        variants: [
          {
            id: id + "-v1", // unique variant ID
            title: "Default",
            price: String(p.rate || 0),
            compare_at_price: String(p.mrp || ""), // REQUIRED STRING
            sku: p.barcode || "",
            quantity: Number(p.stock || 0),
            created_at: p.updatedAt || new Date().toISOString(),
            updated_at: p.updatedAt || new Date().toISOString(),
            taxable: true,
            option_values: {},
            grams: Number(p.weight_grams || 300),
            image: { src: image },
            weight: Number(0.3),
            weight_unit: "grams",
          },
        ],

        options: [
          {
            name: "Default",
            values: ["Default"],
          },
        ],
      };
    });

    // Manual pagination
    const start = (page - 1) * limitCount;
    const end = start + limitCount;

    return Response.json({
      data: {
        total: allProducts.length,
        products: allProducts.slice(start, end),
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
