"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@lib/firebase";
import Loader from "@components/Loader";
import { query, where } from "firebase/firestore";

import { IoPersonSharp } from "react-icons/io5";
import { FaChartSimple } from "react-icons/fa6";
import { FaChartLine } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

type ScoreDoc = {
  id?: string;
  sem: string;
  email: string;
  name: string;
  score: number;
  displayName?: string;
  profileImage?: string;
};

type UserProfile = {
  displayName: string;
  photoURL: string;
};

export default function ScoreBoard() {
  const [scores, setScores] = useState<ScoreDoc[]>([]);
  const [available, setAvalible] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [semTotals, setSemTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"individual" | "overall">(
    "overall"
  );

  const order = ["S1 A", "S1 B", "S3 A", "S3 B", "S5", "S7"];

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scoreSnap = await getDocs(collection(db, "score"));
        const scoreData = scoreSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as {
            participants: { email: string; name: string; sem?: string }[];
            sem: string;
            score: number;
          }),
        }));

        if (scoreData.length < 1) {
          setAvalible(false);
          setLoading(false);
          return;
        }
        setAvalible(true);

        // Initialize semester totals
        const semTotals: Record<string, number> = {};
        order.forEach((sem) => (semTotals[sem] = 0));

        // Flatten participant scores
        const participantScores: ScoreDoc[] = [];

        for (const scoreEntry of scoreData) {
          const { id, participants, sem, score } = scoreEntry;

          // Update semester total
          semTotals[sem] = (semTotals[sem] || 0) + (score || 0);

          for (const p of participants) {
            participantScores.push({
              id,
              sem: p.sem || sem, // use participant’s sem if available
              email: p.email,
              name: p.name,
              score: score || 0, // fallback 0
            });
          }
        }

        // Combine duplicates: same email => increment by 1 each time
        const uniqueParticipants: Record<string, ScoreDoc> = {};
        for (const p of participantScores) {
          if (!uniqueParticipants[p.email]) {
            uniqueParticipants[p.email] = {
              ...p,
              score: Number(p.score) || 0, // first entry keeps its score
            };
          } else {
            uniqueParticipants[p.email].score += Number(p.score) || 0; // just add the new score
          }
        }

        const finalParticipants = Object.values(uniqueParticipants);

        // Fetch user profiles
        const profileMap: Record<string, UserProfile> = {};
        for (const p of finalParticipants) {
  
          if (!p.email || profileMap[p.email]) continue;
          const q = query(
            collection(db, "users"),
            where("email", "==", p.email)
          );
          const userSnap = await getDocs(q);
          const userDoc = userSnap.docs[0];
          if (userDoc?.exists()) {
            const data = userDoc.data() as UserProfile;
            profileMap[p.email] = {
              displayName: data.displayName,
              photoURL: data.photoURL,
            };
          }
        }

        const participantScoresWithProfile: ScoreDoc[] = finalParticipants.map(
          (p) => ({
            ...p,
            displayName: profileMap[p.email]?.displayName || p.name,
            photoURL: profileMap[p.email]?.photoURL || "",
          })
        );
        const sortedParticipants = participantScoresWithProfile.sort(
          (a, b) => (b.score || 0) - (a.score || 0)
        );

        setScores(sortedParticipants.slice(0, 6));
        setSemTotals(semTotals);
        setProfiles(profileMap);
      } catch (err) {
        console.error("Error fetching scores or profiles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) return <Loader />;

  if (!available) return <div></div>;

  return (
    <div className="0verflow-hidden bg-black py-8 px-4">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Score Board
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 space-x-2 animate-slide-up">
          <button
            onClick={() => setActiveTab("overall")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
    ${
      activeTab === "overall"
        ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-md scale-105"
        : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm hover:shadow-md"
    }`}
          >
            <FaChartSimple className="text-lg" />
            <span>Overall</span>
          </button>
          <button
            onClick={() => setActiveTab("individual")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
    ${
      activeTab === "individual"
        ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-md scale-105"
        : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm hover:shadow-md"
    }`}
          >
            <IoPersonSharp className="text-lg" />
            <span>Individual</span>
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in-up">
          {activeTab === "overall" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {order.map((sem, index) => {
                const totalAllSem = Object.values(semTotals).reduce(
                  (acc, val) => {
                    return acc + (Number(val) || 0);
                  },
                  0
                );

                // Get this semester’s score
                const totalScore = Number(semTotals[sem]) || 0;

                // Calculate percentage relative to total of all semesters
                const percent =
                  totalAllSem > 0 ? (totalScore / totalAllSem) * 100 : 0;

                return (
                  <div
                    key={sem}
                    className="group relative bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/30 hover:border-yellow-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-400/5"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Semester Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-black">
                          {sem.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="text-center py-4">
                      <span className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                        {totalScore}
                      </span>
                      <div className="text-sm text-gray-400 mt-1">Points</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{percent.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-1000 ease-out"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scores.map((score, index) => {
                // Example: scores is an array of objects like { email: string, score: number | string }
                const totalAllScores = scores.reduce(
                  (acc, s) => acc + (Number(s.score) || 0),
                  0
                );

                // For a single score
                const totalScore = Number(score.score) || 0;

                // Calculate percentage relative to total of all scores
                const percent =
                  totalAllScores > 0 ? (totalScore / totalAllScores) * 100 : 0;

                // Profile remains the same
                const profile = profiles[score.email];
              

                return (
                  <div
                    key={`${score.email}-${score.sem}`}
                    className="group relative bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/30 hover:border-yellow-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-400/5"
                  >
                    {/* Profile Section */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        {profile?.photoURL ? (
                          <img
                            src={profile.photoURL}
                            alt={profile.displayName}
                            className="w-12 h-12 rounded-full border-2 border-yellow-400/50"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-gray-800"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {profile?.displayName || score.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                          {score.sem}
                        </p>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="text-center py-4">
                      <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                        {score.score}
                      </span>
                      <div className="text-sm text-gray-400 mt-1">Achieved</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-1000 ease-out"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Statistics */}
          {scores.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
              {[
                {
                  label: "Overall Average",
                  value: (
                    scores.reduce(
                      (acc, score) => acc + parseFloat("" + score.score),
                      0
                    ) / scores.length
                  ).toFixed(1),
                  color: "text-yellow-400",
                  icon: <FaChartLine className="text-yellow-400" />,
                },
                {
                  label: "Highest Score",
                  value: Math.max(
                    ...scores.map((score) => parseFloat("" + score.score))
                  ).toFixed(1),
                  color: "text-green-400",
                  icon: <FaStar className="text-yellow-400" />,
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/30 hover:border-yellow-400/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold ${stat.color} mt-1`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className="text-4xl">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(20px) rotate(-180deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
