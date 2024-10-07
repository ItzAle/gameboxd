import { db } from "../../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req) {
  const { to, gameName, releaseDate, coverImageUrl, gamePageUrl } = await req.json();
  return await sendSingleEmail({ to, gameName, releaseDate, coverImageUrl, gamePageUrl });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const checkScheduled = searchParams.get('checkScheduled');
  const testEmail = searchParams.get('testEmail');

  if (checkScheduled === 'true') {
    return await handleScheduledEmails();
  } else if (testEmail) {
    return await sendSingleEmail({
      to: testEmail,
      gameName: "Test Game",
      releaseDate: new Date().toISOString(),
      coverImageUrl: "https://example.com/test-cover.jpg",
      gamePageUrl: "https://gameboxd.me/games/test-game",
    });
  } else {
    return new Response(
      JSON.stringify({ message: "Use POST to send a test email, add 'checkScheduled=true' for scheduled emails, or add 'testEmail=your@email.com' to test email sending" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

async function sendSingleEmail({
  to,
  gameName,
  releaseDate,
  coverImageUrl,
  gamePageUrl,
}) {
  const formattedReleaseDate = new Date(releaseDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Game Release Notification - Gameboxd</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <header style="background-color: #1a202c; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Gameboxd</h1>
      </header>
      <main style="padding: 20px;">
        <h2 style="color: #2b6cb0;">${gameName} is now available!</h2>
        <p>Dear Gameboxd Pro user,</p>
        <p>We're excited to inform you that the game you've been waiting for, <strong>${gameName}</strong>, is now available as of today, ${formattedReleaseDate}.</p>
        <div style="text-align: center; margin: 20px 0;">
          <img src="${coverImageUrl}" alt="${gameName} Cover" style="max-width: 300px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        </div>
        <p>Don't miss the chance to be one of the first to enjoy this new adventure. Visit the game's page on Gameboxd to get more information and see reviews from other players.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${gamePageUrl}" style="background-color: #4299e1; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View game page</a>
        </div>
      </main>
      <footer style="background-color: #2d3748; color: #fff; padding: 20px; text-align: center; font-size: 0.8em;">
        <p>This email is exclusive for Gameboxd Pro users. Thank you for your continued support.</p>
        <p>If you no longer wish to receive notifications, you can adjust your preferences in your account settings.</p>
      </footer>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `${gameName} is now available! - Gameboxd Notification`,
      html: htmlContent,
    });

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleScheduledEmails() {
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

    let emailsSent = 0;

    for (const notification of notifications) {
      const userDoc = await getDoc(doc(db, "users", notification.userId));
      const userData = userDoc.data();

      if (userData.isPro) {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "https://gameboxd.me";
        const gamePageUrl = `${baseUrl}/games/${notification.gameId}`;

        await sendSingleEmail({
          to: userData.email,
          gameName: notification.gameName,
          releaseDate: notification.releaseDate,
          coverImageUrl: notification.coverImageUrl,
          gamePageUrl: gamePageUrl,
        });

        emailsSent++;
      }

      await updateDoc(doc(db, "notifications", notification.id), {
        sent: true,
        sentAt: new Date(),
      });
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${notifications.length} notifications. Sent ${emailsSent} emails.`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing notifications:", error);
    return new Response(
      JSON.stringify({ error: "Error processing notifications", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}