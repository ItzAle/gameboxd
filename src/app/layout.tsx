"use client";

import { SessionProvider } from "next-auth/react";
import Navbar from "./../Components/Navbar/Navbar";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReviewsProvider } from "../context/ReviewsProvider";
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ReviewsProvider>
            {/* <Navbar /> */}
            <main>{children}</main>
            <ToastContainer />
          </ReviewsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
