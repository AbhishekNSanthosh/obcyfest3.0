"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "@lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { events } from "@utils/constants";
import Loader from "@components/Loader";
import toast from "react-hot-toast";
import parseDate from "@utils/parseDate";
import Link from "next/link";

type Registration = {
  id: string;
  eventId: string;
  eventTitle: string;
  participants: any[];
};

function SmallTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = React.useState(getTimeRemaining(targetDate));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-2">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-lg font-bold bg-black/40 px-2 py-1 rounded-md">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase text-gray-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

function getTimeRemaining(targetDate: string) {
  const total = Date.parse(targetDate) - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { Days: days, Hrs: hours, Min: minutes, Sec: seconds };
}

const page = () => {
  const [eventRegistrations, setEventRegistrations] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        // if (docSnap.exists() && (docSnap.data().role === 'admin' || docSnap.data().role === 'guest')) {
        if (docSnap.exists()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.replace("/");
        }
      } else {
        setIsAdmin(false);
        router.replace("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const registrationsCollection = collection(db, "registrations");
        const registrationsSnapshot = await getDocs(registrationsCollection);
        const registrations = registrationsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Registration)
        );

        const registrationsByEvent: Record<string, number> = {};
        events.forEach((event) => (registrationsByEvent[event.id] = 0));

        registrations.forEach((registration) => {
          if (registrationsByEvent[registration.eventId] !== undefined) {
            registrationsByEvent[registration.eventId] += 1;
          }
        });

        setEventRegistrations(registrationsByEvent);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="px-[5vw] text-white">
      <h2 className="text-2xl sm:text-2xl font-bold text-yellow-400 mb-6 mt-[100px]">
        Event Registrations
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-black/70 backdrop-blur-md border border-gray-700 rounded-xl p-6 shadow-md hover:shadow-yellow-500/10 transition-all duration-300 flex flex-col"
          >
            {/* Event Title */}
            <div className="flex flex-row items-center justify-between">
              {" "}
              <h3
                className="font-semibold text-lg text-white truncate"
                title={event.title}
              >
                {event.title}{" "}
              </h3>
              <p className="text-gray-400 text-sm ">
                {"("}
                {event.type}
                {")"}
              </p>
            </div>
            <div className="h-[0.5px] w-full bg-gray-100/50 my-3"></div>
            <p className="text-gray-400 text-sm mb-4">
              Max Participants: {event.maxParticipation}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Min Participants:{" "}
              <span className="bg-yellow-400 text-gray-900 font-bold">
                {event.minParticipation}
              </span>{" "}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Reg Fee:{" "}
              <span className=" font-bold">
                {event?.registrationFee}
              </span>{" "}
            </p>

            {/* Registrations */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-300 text-sm">Registrations</span>
              <span className="text-3xl font-bold text-yellow-400">
                {eventRegistrations[event.id] || 0}{" "}
                <span className="text-xs truncate font-normal">
                  {event?.eveType === "team" ? "Teams" : "Participants"}
                </span>
              </span>
            </div>
            <span className="text-[11px] font-extralight mb-2">
              Note: If the minimum number of registrations is not achieved, the
              event will be disqualified.
            </span>

            {/* Registration Deadline */}
            {event?.regFinalDate &&
              (parseDate(event.regFinalDate) >= new Date() &&
              (typeof event.maxParticipation !== "undefined"
                ? eventRegistrations[event.id] <
                  Number(
                    event.maxParticipation
                      .replace(/Teams?/i, "")
                      .replace(/Participants?/i, "")
                      .trim()
                  )
                : true) ? (
                // ✅ Registration OPEN
                <div className="my-auto">
                  <p className="text-xs text-gray-400 mb-1">
                    Registration closes:
                  </p>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-lg bg-gray-800 text-white">
                    <SmallTimer
                      targetDate={parseDate(event.regFinalDate).toISOString()}
                    />
                  </div>
                </div>
              ) : parseDate(event.regFinalDate) < new Date() &&
                typeof event.minParticipation !== "undefined" &&
                eventRegistrations[event.id] <
                  Number(
                    event.minParticipation
                      .replace(/Teams?/i, "")
                      .replace(/Participants?/i, "")
                      .trim()
                  ) ? (
                // ⚠️ Requirement Not Met
                <div className="my-auto">
                  <p className="text-xs text-gray-400 mb-1">Status:</p>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-lg bg-yellow-600 text-white">
                    Requirement Not Met
                  </div>
                </div>
              ) : (
                // ❌ Registration CLOSED
                <div className="my-auto">
                  <p className="text-xs text-gray-400 mb-1">Status:</p>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-lg bg-red-700 text-white">
                    Registration Closed
                  </div>
                </div>
              ))}

            <span className="text-xs mt-2 mb-[-10px]">
              Share with your friends
            </span>
            <div className="flex flex-col gap-3 mt-4">
              {/* Copy Link Button */}
              <button
                onClick={() => {
                  const eventUrl = `https://obcyfest.carmelcet.in/events/${event.id}`;
                  navigator.clipboard.writeText(eventUrl).then(() => {
                    toast.success("✅ Event link copied to clipboard!");
                  });
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
               bg-gray-800 text-white hover:bg-gray-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-copy"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Copy Link
              </button>

              {/* Share on WhatsApp */}
              <button
                onClick={() => {
                  const eventUrl = `https://obcyfest.carmelcet.in/events/${event.id}`;
                  const message =
                    `*Hey there!*\n\n` +
                    `Check out this awesome event at *ObcyFest*!\n` +
                    `Don't miss out on the fun!\n\n` +
                    `Event link: ${eventUrl}\n\n` +
                    `See you there!`;

                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                    message
                  )}`;
                  window.open(whatsappUrl, "_blank");
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
               bg-green-500 text-white hover:bg-green-600 transition"
              >
                {/* <div className="border border-white rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="lucide"
                  >
                    <path d="M16.7 13.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1-1.1 2.5 0 1.5 1.1 3 1.3 3.2.2.2 2.1 3.2 5 4.5.7.3 1.2.5 1.6.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.3.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.6-.3z" />
                  </svg>
                </div> */}
                Share on WhatsApp
              </button>

              {/* View Registrations Link */}
              <Link
                href={`/public/statistics/${event?.id}`}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
               bg-yellow-400 text-black hover:bg-yellow-500 transition"
              >
                View Registrations
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
