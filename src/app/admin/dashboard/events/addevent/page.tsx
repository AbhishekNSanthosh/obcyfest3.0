"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@lib/firebase";
import { Event } from "@lib/types";
import { eventName } from "@utils/constants";
import Link from "next/link";

const AddNewEvent = () => {
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "events"));
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Event[];
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load events. Please try again.");
      }
    };
    fetchEvents();
  }, []);

  // Delete event
  const deleteEvent = async (eventId: string, eventTitle: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the event "${eventTitle}"?`
      )
    ) {
      return;
    }
    try {
      setError(null);
      await deleteDoc(doc(db, "events", eventId));
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8 text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        Event Management
      </h1>
      <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-400 mb-4">
          Manage {eventName} Events
        </h2>
        <p className="text-gray-400 mb-6">
          Add or modify event details for {eventName}. Changes will be saved to
          the database.
        </p>
        <Link
          href="/admin/dashboard/events/addevent/new"
          className="w-full inline-block text-center bg-yellow-400 text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-500"
          aria-label="Add new event"
        >
          Add New Event
        </Link>

        {events.length === 0 ? (
          <p className="text-gray-400 mt-6">No events found.</p>
        ) : (
          <ul className="space-y-3 mt-6">
            {events.map((event) => (
              <li
                key={event.id}
                className="p-4 bg-gray-800 rounded-lg shadow-sm border border-gray-700"
                role="listitem"
                aria-label={`Event: ${event.title}, Type: ${
                  event.type
                }, Category: ${
                  event.eveType === "ind" ? "Individual" : "Team"
                }, Date: ${event.date || "Not set"}, Venue: ${
                  event.venue || "Not set"
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4 items-center">
                  <div className="space-y-1">
                    <span className="text-lg font-semibold text-gray-300">
                      {event.title}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
                      <span>
                        Type:{" "}
                        {event.type.charAt(0).toUpperCase() +
                          event.type.slice(1)}
                      </span>
                      <span>
                        Category:{" "}
                        {event.eveType === "ind" ? "Individual" : "Team"}
                      </span>
                      <span>Date: {event.date || "Not set"}</span>
                      <span>Venue: {event.venue || "Not set"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center sm:justify-end">
                    <Link
                      href={`/admin/dashboard/events/addevent/${event.id}`}
                      className="px-4 py-2 text-center bg-yellow-400 text-gray-900 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      aria-label={`Edit event ${event.title}`}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteEvent(event.id, event.title)}
                      className="px-4 py-2 text-center bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Delete event ${event.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p className="mt-4 text-red-400 text-center" aria-live="assertive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddNewEvent;
