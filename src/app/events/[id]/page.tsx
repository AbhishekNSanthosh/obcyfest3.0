import FooterView from '@widgets/Footer'
import HeaderView from '@widgets/Header'
import { events } from '@utils/constants'
import { notFound } from 'next/navigation'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface EventPageProps {
  params: {
    id: string
  }
}

export default function EventPage({ params }: EventPageProps) {
  const event = events.find(e => e.id === params.id)
  
  if (!event) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <HeaderView />
      
      <div className="px-[5vw] py-[10vh] flex flex-col items-center gap-8">
        {/* Event Image */}
        <div className="relative w-full max-w-4xl">
          <Image
            src={event.image}
            alt={event.title}
            width={800}
            height={400}
            className="w-full h-auto rounded-lg shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
        </div>

        {/* Event Details */}
        <div className="w-full max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400">
            {event.title}
          </h1>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              event.type === 'technical' 
                ? 'bg-yellow-400 text-black-950' 
                : 'bg-gray-700 text-gray-300'
            }`}>
              {event.type === 'technical' ? 'Technical Event' : 'Non-Technical Event'}
            </span>
          </div>

          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join us for this exciting event and be part of the innovation journey at Obcyfest 3.0!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={event.regLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-400 text-black-950 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Register Now
            </a>
            
            <Link
              href="/events"
              className="border border-yellow-400 text-yellow-400 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black-950 transition-colors"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>

      <FooterView />
    </main>
  )
}

// Generate static params for all events
export async function generateStaticParams() {
  return events.map((event) => ({
    id: event.id,
  }))
}
