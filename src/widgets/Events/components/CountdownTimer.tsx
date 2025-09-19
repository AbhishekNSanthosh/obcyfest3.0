"use client";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string; // expects "DD-MM-YYYY" format
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const parseDate = (str: string) => {
    const [day, month, year] = str.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
  };

  useEffect(() => {
    if (!targetDate) return;

    const endDate = parseDate(targetDate);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="mb-6 flex flex-col items-center">
      <h3 className="text-xl font-bold text-yellow-400 mb-3">
        Registration closes in
      </h3>
      <div className="flex gap-4 text-center">
        {["days", "hours", "minutes", "seconds"].map((unit) => (
          <div
            key={unit}
            className="bg-black-950 bg-opacity-80 px-4 py-3 rounded-lg border border-yellow-400/30 shadow-md min-w-[70px]"
          >
            <p className="text-2xl font-bold text-yellow-400">
              {timeLeft[unit as keyof typeof timeLeft]}
            </p>
            <p className="text-sm text-gray-400 capitalize">{unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
