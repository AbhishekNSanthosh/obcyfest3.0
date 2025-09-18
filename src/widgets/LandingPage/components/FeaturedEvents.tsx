"use client";
import TitleBar from "@components/TitleBar";
import { events } from "@utils/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { LuUsers, LuUser } from "react-icons/lu";

export default function FeaturedEvents() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<(typeof events)[0] | null>(
    null
  );
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const delay = 2000;
  let scrollInterval: NodeJS.Timeout | null = null;

  // ✅ Detect scroll amount based on screen width
  const getScrollAmount = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? 320 : 300; // mobile = 320px
    }
    return 300;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => {
      if (scrollRef.current) observer.unobserve(scrollRef.current);
    };
  }, []);

  // Add these near your other refs / state at the top of the component
  const currentIndexRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const getItems = () => Array.from(container.children) as HTMLElement[];

    const startAutoScroll = () => {
      const items = getItems();
      if (items.length === 0) return;

      // find nearest item to current scroll so we resume from that item
      let nearest = 0;
      let minDiff = Infinity;
      items.forEach((it, i) => {
        const diff = Math.abs(
          (it.offsetLeft || 0) - (container.scrollLeft || 0)
        );
        if (diff < minDiff) {
          minDiff = diff;
          nearest = i;
        }
      });
      currentIndexRef.current = nearest;

      // clear any previous interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      intervalRef.current = setInterval(() => {
        if (!scrollRef.current) return;
        const itemsNow = getItems();
        if (itemsNow.length === 0) return;

        // compute next index (wrap to 0)
        let nextIndex = currentIndexRef.current + 1;
        if (nextIndex >= itemsNow.length) nextIndex = 0;

        // target scrollLeft == offsetLeft of the target item
        const targetLeft =
          itemsNow[nextIndex].offsetLeft - (scrollRef.current.offsetLeft || 0);

        // smooth scroll to the exact card position
        scrollRef.current.scrollTo({ left: targetLeft, behavior: "smooth" });

        currentIndexRef.current = nextIndex;
      }, delay);
    };

    // start / stop based on visibility & hover
    if (isVisible && !isHovered) {
      startAutoScroll();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // reset on resize (re-measure offsets)
    const handleResize = () => {
      currentIndexRef.current = 0;
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isVisible, isHovered, delay]);

  useEffect(() => {
    if (selectedEvent) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [selectedEvent]);

  return (
    <div className="px-[5vw] md:pt-[10vh] lg:pt-[10vh] pt-[3vh] flex flex-col gap-8">
      <TitleBar
        title="Featured Events"
        className="text-3xl capitalize font-semibold text-yellow-400"
      />

      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none rounded-l-lg"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none rounded-r-lg"></div>

        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex overflow-x-scroll whitespace-nowrap gap-4 rounded-lg p-4 bg-black-950 shadow-lg border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 group"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {events.map((event, index) => (
            <div key={index} className="relative group/item flex-shrink-0">
              <Link href={`/events/${event.id}`}>
                <div className="relative overflow-hidden rounded-lg cursor-pointer transform transition-all duration-500 hover:-translate-y-4 hover:scale-105 group-hover/item:shadow-2xl">
                  <Image
                    src={event?.image}
                    alt={event?.title || `Event ${index}`}
                    height={120}
                    width={320}
                    className="rounded-lg shadow-md transition-all duration-500 border-2 border-transparent hover:border-yellow-400/60 group-hover/item:brightness-110 transform-gpu"
                  />
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
