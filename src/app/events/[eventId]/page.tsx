import { events } from '@utils/constants'
import { notFound } from 'next/navigation'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LuMapPin, LuCalendar, LuUsers, LuIndianRupee, LuTrophy } from 'react-icons/lu';

// Assuming the updated Event type is available in @utils/constants
// interface Event {
//     id: string;
//     title: string;
//     image: string;
//     regLink: string;
//     type: 'technical' | 'nonTechnical' | 'sports';
//     date?: string;
//     description: string;
//     venue?: string;
//     eventType: string;
//     maxParticipation?: string;
//     minParticipation?: string;
//     totalParticipation?: string;
//     registrationFee: string;
//     firstPrize: string;
//     secondPrize?: string;
//     coordinators: string[];
// }

interface EventPageProps {
  params: {
    eventId: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const {eventId} = await params
  const event = events.find(e => e.id === eventId)

  if (!event) {
    notFound()
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'technical':
        return 'bg-yellow-400 text-black-950';
      case 'nonTechnical':
        return 'bg-yellow-400 text-black-950';
      case 'sports':
        return 'bg-yellow-400 text-black-950';
      default:
        return 'bg-yellow-400 text-black-950';
    }
  };

  const getTypeName = (type: string) => {
    switch(type) {
      case 'technical':
        return 'Technical Event';
      case 'nonTechnical':
        return 'Non-Technical Event';
      case 'sports':
        return 'Sports Event';
      default:
        return 'Event';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg text-white">
      {/* Hero Section with Image and Title */}
      <div className="relative flex h-[40vh] lg:h-[60vh] overflow-scroll-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-end px-[5vw]  lg:pb-[6vh]">
          <div className="max-w-4xl mx-auto w-full">
            {/* Event Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-yellow-400 tracking-tight leading-tight mb-4 mt-8">
              {event.title}
            </h1>
            
            {/* Event Description */}
            <p className="text-gray-300 text-md md:text-lg max-w-3xl leading-relaxed">
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
                  <h3 className="font-semibold text-gray-400 text-sm mb-1">Date</h3>
                  <p className="text-lg text-white font-medium">{event.date}</p>
                </div>
              </div>
            )}
            
            {event.venue && (
              <div className="flex-1 min-w-[280px] bg-black-950 bg-opacity-80 p-6 rounded-xl flex items-center space-x-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/20 border border-black-900">
                <div className="bg-yellow-400/20 p-3 rounded-lg flex-shrink-0">
                  <LuMapPin className="text-yellow-400 text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-400 text-sm mb-1">Venue</h3>
                  <p className="text-lg text-white font-medium">{event.venue}</p>
                </div>
              </div>
            )}

            <div className="flex-1 min-w-[280px] bg-black-950 bg-opacity-80 p-6 rounded-xl flex items-center space-x-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/20 border border-black-900">
              <div className="bg-yellow-400/20 p-3 rounded-lg flex-shrink-0">
                <LuUsers className="text-yellow-400 text-2xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-400 text-sm mb-1">Participation</h3>
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
                <h3 className="font-semibold text-gray-400 text-sm mb-1">Registration Fee</h3>
                <p className="text-lg text-white font-medium">{event.registrationFee}</p>
              </div>
            </div>

            <div className="flex-1 min-w-[280px] bg-black-950 bg-opacity-80 p-6 rounded-xl flex items-center space-x-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/20 border border-black-900">
              <div className="bg-yellow-400/20 p-3 rounded-lg flex-shrink-0">
                <LuTrophy className="text-yellow-400 text-2xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-400 text-sm mb-1">Prizes</h3>
                <p className="text-lg text-white font-medium">
                  1st: {event.firstPrize}
                  {event.secondPrize && ` | 2nd: ${event.secondPrize}`}
                </p>
              </div>
            </div>
          </div>

          {/* Coordinators Section */}
          <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl mb-8 border border-black-900">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Event Coordinators</h3>
            <div className="flex flex-wrap justify-center items-center gap-3">
              {event.coordinators.map((coordinator, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 bg-yellow-400/10 text-gray-300 text-base px-4 py-2 rounded-lg shadow-lg border border-yellow-400/30 hover:bg-yellow-400/20 transition-all duration-300"
                >
                  {coordinator}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={`./${eventId}/register`}
              className="flex-shrink-0 bg-yellow-400 text-black-950 px-8 py-3 rounded-lg font-semibold text-base shadow-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105"
            >
              Register Now
            </a>
            
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
  )
}

// Generate static params for all events
export async function generateStaticParams() {
  return events.map((event) => ({
    id: event.id,
  }))
}
