import { events } from "@utils/constants";
import { notFound } from "next/navigation";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { app, db } from "@lib/firebase";
import {
  LuMapPin,
  LuCalendar,
  LuUsers,
  LuIndianRupee,
  LuTrophy,
} from "react-icons/lu";
import type { Metadata } from "next";

import { collection, getDocs } from "firebase/firestore";
import CountdownTimer from "@widgets/Events/components/CountdownTimer";

export async function generateMetadata({
  params,
}: {
  params: { eventId: string };
}): Promise<Metadata> {
  const { eventId } = await params;
  const event = events.find((e) => e.id === eventId);


  if (!event) {
    return {
      title: "Event Not Found | ObcyFest",
      description: "The event you are looking for does not exist.",
    };
  }

  return {
    title: `${event.title} | ObcyFest 4.0`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [
        {
          url: event.image, // make sure it's absolute URL if you want OG image
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description,
      images: [event.bgImage],
    },
  };
}

interface EventPageProps {
  params: {
    eventId: string;
  };
}

type Registration = {
  id: string;
  eventId: string;
  eventTitle: string;
  participants: any[];
};

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;
  const event = events.find((e) => e.id === eventId);


  if (!event) {
    notFound();
  }

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

  const parseDate = (str: string) => {
    const [day, month, year] = str.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "technical":
        return "bg-yellow-400 text-black-950";
      case "nonTechnical":
        return "bg-yellow-400 text-black-950";
      case "sports":
        return "bg-yellow-400 text-black-950";
      default:
        return "bg-yellow-400 text-black-950";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "technical":
        return "Technical Event";
      case "nonTechnical":
        return "Non-Technical Event";
      case "sports":
        return "Sports Event";
      default:
        return "Event";
    }
  };

  const isOpenForRegistration = event?.regFinalDate &&
  parseDate(event.regFinalDate) >= new Date() &&
  (typeof event.maxParticipation !== "undefined"
    ? registrationsByEvent[event.id] <=
        Number(
          event.maxParticipation
            .replace(/Teams?/i, "")
            .replace(/Participants?/i, "")
            .trim()): true)

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      {/* Full-page background image */}
      <Image
        src={event.bgImage}
        alt={event.title}
        quality={40}
        fill
        priority
        className="object-cover object-center -z-10"
      />

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/70 -z-10"></div>

      {/* Page Content */}
      <div className="flex flex-col flex-1">
        {/* Hero */}
        <div className="relative flex lg:h-[60vh] overflow-hidden">
          <div className="relative z-10 flex flex-1 flex-col items-center justify-end lg:pb-[6vh]">
            <div className="max-w-6xl px-[5vw] py-[5vh] mx-auto w-full">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-justify text-yellow-400 tracking-tight leading-tight mb-4 mt-8">
                {event.title}
              </h1>
              <p className="text-gray-300 text-md md:text-lg max-w-6xl leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        </div>
        {/* Main Content Section */}
        <div className="flex flex-1 px-[5vw] py-[5vh]">
          <div className="flex flex-col max-w-5xl mx-auto w-full">
            {/* Event Details Grid */}
            <div className="flex flex-wrap gap-6 mb-8">
              {event.date && (
                <div className="flex-1 min-w-[280px] bg-black-950 bg-opacity-80 p-6 rounded-xl flex items-center space-x-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/20 border border-black-900">
                  <div className="bg-yellow-400/20 p-3 rounded-lg flex-shrink-0">
                    <LuCalendar className="text-yellow-400 text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-400 text-sm mb-1">
                      Date
                    </h3>
                    <p className="text-lg text-white font-medium">
                      {event.date}
                    </p>
                  </div>
                </div>
              )}

              {event.venue && (
                <div className="flex-1 min-w-[280px] bg-black-950 bg-opacity-80 p-6 rounded-xl flex items-center space-x-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/20 border border-black-900">
                  <div className="bg-yellow-400/20 p-3 rounded-lg flex-shrink-0">
                    <LuMapPin className="text-yellow-400 text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-400 text-sm mb-1">
                      Venue
                    </h3>
                    <p className="text-lg text-white font-medium">
                      {event.venue}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex-1 min-w-[280px] bg-black-950 bg-opacity-80 p-6 rounded-xl flex items-center space-x-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/20 border border-black-900">
                <div className="bg-yellow-400/20 p-3 rounded-lg flex-shrink-0">
                  <LuUsers className="text-yellow-400 text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-400 text-sm mb-1">
                    Participation
                  </h3>
                  <p className="text-lg text-white font-medium">
                    {event.eventType}
                  </p>
                </div>
              </div>

              <div className="flex-1 min-w-[280px] bg-black-950 bg-opacity-80 p-6 rounded-xl flex items-center space-x-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/20 border border-black-900">
                <div className="bg-yellow-400/20 p-3 rounded-lg flex-shrink-0">
                  <LuIndianRupee className="text-yellow-400 text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-400 text-sm mb-1">
                    Registration Fee
                  </h3>
                  <p className="text-lg text-white font-medium">
                    {event.registrationFee}
                  </p>
                </div>
              </div>

              <div className="flex-1 min-w-[280px] bg-black-950 bg-opacity-80 p-6 rounded-xl flex items-center space-x-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/20 border border-black-900">
                <div className="bg-yellow-400/20 p-3 rounded-lg flex-shrink-0">
                  <LuTrophy className="text-yellow-400 text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-400 text-sm mb-1">
                    Prizes
                  </h3>
                  <p className="text-lg text-white font-medium">
                    1st: {event.firstPrize}
                    {event.secondPrize && ` | 2nd: ${event.secondPrize}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Coordinators Section */}
            <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl mb-8 border border-black-900">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                Event Coordinators
              </h3>
              <div className="flex flex-wrap justify-center items-center gap-3">
                {event.coordinators.map((coordinator, index) => (
                  <Link
                    key={index}
                    href={`https://wa.me/${
                      coordinator.phone
                    }?text=${encodeURIComponent(
                      `Hi, I have a question regarding the event "**${event.title}**". Could you help me with it?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center justify-center gap-2 bg-yellow-400/10 text-gray-300 text-base px-4 py-2 rounded-lg shadow-lg border border-yellow-400/30 hover:bg-yellow-400/20 transition-all duration-300"
                  >
                    {coordinator.name}{" "}
                    <Image
                      src={"/wp.png"}
                      alt=""
                      className="w-[1.8rem] h-[1.8rem]"
                      height={100}
                      width={100}
                    />
                  </Link>
                ))}
              </div>
            </div>
            {isOpenForRegistration && (
                <CountdownTimer targetDate={event.regFinalDate} />
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
        </div>
      </div>
     
    </div>
  );
}

// Generate static params for all events
export async function generateStaticParams() {
  return events.map((event) => ({
    id: event.id,
  }));
}
