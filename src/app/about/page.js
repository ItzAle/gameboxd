import React from 'react';
import TransparentNavbar from '../../Components/Navbar/TransparentNavbar';
import Footer from '../../Components/Navbar/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">About Gameboxd</h1>
        <div className="max-w-3xl mx-auto space-y-6 text-lg">
          <p>
            Welcome to Gameboxd, your ultimate destination for discovering, tracking, and sharing your gaming experiences. Our platform is designed for gamers who are passionate about exploring new titles, sharing their thoughts, and connecting with like-minded individuals in the gaming community.
          </p>
          <p>
            At Gameboxd, we believe that every gaming experience is unique and worth sharing. Our user-friendly interface allows you to easily add reviews for the games you've played, rate them, and share your insights with others. Whether you're a casual gamer or a hardcore enthusiast, Gameboxd provides a space for you to express your opinions and discover new favorites.
          </p>
          <p>
            What sets Gameboxd apart is our integration with a powerful API (available at <a href="https://gbxd-api.vercel.app/" className="text-blue-400 hover:underline">https://gbxd-api.vercel.app/</a>). This API serves as the backbone of our platform, allowing us to maintain an extensive and up-to-date database of games. It's not just for us – developers can also utilize this API to create their own applications or integrate gaming data into their projects.
          </p>
          <p>
            Our API is a collaborative effort, enabling the Gameboxd community to contribute by adding new games to the database. This crowdsourced approach ensures that our game library is always growing and includes even the most niche or indie titles that might be overlooked by larger databases.
          </p>
          <p>
            Join us at Gameboxd and become part of a vibrant community of gamers. Share your gaming journey, discover new titles through personalized recommendations, and contribute to building the most comprehensive gaming database on the web. Whether you're looking to log your gaming history, find your next favorite game, or connect with fellow gamers, Gameboxd is your go-to platform for all things gaming.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
