"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@lib/firebase";
import Loader from "@components/Loader";

type ScoreDoc = {
  id: string;
  point: string;
  sem: string;
};

export default function ScoreBoard() {
  const [scores, setScores] = useState<ScoreDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const order = ["S7", "S5", "S3 A", "S3 B", "S1 A", "S1 B"];

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "score"));
        let data: ScoreDoc[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as { point: string; sem: string }),
        }));

        data.sort((a, b) => order.indexOf(a.sem) - order.indexOf(b.sem));
        setScores(data);
      } catch (err) {
        console.error("Error fetching scores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-gradient-to-br bg-black min-h-[80vh] py-8 px-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/60 rounded-full mix-blend-multiply filter blur-xl opacity-10 -z-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-600/60 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 lg:max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">
            🏆 Score Board
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
        </div>

        {/* Score Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scores.map((score, index) => {
            const percent = (parseFloat(score.point) / 10) * 100;

            return (
              <div
                key={score.id}
                className="group relative bg-black backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Animated Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

                {/* Semester Badge */}
                <div className="absolute -top-3 -left-2 z-20">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    {score.sem}
                  </span>
                </div>

                {/* Score Display */}
                <div className="text-center pt-6">
                  <div className="relative inline-block mb-4">
                    <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                      {score.point}
                    </span>
                    {/* Floating Particles */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce"></div>
                    <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-yellow-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce delay-150"></div>
                  </div>

                  {/* Progress Bar */}
                  {/* Progress Bar Container */}
<div className="mt-6 space-y-2">
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-400">Progress</span>
    <span
      className="text-yellow-400 font-semibold transition-all duration-1500 ease-out"
      style={{
        animation: `countUp 2s ease-out ${index * 0.15}s both`,
      }}
    >
      {((parseFloat(score.point) / 10) * 100).toFixed(0)}%
    </span>
  </div>

  {/* Progress Track */}
  <div className="h-3 w-full bg-gray-700 rounded-full relative overflow-hidden">
    {/* Filled Bar */}
    <div
      className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"
      style={{
        ["--final-width" as any]: `${(parseFloat(score.point) / 10) * 100}%`,
        width: `${(parseFloat(score.point) / 10) * 100}%`,
        animation: `springGrow 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${
          index * 0.15
        }s both`,
      }}
    ></div>

    {/* Slider Thumb */}
    {/* <div
      className="absolute top-1/2 w-3 h-5 bg-white rounded-full border-2 border-yellow-400 transform -translate-y-1/2 shadow-xl z-10"
      style={{
        ["--final-position" as any]: `${(parseFloat(score.point) / 10) * 100}%`,
        left: `${(parseFloat(score.point) / 10) * 100}%`,
        animation: `smoothSlide 2s ease-out ${index * 0.15}s both`,
      }}
    >
      <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-20"></div>
    </div> */}
  </div>
</div>


                  {/* Rating Stars */}
                  <div className="flex justify-center mt-4 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const scoreValue = parseFloat(score.point);
                      const starFill =
                        Math.min(
                          Math.max((scoreValue - (star - 1) * 2) / 2, 0),
                          1
                        ) * 100;

                      return (
                        <div key={star} className="relative">
                          <span className="text-xl text-gray-600">★</span>
                          <span
                            className="text-xl absolute inset-0 text-yellow-400 overflow-hidden"
                            style={{ width: `${starFill}%` }}
                          >
                            ★
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Performance Label */}
                  {/* <div className="mt-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        parseFloat(score.point) >= 8.5
                          ? "bg-green-400/20 text-green-400"
                          : parseFloat(score.point) >= 7.5
                          ? "bg-emerald-400/20 text-emerald-400"
                          : parseFloat(score.point) >= 6.5
                          ? "bg-yellow-400/20 text-yellow-400"
                          : parseFloat(score.point) >= 5.5
                          ? "bg-orange-400/20 text-orange-400"
                          : "bg-red-400/20 text-red-400"
                      }`}
                    >
                      {parseFloat(score.point) >= 8.5
                        ? "Excellent"
                        : parseFloat(score.point) >= 7.5
                        ? "Very Good"
                        : parseFloat(score.point) >= 6.5
                        ? "Good"
                        : parseFloat(score.point) >= 5.5
                        ? "Average"
                        : "Needs Improvement"}
                    </span>
                  </div> */}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/0 via-yellow-600/0 to-yellow-400/0 group-hover:via-yellow-600/5 group-hover:to-yellow-400/10 transition-all duration-500"></div>
              </div>
            );
          })}
        </div>

        {/* Overall Stats */}
        {scores.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/20 text-center">
              <p className="text-yellow-400/80 text-sm uppercase tracking-wider">
                Overall Average
              </p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">
                {(
                  scores.reduce(
                    (acc, score) => acc + parseFloat(score.point),
                    0
                  ) / scores.length
                ).toFixed(1)}
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/20 text-center">
              <p className="text-yellow-400/80 text-sm uppercase tracking-wider">
                Highest Score
              </p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {Math.max(
                  ...scores.map((score) => parseFloat(score.point))
                ).toFixed(1)}
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/20 text-center">
              <p className="text-yellow-400/80 text-sm uppercase tracking-wider">
                Total Semesters
              </p>
              <p className="text-3xl font-bold text-blue-400 mt-2">
                {scores.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes springGrow {
          0% {
            width: 0%;
            transform: scaleX(0);
            opacity: 0;
          }
          30% {
            transform: scaleX(1.1);
          }
          50% {
            transform: scaleX(0.95);
          }
          70% {
            transform: scaleX(1.02);
          }
          100% {
            width: var(--final-width);
            transform: scaleX(1);
            opacity: 1;
          }
        }

        @keyframes smoothSlide {
          0% {
            left: 0%;
            opacity: 0;
            transform: translateY(-50%) scale(0);
          }
          40% {
            transform: translateY(-50%) scale(1.2);
          }
          100% {
            left: var(--final-position);
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
        }

        @keyframes countUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
