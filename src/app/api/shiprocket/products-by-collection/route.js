export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collection_id");

  
  let products = [];

  if (collectionId === "10") {
    products = [
      {
        id: "1",
        title: "Wooden Toy Car",
        body_html: "",
        vendor: "krishna toyvesre",
        product_type: "Toys",
        status: "active",
        updated_at: new Date().toISOString(),
        variants: [
          {
            id: "1-1",
            title: "Default",
            price: "499",
            quantity: 10,
            sku: "WOODCAR-01",
            updated_at: new Date().toISOString(),
            image: { src: "https://firebasestorage.googleapis.com/v0/b/krishnatoyverse-58344.firebasestorage.app/o/productImages%2F51nP3EeqgO7XbvQpgOyf%2F1763468072098.jpg?alt=media&token=f279d3e0-d139-499d-9756-7b06cf7ff022" },
            weight: 0.25
          }
        ],
        image: {
          src: "https://firebasestorage.googleapis.com/v0/b/krishnatoyverse-58344.firebasestorage.app/o/productImages%2F51nP3EeqgO7XbvQpgOyf%2F1763468072098.jpg?alt=media&token=f279d3e0-d139-499d-9756-7b06cf7ff022"
        }
      }
    ];
  }

  return Response.json({
    products
  });
}
