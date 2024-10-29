import React from "react";
import type { Metadata } from "next";
import "@styles/scss/main.scss";

export const metadata: Metadata = {
  title: "Obcyfest 3.0 | Tech Fest at CCET",
  description: "Join us at Obcyfest 3.0, the premier tech fest at CCET! Discover events, workshops, and exciting opportunities.",
  keywords: ["Obcyfest", "Tech Fest", "CCET", "Events", "Workshops"],
  openGraph: {
    title: "Obcyfest 3.0 | Tech Fest at CCET",
    description: "Join us at Obcyfest 3.0, the premier tech fest at CCET! Discover events, workshops, and exciting opportunities.",
    url: "https://obcyfest3.vercel.app/",
    siteName: "Obcyfest 3.0",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Obcyfest 3.0 banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@obcyfest",
    title: "Obcyfest 3.0 | Tech Fest at CCET",
    description: "Join us at Obcyfest 3.0, the premier tech fest at CCET!",
    images: ["/images/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://obcyfest3.vercel.app/" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              name: "Obcyfest 3.0",
              startDate: "2024-10-28",
              endDate: "2024-11-05",
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              eventStatus: "https://schema.org/EventScheduled",
              location: {
                "@type": "Place",
                name: "CCET",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Your Address Here",
                  addressLocality: "City",
                  addressRegion: "State",
                  postalCode: "ZIP",
                  addressCountry: "Country",
                },
              },
              image: ["https://obcyfest3.vercel.app/images/og-image.jpg"],
              description: "Join us at Obcyfest 3.0, a premier tech fest at CCET!",
              organizer: {
                "@type": "Organization",
                name: "CCET",
                url: "https://obcyfest3.vercel.app/",
              },
            }),
          }}
        />
      </head>
      <body className="bg-black-950 text-gray-100">{children}</body>
    </html>
  );
}
