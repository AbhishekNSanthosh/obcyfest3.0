"use client"; // If using client components in Next.js

import TitleBar from "@components/TitleBar"; // Ensure this imports your event data
import { events } from "@utils/constants";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { HiOutlineFilter } from "react-icons/hi"; // Import a filter icon for mobile sort

type Event = {
  image: string;
  regLink: string;
  type: "technical" | "nonTechnical";
};

export default function EventContent() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<"all" | "technical" | "nonTechnical">("all");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // Filter events based on selected type
  const filteredEvents = events.filter((event: Event) => {
    if (filter === "all") return true;
    return event.type === filter;
  });

  useEffect(() => {
    if (selectedEvent || isSortModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [selectedEvent, isSortModalOpen]);

  return (
    <div className="pt-[15vh] pb-[5vh] px-[5vw] min-h-[100vh] flex flex-col items-center justify-center w-full gap-[5vh] bg">
      <div className="md:flex-row flex flex-col lg:flex-row w-full items-center justify-between">
        <TitleBar className="text-3xl font-semibold text-yellow-400" title="All Events" />

        {/* Filter Buttons for Desktop */}
        <div className="my-4 md:flex-row lg:flex-row hidden md:flex w-full items-center justify-end gap-4">
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

        {/* Sort Icon for Mobile */}
        <div className="md:hidden flex w-full justify-end">
          <HiOutlineFilter
            className="text-3xl text-yellow-400 cursor-pointer"
            onClick={() => setIsSortModalOpen(true)}
          />
        </div>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full items-center justify-center">
        {filteredEvents.map((event, index) => (
          <div
            key={index}
            className="relative cursor-pointer p-2  h-auto w-auto"
            onClick={() => setSelectedEvent(event)}
          >
            <Image
              src={event.image}
              alt={`Event ${index}`}
              height={200}
              width={300}
              className="shadow-[5px] border border-black-900 p-1"
            />
          </div>
        ))}
      </div>

      {/* Sort Modal for Mobile */}
      {isSortModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black-950 bg-opacity-50 backdrop-blur-md"
          onClick={() => setIsSortModalOpen(false)}
        >
          <div
            className="relative bg-yellow-400 rounded-lg p-6 w-[80vw] max-w-xs flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={`w-full px-4 py-2 rounded-lg ${
                filter === "all" ? "bg-black-950 text-yellow-400" : "text-black-950"
              }`}
              onClick={() => {
                setFilter("all");
                setIsSortModalOpen(false);
              }}
            >
              All
            </button>
            <button
              className={`w-full px-4 py-2 rounded-lg ${
                filter === "technical" ? "bg-black-950 text-yellow-400" : "text-black-950"
              }`}
              onClick={() => {
                setFilter("technical");
                setIsSortModalOpen(false);
              }}
            >
              Technical
            </button>
            <button
              className={`w-full px-4 py-2 rounded-lg ${
                filter === "nonTechnical" ? "bg-black-950 text-yellow-400" : "text-black-950"
              }`}
              onClick={() => {
                setFilter("nonTechnical");
                setIsSortModalOpen(false);
              }}
            >
              Non-Technical
            </button>
          </div>
        </div>
      )}

      {/* Modal for Event Details */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black-950 backdrop-blur-md bg-opacity-30"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="relative bg-yellow-400 rounded-lg p-6 w-[90vw] max-w-lg mx-auto flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedEvent.image}
              alt="Selected Event"
              height={300}
              width={600}
              className="rounded-lg"
            />
            <button
              className="bg-black-950 text-white w-full px-6 py-2 rounded-md font-semibold shadow-md hover:bg-yellow-600 transition"
              onClick={() => {
                window.open(selectedEvent.regLink, "_blank");
                setSelectedEvent(null);
              }}
            >
              Register Now
            </button>
            <button
              className="absolute top-2 right-2 text-black-950 font-bold text-lg"
              onClick={() => setSelectedEvent(null)}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
