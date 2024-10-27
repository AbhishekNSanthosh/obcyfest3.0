"use client";
import TitleBar from "@components/TitleBar";
import Image from "next/image";
import React from "react";

export default function Community() {
  const imgurls = [
    "/clubs/obcywhite.svg",
    "/clubs/coding.svg",
    "/clubs/ieee.svg",
    "/clubs/mulearn.svg",
  ];

  return (
    <div className="flex flex-col items-center gap-8">
      <TitleBar title="Community Partners" className="text-xl mb-4" />
      <div className="flex flex-wrap justify-center gap-6">
        {imgurls.map((url, index) => (
          <div
            key={index}
            className="flex items-center justify-center w-[12rem] h-[8rem] bg-black-950 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <Image
              src={url}
              alt={`Community logo ${index + 1}`}
              width={150} // Set a fixed width
              height={150} // Set a fixed height
              className="object-contain p-4" // Ensure the image scales correctly
            />
          </div>
        ))}
      </div>
    </div>
  );
}
