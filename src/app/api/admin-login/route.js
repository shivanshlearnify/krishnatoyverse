export async function POST(req) {
  const { password } = await req.json();

  // Compare with your environment variable
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (password === ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Invalid password" }), {
    status: 401,
  });
}
