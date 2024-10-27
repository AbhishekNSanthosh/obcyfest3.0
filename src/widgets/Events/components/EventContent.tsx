"use client"; // If using client components in Next.js

import TitleBar from "@components/TitleBar"; // Ensure this imports your event data
import { events } from "@utils/constants";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type Event = {
  image: string;
  regLink: string;
  type: "technical" | "nonTechnical";
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredEvents.map((event, index) => (
          <div
            key={index}
            className="relative cursor-pointer p-2 border-[0.5px] border-black-900"
            onClick={() => setSelectedEvent(event)}
          >
            <Image
              src={event.image}
              alt={`Event ${index}`}
              height={200}
              width={300}
              className="shadow-[5px]"
            />
          </div>
        ))}
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
              src={selectedEvent.image}
              alt="Selected Event"
              height={300}
              width={600}
              className="rounded-lg"
            />
            <button
              className="bg-black-950 text-white w-full px-6 py-2 rounded-md font-semibold shadow-md hover:bg-yellow-600 transition"
              onClick={() => {
                window.open(selectedEvent.regLink, "_blank"); // Open registration link in a new tab
                setSelectedEvent(null); // Close modal after clicking
              }}
            >
              Register Now
            </button>
            <button
              className="absolute top-2 right-2 text-black-950 font-bold text-lg"
              onClick={() => setSelectedEvent(null)} // Close the modal when the close button is clicked
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
