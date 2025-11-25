import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET() {
  try {
    const page = 1;
    const limit = 100;

    const metaRef = doc(db, "meta", "meta");
    const metaSnap = await getDoc(metaRef);

    if (!metaSnap.exists()) {
      return Response.json({ page, limit, total: 0, collections: [] });
    }

    const meta = metaSnap.data();
    const categories = meta.categories || [];

    const collections = categories.map((item) => ({
      id: String(item.id),
      title: item.name || "",
      body_html: "",
      updated_at: new Date(item.createdAt || Date.now()).toISOString(),
      image: {
        src: item.image || item.image_url || ""
      },
    }));

    return Response.json({
      page,
      limit,
      total: collections.length,
      collections,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
