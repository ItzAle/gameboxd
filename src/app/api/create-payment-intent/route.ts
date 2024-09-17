import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: Request) {
  try {
    console.log("Iniciando create-payment-intent");
    const { userId } = await request.json();
    console.log("UserId recibido:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya es Pro
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    if (userData.isPro) {
      return NextResponse.json(
        { error: "User is already Pro" },
        { status: 400 }
      );
    }

    // Obtener los métodos de pago disponibles
    const paymentMethods = await stripe.paymentMethods.list({
      type: "card",
    });

    console.log(
      "Métodos de pago disponibles:",
      paymentMethods.data.map((pm) => pm.type)
    );

    // Crear un PaymentIntent con el monto y la moneda
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 800, // 8 euros en centavos
      currency: "eur",
      metadata: { userId },
      payment_method_types: ["card"], // Comienza solo con 'card'
    });

    console.log("PaymentIntent creado exitosamente");
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error("Error detallado en create-payment-intent:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
