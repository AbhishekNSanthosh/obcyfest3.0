"use client"; // If using client components in Next.js

import TitleBar from "@components/TitleBar"; // Ensure this imports your event data
import { events } from "@utils/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Event = {
  image: string;
  regLink: string;
  type: "technical" | "nonTechnical" | "sports";
  id: string | number;
};

export default function EventContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<"all" | "technical" | "nonTechnical">(
    "all"
  );

  // Filter events based on selected type
  const filteredEvents = events.filter((event: Event) => {
    if (filter === "all") return true;
    return event.type === filter;
  });

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
    <div className="pt-[15vh] pb-[5vh] px-[5vw] min-h-[100vh] flex flex-col items-center justify-center w-full gap-[5vh] bg">
      <div className="flex w-full items-center justify-between">
        <TitleBar
          className="text-3xl font-semibold text-yellow-400"
          title="All Events"
        />

        {/* Filter Buttons */}
        <div className="my-4 flex w-full items-center justify-end gap-4">
          <button
            className={`px-4 py-2 rounded-lg ${
              filter === "all" ? "bg-yellow-400 text-black-950" : "border border-yellow-400 bg-black-950 text-yellow-400"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              filter === "technical" ? "bg-yellow-400 text-black-950" : "border border-yellow-400 bg-black-950 text-yellow-400"
            }`}
            onClick={() => setFilter("technical")}
          >
            Technical
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              filter === "nonTechnical" ? "bg-yellow-400 text-black-950" : "border border-yellow-400 bg-black-950 text-yellow-400"
            }`}
            onClick={() => setFilter("nonTechnical")}
          >
            Non-Technical
          </button>
        </div>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-14">
        {filteredEvents.map((event, index) => (
          <div
            key={index}
            className="relative cursor-pointer p-2 border-[0.5px] border-black-900"
            onClick={() => setSelectedEvent(event)}
          >
            <Link href={`/events/${event.id}`}>
            <Image
              src={event.image}
              alt={`Event ${index}`}
              height={200}
              quality={70}
              width={300}
              className="shadow-[5px]"
            />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
