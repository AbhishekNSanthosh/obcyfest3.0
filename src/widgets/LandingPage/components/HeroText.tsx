import Link from "next/link";
import React from "react";
import { BsLightningCharge } from "react-icons/bs";
import { FaRobot, FaUsers, FaGamepad } from "react-icons/fa";
import { GiRocket } from "react-icons/gi"; // Rocket icon

export default function HeroText() {
  return (
    <div className="relative px-[5vw] md:pt-[13vh] lg:pt-[13vh] pt-[3vh] flex flex-col items-center justify-center w-full min-h-[100vh] gap-3 bg-black text-gray-100 overflow-hidden">
      {/* Background Animated Icons */}
      <div className="absolute inset-0 z-0">
        <div className="moving-icon icon-1">
          <FaRobot className="text-yellow-400 text-xl lg:text-3xl md:text-3xl" />
        </div>
        <div className="moving-icon icon-2">
          <FaUsers className="text-yellow-400 text-xl lg:text-3xl md:text-3xl" />
        </div>
        <div className="moving-icon icon-3">
          <FaGamepad className="text-yellow-400 text-xl lg:text-3xl md:text-3xl" />
        </div>
        <div className="moving-icon icon-4">
          <GiRocket className="text-yellow-400 text-xl lg:text-3xl md:text-3xl" />
        </div>
        <div className="moving-icon icon-5">
          <GiRocket className="text-yellow-400 text-xl lg:text-3xl md:text-3xl" />
        </div>
        {/* Add more icons as needed */}
      </div>

      {/* Highlighted Department Title with Radial Glow */}
      <div className="relative text-center md:text-2xl lg:text-2xl text-xs md:font-bold lg:font-bold font-semibold text-yellow-400 mb-1 z-10 w-full">
        <span className="py-2 bg-black bg-opacity-70 rounded-lg shadow-lg w-full">
          Department of Computer Science & Engineering
        </span>
      </div>

      {/* Plain "presents" Text */}
      <div className="text-center md:text-sm lg:text-sm text-xs text-gray-300 mb-3 z-10">
        presents
      </div>

      <div className="bg-gray-100 bg-opacity-15 p-2 rounded-full text-center shadow-lg animate-pulse z-10">
        <span className="flex items-center justify-center gap-2 md:text-lg lg:text-lg text-[3vw] font-normal">
          <BsLightningCharge className="text-yellow-400" />
          Boost Your Productivity at Obcyfest 3.0!
        </span>
      </div>

      <h1
        className="hero glitch1 layerstext-4xl font-bold tracking-tight md:text-8xl lg:text-8xl text-[7vw] z-10 mt-5 lg:mt-0 md:mt-0"
        data-text="OBCYFEST 3.0"
      >
        <span>OBCYFEST 3.0</span>
      </h1>

      {/* Date & Call to Action */}
      <div className="text-center mt-2 mb-7 md:text-xl lg:text-xl text-sm z-10">
        <p>
          Kickstarting Innovation on{" "}
          <span className="text-yellow-400 font-bold">October 30, 2024</span>
        </p>
        <p className="text-lg text-gray-300 mt-3">
          Join us for a day of tech, creativity, and endless inspiration!
        </p>
      </div>

      {/* Key Points with Icons */}
      <div className="flex flex-wrap justify-center gap-6 md:mt-6 lg:mt-6 mt-0 text-gray-200 z-10">
        <div className="flex flex-col items-center">
          <FaRobot className="text-3xl text-yellow-400 mb-2" />
          <p className="text-sm font-medium">Technical Events</p>
        </div>
        <div className="flex flex-col items-center">
          <FaGamepad className="text-3xl text-yellow-400 mb-2" />
          <p className="text-sm font-medium">Non-Technical Events</p>
        </div>
        <div className="flex flex-col items-center">
          <FaUsers className="text-3xl text-yellow-400 mb-2" />
          <p className="text-sm font-medium">Networking</p>
        </div>
      </div>

      {/* Call to Action Button */}
        <button className="md:mt-10 lg:mt-10 mt-2 px-8 py-3 bg-yellow-400 rounded-lg cursor-pointer font-semibold text-black-950 hover:bg-yellow-500 transition-colors z-10">
      <Link href={"/events"}>
          Register Now
      </Link>
        </button>
    </div>
  );
}
