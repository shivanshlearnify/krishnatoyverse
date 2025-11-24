export async function GET() {
  return Response.json({
    collections: [
      {
        id: "10",
        title: "Toys",
        body_html: "",
        updated_at: new Date().toISOString(),
        image: { src: "https://firebasestorage.googleapis.com/v0/b/krishnatoyverse-58344.firebasestorage.app/o/productImages%2F51nP3EeqgO7XbvQpgOyf%2F1763468072098.jpg?alt=media&token=f279d3e0-d139-499d-9756-7b06cf7ff022" }
      }
    ]
  });
}
