/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  },
  images: {
    domains: [
      'gameranx.com',
      'wallpapercave.com',
      'www.pushbutton.it',
      'i.pinimg.com',
      'madisongame.com',
      'preview.redd.it',
      'i.blogs.es',
      'images6.alphacoders.com',
      'www.avpgalaxy.net',
      'imgs.callofduty.com',
      'motionbgs.com',
      'cdn.hobbyconsolas.com',
      'cdn1.epicgames.com',
      '4kwallpapers.com',
      'images8.alphacoders.com',
      'wallpapercat.com',
    ],
  },
}

module.exports = nextConfig