// components/ShareButton.tsx
"use client";

import { LuShare2 } from "react-icons/lu";

export default function ShareButton({ title }: { title: string }) {
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title,
        text: "Check out this event!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Share this event"
      className="absolute bottom-10 z-90 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-yellow-400/40 text-yellow-400 transition"
    >
      <LuShare2 className="h-5 w-5" />
    </button>
  );
}
