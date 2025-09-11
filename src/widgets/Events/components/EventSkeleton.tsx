import React from "react";

const EventSkeleton = () => {
  return (
    <div className="relative w-[300px] h-[200px] rounded-2xl overflow-hidden border border-yellow-400/30 bg-black-950">
      {/* Shimmer animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-black-950 via-gray-800 to-black-950 animate-[shimmer_1.5s_infinite]" />
    </div>
  );
};

export default EventSkeleton;
