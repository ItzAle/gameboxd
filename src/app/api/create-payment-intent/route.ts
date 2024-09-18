import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20", // Asegúrate de usar la versión más reciente
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

    // Crear un PaymentIntent con el monto y la moneda
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 800, // 8 euros en centavos
      currency: "eur",
      metadata: { userId },
      payment_method_types: ["card", "apple_pay"],
    });

    // Configurar Apple Pay
    await stripe.applePayDomains.create({
      domain_name: "gameboxd-pi.vercel.app", // Reemplaza con tu dominio real
    });

    console.log("PaymentIntent creado exitosamente");
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error("Error detallado en create-payment-intent:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
