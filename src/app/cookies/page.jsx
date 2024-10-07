import React from "react";
import TransparentNavbar from "../../Components/Navbar/TransparentNavbar";
import CookiePolicy from "../../Components/CookiePolicy/CookiePolicy";

export const metadata = {
  title: "Cookie Policy | Gameboxd",
  description: "Gameboxd's cookie policy: how we use cookies on our platform.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-300">
          Cookies Policy
        </h1>
        <CookiePolicy />
      </div>
    </div>
  );
}
