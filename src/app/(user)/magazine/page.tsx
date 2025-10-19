import React, { Suspense } from "react";
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
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-500/10 ring-1 ring-yellow-400/30 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
          </div>
          <p className="text-yellow-200 text-xl font-semibold">
            No eBooks found
          </p>
          <p className="text-gray-400 mt-2 max-w-md mx-auto">
            Please check back later or refresh the page to try loading again.
          </p>
        </div>
      );
    }

    return (
      <div className="grid m-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-20 scrolldiv">
        {ebooks.map((ebook) => (
          <div
            key={ebook.id}
            className="group relative bg-slate-900/80 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 border border-slate-800/60 w-full mx-auto focus-within:ring-2 focus-within:ring-yellow-500/60"
          >
            <Link
              href={ebook.link}
              aria-label={`Read ${ebook.title} by ${ebook.author}`}
            >
              {/* Image Container with Enhanced Effects */}
              <div className="relative w-full overflow-hidden aspect-[3/4]">
                <Image
                  src={ebook.coverImage}
                  alt={ebook.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>

              {/* Content Container */}
              <div className="p-4 md:p-5 relative flex flex-col gap-2">
                {/* Title with Gradient Text */}
                <h2 className="text-[1.05rem] md:text-lg font-semibold bg-gradient-to-r from-yellow-100 to-yellow-200 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-yellow-400 transition-all duration-300 line-clamp-2 leading-snug">
                  {ebook.title}
                </h2>
                {/* Author with Enhanced Styling */}
                <p className="text-gray-300/90 text-xs md:text-sm font-medium flex items-center">
                  <svg
                    className="w-3.5 h-3.5 mr-1.5 text-yellow-500"
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
                  By, {ebook.author}
                </p>
                {/* Description with Better Typography */}
                <p className="text-gray-300 text-xs md:text-sm line-clamp-2 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                  {ebook.description}
                </p>
              </div>

              {/* Enhanced Border Glow Effect */}
              <div className="absolute inset-0 border-2 border-yellow-500/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Subtle Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error loading eBooks:", error);
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-500/10 ring-1 ring-red-400/30 flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-red-400"></span>
        </div>
        <p className="text-red-400 text-xl font-semibold">
          Failed to load eBooks
        </p>
        <p className="text-gray-400 mt-2 max-w-md mx-auto">
          Please refresh the page or try again later.
        </p>
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
const SkeletonCard = () => (
  <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg border border-slate-800/60 w-full mx-auto animate-pulse">
    <div className="relative w-full overflow-hidden aspect-[3/4]">
      <div className="absolute inset-0 bg-slate-700/40" />
    </div>
    <div className="p-4 md:p-5 flex flex-col gap-2">
      <div className="h-5 w-3/4 bg-slate-700/60 rounded" />
      <div className="h-3 w-1/2 bg-slate-700/50 rounded" />
      <div className="h-3 w-full bg-slate-700/40 rounded" />
      <div className="h-3 w-5/6 bg-slate-700/40 rounded" />
      <div className="h-9 w-28 bg-slate-700/60 rounded-lg mt-2" />
    </div>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 scrolldiv">
    {Array.from({ length: 8 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

const EbooksPage: React.FC = async () => {
  return (
    <div className="min-h-screen bg-black-950 mt-10 text-white">
      <div className="container mx-auto px-4 py-15">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 animate-fade-in-up">
            Espero eBook Collection
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
            Browse curated digital magazines and eBooks from the Obcydians
            community.
          </p>
        </div>
        <Suspense fallback={<SkeletonGrid />}>
          <EbooksDataLoader />
        </Suspense>
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
