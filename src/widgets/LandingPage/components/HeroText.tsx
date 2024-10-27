import Link from "next/link";
import React from "react";
import { BsLightningCharge } from "react-icons/bs";
import { FaRobot, FaUsers, FaGamepad } from "react-icons/fa";
import { GiRocket } from "react-icons/gi"; // Rocket icon

export default function HeroText() {
  return (
    <div className="relative px-[5vw] pt-[13vh] flex flex-col items-center justify-center w-full min-h-[100vh] gap-3 bg-black text-gray-100 overflow-hidden">
      {/* Background Animated Icons */}
      <div className="absolute inset-0 z-0">
        <div className="moving-icon icon-1">
          <FaRobot className="text-yellow-400" />
        </div>
        <div className="moving-icon icon-2">
          <FaUsers className="text-yellow-400" />
        </div>
        <div className="moving-icon icon-3">
          <FaGamepad className="text-yellow-400" />
        </div>
        <div className="moving-icon icon-4">
          <GiRocket className="text-yellow-400" />
        </div>
        <div className="moving-icon icon-5">
          <GiRocket className="text-yellow-400" />
        </div>
        {/* Add more icons as needed */}
      </div>

      {/* Highlighted Department Title with Radial Glow */}
      <div className="relative text-center text-2xl font-bold text-yellow-400 mb-1 z-10">
        <span className="absolute inset-0 bg-gradient-radial from-yellow-400 to-transparent opacity-50 rounded-lg"></span>
        <span className="relative px-8 py-2 bg-black bg-opacity-70 rounded-lg shadow-lg">
          Department of Computer Science and Engineering
        </span>
      </div>

      {/* Plain "presents" Text */}
      <div className="text-center text-sm text-gray-300 mb-3 z-10">
        presents
      </div>

      <div className="bg-gray-100 bg-opacity-15 p-2 rounded-full text-center shadow-lg animate-pulse z-10">
        <span className="flex items-center justify-center gap-3 text-lg font-normal">
          <BsLightningCharge className="text-yellow-400" />
          Boost Your Productivity at Obcyfest 3.0!
        </span>
      </div>

      <h1
        className="hero glitch1 layerstext-4xl font-bold tracking-tight text-8xl z-10"
        data-text="OBCYFEST 3.0"
      >
        <span>OBCYFEST 3.0</span>
      </h1>

      {/* Date & Call to Action */}
      <div className="text-center mt-2 mb-5 text-xl z-10">
        <p>
          Kickstarting Innovation on{" "}
          <span className="text-yellow-400 font-bold">October 30, 2024</span>
        </p>
        <p className="text-lg text-gray-300">
          Join us for a day of tech, creativity, and endless inspiration!
        </p>
      </div>

      {/* Key Points with Icons */}
      <div className="flex flex-wrap justify-center gap-6 mt-6 text-gray-200 z-10">
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
        <button className="mt-10 px-8 py-3 bg-yellow-400 rounded-lg cursor-pointer font-semibold text-black-950 hover:bg-yellow-500 transition-colors z-10">
      <Link href={"/events"}>
          Register Now
      </Link>
        </button>
    </div>
  );
}
