import { db } from "../../../../lib/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { sendEmail } from "../../../utils/sendEmail";

export async function POST(req) {
  try {
    const { gameId, gameName, userId } = await req.json();

    console.log("Received data:", { gameId, gameName, userId });

    // Simular la creación de una notificación de lanzamiento de juego
    const notificationData = {
      userId,
      type: "game_release",
      gameId,
      gameName,
      createdAt: new Date(),
      read: false,
    };

    console.log("Creating notification:", notificationData);

    const docRef = await addDoc(
      collection(db, "userNotifications"),
      notificationData
    );
    console.log("Notification created with ID:", docRef.id);

    // Obtener información del usuario
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const userData = userSnap.data();
    console.log("User data:", userData);

    // Si el usuario es Pro, enviar un correo electrónico
    if (userData.isPro) {
      console.log("Sending email to Pro user");
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        await sendEmail({
          to: userData.email,
          gameName,
          releaseDate: new Date().toISOString().split("T")[0],
          coverImageUrl: "https://ejemplo.com/imagen-de-prueba.jpg",
          gamePageUrl: `${baseUrl}/games/${gameId}`,
        });
        console.log("Email sent successfully");
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // No lanzamos el error aquí para que la notificación en la app aún se cree
      }
    }

    return new Response(
      JSON.stringify({ message: "Test notification sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in test game release:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Error processing test game release",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
