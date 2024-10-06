import { db } from "../../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("releaseDate", "==", today.toISOString().split("T")[0]),
      where("sent", "==", false)
    );
    const querySnapshot = await getDocs(q);

    const notifications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    for (const notification of notifications) {
      // Crear notificación en la app para todos los usuarios
      await addDoc(collection(db, "userNotifications"), {
        userId: notification.userId,
        type: "game_release",
        gameId: notification.gameId,
        gameName: notification.gameName, // Asegúrate de que esto esté presente
        message: `${notification.gameName} has been released!`,
        createdAt: new Date(),
        read: false,
      });

      // Marcar la notificación original como enviada
      await updateDoc(doc(db, "notifications", notification.id), {
        sent: true,
        sentAt: new Date(),
      });
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${notifications.length} game releases.`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing game releases:", error);
    return new Response(
      JSON.stringify({ error: "Error processing game releases" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
