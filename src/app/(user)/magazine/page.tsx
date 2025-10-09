import React from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@lib/firebase";
import Image from "next/image";
import Link from "next/link";

// Define eBook interface
interface Ebook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  link: string;
}

// Data fetching component with error handling
const EbooksDataLoader = async () => {
  try {
    const ebooks = await fetchEbooks();

    if (ebooks.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-yellow-200 text-xl">No eBooks found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 scrolldiv">
        {ebooks.map((ebook) => (
          <div
            key={ebook.id}
            className="group relative bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-slate-950/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 ease-out transform hover:-translate-y-2 border border-slate-700/60 hover:border-slate-600/70 w-full max-w-[18rem] h-[32rem] mx-auto"
          >
            {/* Image Container with Enhanced Effects */}
            <div className="relative h-[21rem] w-full overflow-hidden">
              <Image
                src={ebook.coverImage}
                alt={ebook.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 200px"
                priority={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Shimmer Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>

            {/* Content Container */}
            <div className="p-5 relative flex flex-col h-[11rem]">
              {/* Title with Gradient Text */}
              <h2 className="text-lg font-bold mb-2 bg-gradient-to-r from-yellow-100 to-yellow-200 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-yellow-400 transition-all duration-300 line-clamp-2 leading-tight">
                {ebook.title}
              </h2>

              {/* Author with Enhanced Styling */}
              <p className="text-gray-300 text-sm font-medium mb-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                <svg
                  className="w-3 h-3 mr-1.5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {ebook.author}
              </p>

              {/* Description with Better Typography */}
              <p className="text-gray-200 text-xs line-clamp-2 mb-4 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                {ebook.description}
              </p>

              {/* Enhanced CTA Button */}
              <Link
                href={ebook.link}
                className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 text-sm font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg mt-auto group/btn"
              >
                Read Now
                <svg
                  className="ml-2 w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Enhanced Border Glow Effect */}
            <div className="absolute inset-0 border-2 border-yellow-500/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Subtle Corner Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error loading eBooks:", error);
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-xl">Failed to load eBooks.</p>
        <p className="text-gray-400 mt-2">Please try again later.</p>
      </div>
    );
  }
};

// Server-side data fetching
async function fetchEbooks(): Promise<Ebook[]> {
  "use client";
  try {
    const ebooksCollection = collection(db, "ebooks");
    const ebooksSnapshot = await getDocs(ebooksCollection);
    const ebooksList = ebooksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Ebook[];
    return ebooksList;
  } catch (error) {
    console.error("Error fetching eBooks:", error);
    throw new Error("Failed to fetch eBooks");
  }
}

// Main component remains the same
const EbooksPage: React.FC = async () => {
  return (
    <div className="min-h-screen bg-black-950 mt-10 text-white">
      <div className="container mx-auto px-4 py-15">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-yellow-400 animate-fade-in-up">
          Espero eBook Collection
        </h1>
        <EbooksDataLoader />
      </div>
    </div>
  );
};

export default EbooksPage;

// Dynamic metadata for SEO
export async function generateMetadata() {
  return {
    title: "Obcyfest 4.0 eBook Collection",
    description:
      "Explore the collection of eBooks available at Obcyfest 4.0, featuring exciting content for all attendees.",
  };
}
