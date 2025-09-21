"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CountdownTimer from "./CountdownTimer";
import { events } from "@utils/constants";
import { db } from "@lib/firebase"; // adjust path if needed
import { collection, getDocs } from "firebase/firestore";
import  parseDate  from "@utils/parseDate"; // adjust path if needed

interface Props {
  eventId: string;
}

type Registration = {
  id: string;
  eventId: string;
  eventTitle: string;
  participants: any[];
};

const RegisterButtonSection: React.FC<Props> = ({ eventId }) => {
  const [registrationsByEvent, setRegistrationsByEvent] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);

  const event = events.find((e) => e.id === eventId);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const registrationsCollection = collection(db, "registrations");
        const registrationsSnapshot = await getDocs(registrationsCollection);
        const registrations = registrationsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Registration)
        );

        const counts: Record<string, number> = {};
        events.forEach((e) => (counts[e.id] = 0));

        registrations.forEach((registration) => {
          if (counts[registration.eventId] !== undefined) {
            counts[registration.eventId] += 1;
          }
        });

        setRegistrationsByEvent(counts);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);


  if (loading) {
  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
      {/* Countdown skeleton */}
      <div className="h-8 w-48 bg-gray-700 rounded animate-pulse"></div>

      {/* Slots / min participation skeleton */}
      <div className="h-6 w-64 bg-gray-700 rounded animate-pulse"></div>
      <div className="h-4 w-56 bg-gray-600 rounded animate-pulse"></div>

      {/* Buttons skeleton */}
      <div className="flex gap-4 mt-6">
        <div className="h-10 w-32 bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}


  const isOpenForRegistration =
    event?.regFinalDate &&
    parseDate(event.regFinalDate) >= new Date() &&
    (typeof event.maxParticipation !== "undefined"
      ? registrationsByEvent[event.id] <
        Number(
          event.maxParticipation
            .replace(/Teams?/i, "")
            .replace(/Participants?/i, "")
            .trim()
        )
      : true);

  return (
    <div>
      {isOpenForRegistration ? (
        <>
          <CountdownTimer targetDate={event.regFinalDate} />

          <div className="flex flex-col items-center space-y-3 mb-5">
            {/* Minimum Participation */}
            {event.minParticipation &&
              (() => {
                const required = Number(
                  event.minParticipation
                    .replace(/Teams?/i, "")
                    .replace(/Participants?/i, "")
                    .trim()
                );
                const current = registrationsByEvent[event.id] || 0;
                const remaining = required - current;

                if (remaining <= 0) return null;

                return (
                  <>
                    <p className="text-white bg-red-600 font-semibold text-lg px-3 py-1 rounded-lg shadow-md animate-pulse text-center">
                      {event?.eveType?.toLowerCase() === "team"
                        ? `${remaining} more team${
                            remaining > 1 ? "s" : ""
                          } required`
                        : `${remaining} more participant${
                            remaining > 1 ? "s" : ""
                          } required`}
                    </p>
                    <p className="text-gray-300 text-sm italic text-center">
                      ⚠️ Note: If the minimum number of registrations is not
                      achieved, the event will be cancelled.
                    </p>
                  </>
                );
              })()}

            {/* Slots Left */}
            {event.maxParticipation && (
              <p className="text-white bg-red-600 font-semibold text-lg px-3 py-1 rounded-lg shadow-md animate-pulse text-center">
                Slots Left:{" "}
                {Number(
                  event.maxParticipation
                    .replace(/Teams?/i, "")
                    .replace(/Participants?/i, "")
                    .trim()
                ) - (registrationsByEvent[event.id] || 0)}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-center my-3">
          <div className="flex bg-red-600 text-white px-8 py-3 rounded-lg font-semibold text-base shadow-lg transition-all duration-300">
            Registration Closed
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {isOpenForRegistration && (
          <Link
            href={`./${eventId}/register`}
            className="flex-shrink-0 bg-yellow-400 text-black-950 px-8 py-3 rounded-lg font-semibold text-base shadow-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105"
          >
            Register Now
          </Link>
        )}

        <Link
          href="/events"
          className="flex-shrink-0 border border-yellow-400 text-yellow-400 px-8 py-3 rounded-lg font-semibold text-base shadow-lg hover:bg-yellow-400 hover:text-black-950 transition-all duration-300 transform hover:scale-105"
        >
          Back to Events
        </Link>
      </div>
    </div>
  );
};

export default RegisterButtonSection;
