"use client";

import { SessionProvider } from "next-auth/react";
import "./globals.css";
import "../styles/halloween.css"; // Importa los estilos de Halloween
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReviewsProvider } from "../context/ReviewsProvider";
import { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { HalloweenProvider, useHalloween } from "../context/HalloweenContext";
import Footer from "../Components/Navbar/Footer";
import { usePathname } from "next/navigation";
import HalloweenParticles from "../Components/HalloweenParticles";

function HalloweenWrapper({ children }: { children: ReactNode }) {
  const { isHalloweenMode } = useHalloween();

  return (
    <div className={isHalloweenMode ? "halloween-mode" : ""}>
      {children}
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-900 text-white">
        <AuthProvider>
          <SessionProvider>
            <ReviewsProvider>
              <HalloweenProvider>
                <HalloweenWrapper>
                  <div className="flex-grow">{children}</div>
                  {!isHomePage && <Footer />}
                  <ToastContainer position="bottom-right" theme="dark" />
                </HalloweenWrapper>
              </HalloweenProvider>
            </ReviewsProvider>
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
