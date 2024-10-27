"use client";
import TitleBar from "@components/TitleBar";
import { events } from "@utils/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

export default function FeaturedEvents() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false); // Track visibility
  const scrollAmount = 300; // Scroll by 300px each time
  const delay = 3000; // 3 seconds delay
  let scrollInterval: NodeJS.Timeout | null = null; // Store interval ID

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start scrolling when the section is in view
            setIsVisible(true);
          } else {
            // Stop scrolling when the section is out of view
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the section is visible
    );

    if (scrollRef.current) {
      observer.observe(scrollRef.current); // Observe the scrollRef
    }

    return () => {
      if (scrollRef.current) {
        observer.unobserve(scrollRef.current); // Cleanup observer on unmount
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Start scrolling effect
      scrollInterval = setInterval(() => {
        if (scrollRef.current) {
          const maxScrollLeft =
            scrollRef.current.scrollWidth - scrollRef.current.clientWidth;

          // Check if reached the end, then reset to the start
          if (scrollRef.current.scrollLeft >= maxScrollLeft) {
            scrollRef.current.scrollLeft = 0;
          } else {
            scrollRef.current.scrollLeft += scrollAmount; // Scroll left by 1000px
          }
        }
      }, delay);
    } else if (scrollInterval) {
      clearInterval(scrollInterval); // Stop scrolling when out of view
    }

    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval); // Cleanup interval on component unmount
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (selectedEvent) {
      // Disable scrolling on the body when the modal is open
      document.body.classList.add("overflow-hidden");
    } else {
      // Enable scrolling on the body when the modal is closed
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup: Remove class on component unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [selectedEvent]);

  return (
    <div className="px-[5vw] md:pt-[10vh] lg:pt-[10vh] pt-[3vh] flex flex-col gap-8">
      <TitleBar
        title="Featured Events"
        className="text-3xl font-semibold capitalize text-yellow-400"
      />
      <div
        ref={scrollRef}
        className="relative flex overflow-x-scroll scrolldiv whitespace-nowrap gap-2 rounded-lg p-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 shadow-lg"
      >
        {/* Duplicate images array to create a seamless scroll */}
        {events.map((event, index) => (
          <Image
            key={index}
            src={event?.image}
            alt={`Event ${index}`}
            height={100}
            width={300}
            className="rounded-lg shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setSelectedEvent(event?.image)} // Set selected image on click
          />
        ))}
      </div>
      <div className="">
        <span className="text-gray-500 text-left text-xs italic tracking-wide">
          *Click to register for the event
        </span>
      </div>
      <div className="w-full items-center justify-center flex">
        <Link href={"/events"}>
          <button className="bg-yellow-400 text-black-950 px-3 py-2 rounded-[5px] font-semibold">
            View All Events
          </button>
        </Link>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black-900 backdrop-blur-md bg-opacity-30"
          onClick={() => setSelectedEvent(null)} // Close modal on background click
        >
          <div
            className="relative bg-yellow-400 rounded-lg p-6 w-[90vw] max-w-lg mx-auto flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <Image
              src={selectedEvent}
              alt="Selected Event"
              height={300}
              width={600}
              className="rounded-lg"
            />
            <button
              className="absolute top-2 right-2 text-black-950 font-bold text-lg"
              onClick={() => setSelectedEvent(null)} // Close the modal when the close button is clicked
            >
              X
            </button>
            <button
              className="bg-black-950 text-white w-full px-6 py-2 rounded-md font-semibold shadow-md hover:bg-yellow-600 transition"
              onClick={() => alert("Register Now button clicked!")} // Placeholder action for the button
            >
              Register Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
