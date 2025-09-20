"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "@lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { events } from "@utils/constants";
import Loader from "@components/Loader";

type Registration = {
  id: string;
  eventId: string;
  eventTitle: string;
  participants: any[];
};

const parseDate = (str: string) => {
  const [day, month, year] = str.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
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
    <div className="flex gap-2 w-fit">
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
            registrationsByEvent[registration.eventId] +=
              registration.participants.length;
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
              <p className="text-gray-400 text-xs capitalize truncate">
                {"("}
                {event.type.replace(/([a-z])([A-Z])/g, "$1 $2")}
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

            {/* Registrations */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-300 text-sm">Registrations</span>
              <span className="text-3xl font-bold text-yellow-400">
                {eventRegistrations[event.id] || 0}{" "}
                {event?.eveType === "team" ? "Teams" : "Participants"}
              </span>
            </div>

            {/* Registration Deadline */}
            <div className="my-auto">
              <p className="text-xs text-gray-400 mb-1">Registration closes:</p>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-lg bg-gray-800/50 text-white">
                <SmallTimer
                  targetDate={parseDate(event.regFinalDate).toISOString()}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
