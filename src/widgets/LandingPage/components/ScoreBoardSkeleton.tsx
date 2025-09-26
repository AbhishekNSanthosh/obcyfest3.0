import React from "react";

export default function ScoreBoardSkeleton() {
  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 w-64 bg-gray-800 rounded-lg mx-auto mb-3 animate-pulse"></div>
          <div className="h-1 w-20 bg-gray-800 rounded-full mx-auto animate-pulse"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex justify-center mb-8 space-x-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-12 w-32 bg-gray-800 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="group relative bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/30 animate-pulse"
            >
              {/* Semester Header Skeleton */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 bg-gray-700 rounded-full"></div>
              </div>

              {/* Score Display Skeleton */}
              <div className="text-center py-4">
                <div className="h-12 w-20 bg-gray-700 rounded-lg mx-auto"></div>
                <div className="h-4 w-16 bg-gray-700 rounded mt-2 mx-auto"></div>
              </div>

              {/* Progress Bar Skeleton */}
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <div className="h-4 w-16 bg-gray-700 rounded"></div>
                  <div className="h-4 w-8 bg-gray-700 rounded"></div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
