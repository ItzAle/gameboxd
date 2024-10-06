import nodemailer from "nodemailer";

export async function POST() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: "alexcs9230@gmail.com", // Cambia esto por tu email personal
      subject: "Prueba de correo desde Gameboxd",
      text: "Este es un correo de prueba para verificar la configuración SMTP con Brevo",
      html: "<b>Este es un correo de prueba para verificar la configuración SMTP con Brevo</b>",
    });

    return new Response(
      JSON.stringify({ message: "Correo enviado con éxito" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return new Response(
      JSON.stringify({
        error: "Error al enviar el correo",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: "Use POST to send a test email" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
