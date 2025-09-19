import React from "react";
import type { Metadata } from "next";
import "@styles/scss/main.scss";
import "./globals.css";

import { Toaster } from "react-hot-toast";

// Next.js font imports
import { Poppins, Rubik_Wet_Paint, Fugaz_One } from "next/font/google";
import { eventName } from "@utils/constants";

// Define fonts with weights you need
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const rubikWetPaint = Rubik_Wet_Paint({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-rubik",
});

const fugazOne = Fugaz_One({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-fugaz",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://obcyfest.carmelcet.in/"),
  title: eventName,
  description: `${eventName} - The mini-tech fest of CCET`,
  keywords: [
    "Obcyfest",
    "CCET",
    "Carmel College of Engineering and Technology"
],
  authors: [{ name: "Obcyfest Team", url: "https://obcyfest.carmelcet.in/" }],
  openGraph: {
    type: "website",
    url: "https://obcyfest.carmelcet.in/",
    title: eventName,
    description: `${eventName} - The mini-tech fest of CCET`,
    images: [
      { url: "/posters/poster_logo.jpg", alt: eventName },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className={`${poppins.variable} ${rubikWetPaint.variable} ${fugazOne.variable}`}
    >
      <body className="bg-black-950 text-gray-100">
        <div><Toaster
  position="bottom-center"
  toastOptions={{
    // Base styles
    style: {
      background: "#0b0b0c", // matches your black-950 / dark background
      color: "#facc15",      // yellow-400
      border: "1px solid #facc15",
      borderRadius: "0.75rem", // rounded-xl
      padding: "12px 16px",
      fontSize: "0.9rem",
    },
    // Success toast
    success: {
      style: {
        background: "#133c25", // your slk-regular green
        color: "#fff",
        border: "1px solid #239254", // slk-light
      },
      iconTheme: {
        primary: "#22c55e", // green-500
        secondary: "#fff",
      },
    },
    // Error toast
    error: {
      style: {
        background: "#3f0d12", // deep red tone
        color: "#fff",
        border: "1px solid #ef4444", // red-500
      },
      iconTheme: {
        primary: "#ef4444",
        secondary: "#fff",
      },
    },
  }}
/></div>
        {children}
      </body>
    </html>
  );
}
