"use client";

import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReviewsProvider } from "../context/ReviewsProvider";
import { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import Script from 'next/script';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3043119271393042"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthProvider>
          <SessionProvider>
            <ReviewsProvider>
              <main>{children}</main>
              <ToastContainer />
            </ReviewsProvider>
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
