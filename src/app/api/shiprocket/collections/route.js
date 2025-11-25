export async function GET() {
  return Response.json({
    page: 1,
    limit: 100,
    total: 1,
    collections: [
      {
        id: "10",
        title: "Toys",
        body_html: "",
        updated_at: new Date().toISOString(),
        image: {
          src: "https://firebasestorage.googleapis.com/...jpg",
        },
      },
      {
        id: "11",
        title: "Action Figures",
        body_html: "",
        updated_at: new Date().toISOString(),
        image: {
          src: "https://firebasestorage.googleapis.com/...jpg",
        },
      }
    ],
  });
}
