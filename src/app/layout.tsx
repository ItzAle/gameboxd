"use client";

import { SessionProvider } from "next-auth/react";
import Navbar from "./../Components/Navbar/Navbar";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}
