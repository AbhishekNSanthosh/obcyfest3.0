"use client";

import TitleBar from "@components/TitleBar";
import { Event } from "@lib/types";
import { events } from "@utils/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import EventSkeleton from "./EventSkeleton";

export default function EventContent() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "technical" | "nonTechnical">("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

  const filteredEvents = events.filter((event: Event) => {
    if (filter === "all") return true;
    return event.type === filter;
  });

  return (
    <div className="pt-[10vh] lg:pt-[15vh] pb-[5vh] px-[5vw] min-h-[100vh] flex flex-col items-center justify-center w-full gap-[5vh] bg">
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  {/* Left: Title */}
  <TitleBar
    className="text-2xl lg:text-3xl font-semibold text-yellow-400"
    title="All Events"
  />

  {/* Right: Filters */}
  <div className="flex items-center justify-end gap-3 lg:gap-5 overflow-x-auto md:overflow-visible scrollbar-hide">
    {[
      { key: "all", label: "All" },
      { key: "technical", label: "Technical" },
      { key: "nonTechnical", label: "Non-Technical" },
    ].map((btn) => (
      <button
        key={btn.key}
        className={`px-4 lg:px-6 py-2 rounded-lg text-sm lg:text-base font-medium whitespace-nowrap transition-colors ${
          filter === btn.key
            ? "bg-yellow-400 text-black-950 shadow-md"
            : "border border-yellow-400 bg-black-950 text-yellow-400 hover:bg-yellow-500 hover:text-black-950"
        }`}
        onClick={() => setFilter(btn.key as "all" | "technical" | "nonTechnical")}
      >
        {btn.label}
      </button>
    ))}
  </div>
</div>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-14">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <EventSkeleton key={index} />
            ))
          : filteredEvents.map((event) => (
              <div
                key={event.id}
                className="relative cursor-pointer p-2 border-[0.5px] border-black-900"
              >
                <Link href={`./events/${event.id}`}>
                  <Image
                    src={event.image}
                    alt={`Event ${event.id}`}
                    height={200}
                    quality={60}
                    width={300}
                    className="shadow-[5px] w-full h-auto"
                  />
                </Link>
              </div>
            ))}
      </div>
    </div>
  );
}
