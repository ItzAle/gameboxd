"use client";

import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReviewsProvider } from "../context/ReviewsProvider";
import { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { HalloweenProvider } from "../context/HalloweenContext";
import { ChristmasProvider } from "../context/ChristmasContext";
import Footer from "../Components/Navbar/Footer";
import { usePathname } from "next/navigation";
import "swiper/css";
import "swiper/css/pagination";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isSignInPage = pathname === "/signin";
  const isSignUpPage = pathname === "/signup";
  const isProPage = pathname === "/pro";
  const isUpgradePage = pathname === "/upgrade";
  const isGameDetailPage = pathname.includes("/games/");

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <AuthProvider>
          <SessionProvider>
            <ReviewsProvider>
              <ChristmasProvider>
                <HalloweenProvider>
                  <div className="flex-grow">{children}</div>
                  {!isHomePage &&
                    !isSignInPage &&
                    !isSignUpPage &&
                    !isProPage &&
                    !isUpgradePage &&
                    !isGameDetailPage && <Footer />}
                  <ToastContainer position="bottom-right" theme="dark" />
                </HalloweenProvider>
              </ChristmasProvider>
            </ReviewsProvider>
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
