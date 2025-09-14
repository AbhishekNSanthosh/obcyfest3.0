"use client";
import TitleBar from "@components/TitleBar";
import { events } from "@utils/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

export default function FeaturedEvents() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false); // Track visibility
  const [isHovered, setIsHovered] = useState<boolean>(false); // Track hover state
  const scrollAmount = 300; // Scroll by 300px each time
  const delay = 2000; // 2 seconds delay
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
    if (isVisible && !isHovered) {
      // Start scrolling effect only when visible and not hovered
      scrollInterval = setInterval(() => {
        if (scrollRef.current) {
          const maxScrollLeft =
            scrollRef.current.scrollWidth - scrollRef.current.clientWidth;

          // Check if reached the end, then reset to the start
          if (scrollRef.current.scrollLeft >= maxScrollLeft) {
            scrollRef.current.scrollLeft = 0;
          } else {
            scrollRef.current.scrollLeft += scrollAmount; // Scroll left by 300px
          }
        }
      }, delay);
    } else if (scrollInterval) {
      clearInterval(scrollInterval); // Stop scrolling when out of view or hovered
    }

    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval); // Cleanup interval on component unmount
      }
    };
  }, [isVisible, isHovered]);

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
        className="text-3xl capitalize font-semibold text-yellow-400"
      />
      
      {/* Enhanced scroll container with better styling */}
      <div className="relative group">
        {/* Gradient overlays for better visual effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none rounded-l-lg"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none rounded-r-lg"></div>
        
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex overflow-x-scroll scrolldiv whitespace-nowrap gap-4 rounded-lg p-4 bg-black-950 shadow-lg border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 group"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* Duplicate images array to create a seamless scroll */}
          {events.map((event, index) => (
            <div
              key={index}
              className="relative group/item flex-shrink-0"
            >
              <Link href={`/events/${event.id}`}>
              <div 
                className="relative overflow-hidden rounded-lg cursor-pointer transform transition-all duration-500 hover:-translate-y-4 hover:scale-105 group-hover/item:shadow-2xl"
              >
                <Image
                  src={event?.image}
                  alt={event?.title || `Event ${index}`}
                  height={120}
                  width={320}
                  className="rounded-lg shadow-md transition-all duration-500 border-2 border-transparent hover:border-yellow-400/60 group-hover/item:brightness-110 transform-gpu"
                />
                {/* Overlay effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-300 rounded-lg flex flex-col items-center justify-center">
                  <h3 className="text-white font-bold text-lg mb-2 text-center px-2">
                    {event?.title || `Event ${index + 1}`}
                  </h3>
                  <span className="text-black-950 font-semibold text-sm px-3 py-1 bg-yellow-400 rounded-md">
                    Click to View
                  </span>
                </div>
                </div>
                </Link>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span className="text-gray-400 text-sm italic tracking-wide">
          Hover to pause • Click any event to register
        </span>
      </div>
      
      <div className="w-full items-center justify-center flex">
        <Link href={"/events"}>
          <button className="bg-yellow-400 rounded-lg px-8 py-3 text-black-950 font-semibold hover:bg-yellow-500 transition-colors">
            View All Events
          </button>
        </Link>
      </div>
    </div>
  );
}

