import React from "react";
import type { Metadata } from "next";
import "@styles/scss/main.scss";
import "./globals.css";

// Next.js font imports
import { Poppins, Rubik_Wet_Paint, Fugaz_One } from "next/font/google";

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
  title: "ObcyFest 3.0",
  description: "ObcyFest 3.0 - Międzynarodowy Festiwal Filmów Fantastycznych",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${rubikWetPaint.variable} ${fugazOne.variable}`}
    >
      <body className="bg-black-950 text-gray-100">{children}</body>
    </html>
  );
}
