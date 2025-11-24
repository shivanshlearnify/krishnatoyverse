export async function GET() {
  return Response.json({
    products: [
      {
        id: "1",
        title: "RYUK ACTION FIGURE",
        body_html: "",
        vendor: "krishna Toyverse",
        product_type: "Toys",
        status: "active",
        updated_at: new Date().toISOString(),
        variants: [
          {
            id: "1-1",
            title: "Default",
            price: "499",
            quantity: 10,
            sku: "RYUK ACTION FIGURE-01",
            updated_at: new Date().toISOString(),
            image: {
              src: "https://firebasestorage.googleapis.com/v0/b/krishnatoyverse-58344.firebasestorage.app/o/productImages%2F51nP3EeqgO7XbvQpgOyf%2F1763468072098.jpg?alt=media&token=f279d3e0-d139-499d-9756-7b06cf7ff022",
            },
            weight: 0.25,
          },
        ],
        image: {
          src: "https://firebasestorage.googleapis.com/v0/b/krishnatoyverse-58344.firebasestorage.app/o/productImages%2F51nP3EeqgO7XbvQpgOyf%2F1763468072098.jpg?alt=media&token=f279d3e0-d139-499d-9756-7b06cf7ff022",
        },
      },
    ],
  });
}
