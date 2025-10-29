import { admin } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { uid, phoneNumber, secret } = body;

    if (secret !== process.env.ADMIN_SECRET) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    await admin.auth().setCustomUserClaims(uid, { isAdmin: true });

    return new Response(
      JSON.stringify({ success: true, uid, phoneNumber }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting admin:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
