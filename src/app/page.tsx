import { Metadata } from "next";
import LandingPage from "../Components/LandingPage/LandingPage";

export const metadata: Metadata = {
  title: "Gameboxd - Track, Rate, and Discover Video Games",
  description:
    "Join Gameboxd to track your gaming journey, rate and review games, discover new titles, and connect with fellow gamers. Your personal video game diary and social network.",
  keywords:
    "video games, game tracking, game reviews, gaming community, game ratings, game discovery",
  openGraph: {
    title: "Gameboxd - Best place to track your games",
    description:
      "Track your games, share reviews, and connect with gamers worldwide on Gameboxd.",
    type: "website",
    url: "https://gameboxd.me",
  },
  twitter: {
    card: "summary_large_image",
    site: "@gameboxdapp",
    creator: "@gameboxdapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    languages: {
      "en-US": "https://gameboxd.me",
    },
  },
};

export default function Home() {
  return (
    <div className="relative">
      <main>
        <LandingPage />
      </main>
    </div>
  );
}
