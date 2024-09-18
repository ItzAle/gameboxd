import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../../lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: Request) {
  try {
    const { sessionId, userId } = await request.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "Missing sessionId or userId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, { isPro: true });
        return NextResponse.json({
          success: true,
          message: "User upgraded to Pro",
        });
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
