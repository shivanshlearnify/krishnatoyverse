import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { metadata } = body;

    const result = await fetch(
      "https://apiv2.shiprocket.in/v1/external/app/checkout/order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SHIPROCKET_TOKEN}`,
        },
        body: JSON.stringify({
          amount: metadata.totalAmount,
          currency: "INR",
          items: metadata.cartItems,
        }),
      }
    );

    const data = await result.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
