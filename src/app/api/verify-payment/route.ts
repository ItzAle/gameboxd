import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Obtener el ID de la sesión de Stripe del usuario
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    const stripeSessionId = userData.stripeSessionId;

    if (!stripeSessionId) {
      return NextResponse.json(
        { error: "No payment session found" },
        { status: 400 }
      );
    }

    // Verificar el estado del pago con Stripe
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

    if (session.payment_status === "paid") {
      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
