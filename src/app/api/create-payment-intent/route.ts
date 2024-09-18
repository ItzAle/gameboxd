import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: Request) {
  try {
    const { userId, priceId } = await request.json();

    if (!userId || !priceId) {
      return NextResponse.json(
        { error: "User ID and Price ID are required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade`,
      client_reference_id: userId,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Error creating checkout session:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "This endpoint only supports POST requests" },
    { status: 405 }
  );
}
