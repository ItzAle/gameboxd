export async function sendEmail({ to, gameName, releaseDate, coverImageUrl, gamePageUrl }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, gameName, releaseDate, coverImageUrl, gamePageUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
