export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 100);
  const collectionId = searchParams.get("collection_id");

  let allProducts = [];

  // PRODUCTS FROM COLLECTION 10
  if (collectionId === "10") {
    allProducts = [
      {
        id: "1",
        title: "Wooden Toy Car",
        body_html: "",
        vendor: "Krishna Toyverse",
        product_type: "Toys",
        status: "active",
        updated_at: new Date().toISOString(),
        variants: [
          {
            id: "1-1",
            title: "Default",
            price: "399",
            quantity: 10,
            sku: "WOODCAR-01",
            updated_at: new Date().toISOString(),
            image: {
              src: "https://firebasestorage.googleapis.com/...jpg",
            },
            weight: 0.20,
          },
        ],
        image: { src: "https://firebasestorage.googleapis.com/...jpg" },
      },
      {
        id: "2",
        title: "Mini Racing Car",
        body_html: "",
        vendor: "Krishna Toyverse",
        product_type: "Toys",
        status: "active",
        updated_at: new Date().toISOString(),
        variants: [
          {
            id: "2-1",
            title: "Default",
            price: "299",
            quantity: 15,
            sku: "RACECAR-01",
            updated_at: new Date().toISOString(),
            image: {
              src: "https://firebasestorage.googleapis.com/...jpg",
            },
            weight: 0.15,
          },
        ],
        image: { src: "https://firebasestorage.googleapis.com/...jpg" },
      },
    ];
  }

  // Pagination
  const start = (page - 1) * limit;
  const paginated = allProducts.slice(start, start + limit);

  return Response.json({
    page,
    limit,
    total: allProducts.length,
    products: paginated,
  });
}
