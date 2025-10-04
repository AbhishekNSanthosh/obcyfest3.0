'use client';

import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@lib/firebase";
import ScoreBoardSkeleton from "@widgets/LandingPage/components/ScoreBoardSkeleton";
import { IoPersonSharp } from "react-icons/io5";
import { FaChartSimple } from "react-icons/fa6";

type ScoreDoc = {
  sem: string;
  email: string;
  name: string;
  score: number;
  displayName?: string;
  photoURL?: string;
};

type UserProfile = {
  displayName: string;
  photoURL: string;
};

type SemTotals = Record<string, number>;

const ProgressBar: React.FC<{ percent: number; isHighlighted?: boolean }> = ({ percent, isHighlighted }) => (
  <div className="mt-4" aria-label={`Progress: ${percent.toFixed(0)}%`}>
    <div className="flex justify-between text-sm text-gray-400 mb-2">
      <span>Progress</span>
      <span>{percent.toFixed(0)}%</span>
    </div>
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${
          isHighlighted
            ? "bg-gradient-to-r from-yellow-400 to-yellow-600 shadow shadow-yellow-400/50"
            : "bg-gradient-to-r from-yellow-400 to-yellow-600"
        }`}
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  </div>
);

export default function ScoreBoard() {
  const [scores, setScores] = useState<ScoreDoc[]>([]);
  const [available, setAvailable] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [semTotals, setSemTotals] = useState<SemTotals>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"individual" | "overall">("overall");

  const order = ["S1 A", "S1 B", "S3 A", "S3 B", "S5", "S7"];

  // Fetch scores from Firestore
  const fetchScoresData = async () => {
    const scoreSnap = await getDocs(collection(db, "score"));
    return scoreSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as {
        participants: { email: string; name: string; sem?: string }[];
        sem: string;
        score: number;
      }),
    }));
  };

  // Fetch user profiles in batches
  const fetchUserProfiles = async (emails: string[]) => {
    const profileMap: Record<string, UserProfile> = {};
    const uniqueEmails = Array.from(new Set(emails)).filter((email) => email);
    const chunks = [];
    for (let i = 0; i < uniqueEmails.length; i += 10) {
      chunks.push(uniqueEmails.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const q = query(collection(db, "users"), where("email", "in", chunk));
      const userSnap = await getDocs(q);
      userSnap.forEach((doc) => {
        const data = doc.data() as UserProfile;
        profileMap[doc.data().email] = {
          displayName: data.displayName,
          photoURL: data.photoURL,
        };
      });
    }
    return profileMap;
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const scoreData = await fetchScoresData();

        if (scoreData.length < 1) {
          setAvailable(false);
          return;
        }
        setAvailable(true);

        // Initialize semester totals
        const semTotals: SemTotals = {};
        order.forEach((sem) => (semTotals[sem] = 0));

        // Flatten participant scores
        const participantScores: ScoreDoc[] = [];
        for (const scoreEntry of scoreData) {
          const { participants, sem, score } = scoreEntry;
          semTotals[sem] = (semTotals[sem] || 0) + (Number(score) || 0);
          for (const p of participants) {
            participantScores.push({
              sem: p.sem || sem,
              email: p.email,
              name: p.name,
              score: Number(score) || 0,
            });
          }
        }

        // Combine duplicates by email
        const uniqueParticipants: Record<string, ScoreDoc> = {};
        for (const p of participantScores) {
          if (!uniqueParticipants[p.email]) {
            uniqueParticipants[p.email] = { ...p, score: p.score };
          } else {
            uniqueParticipants[p.email].score += p.score;
          }
        }

        // Fetch profiles
        const emails = Object.keys(uniqueParticipants);
        const profileMap = await fetchUserProfiles(emails);

        // Combine profiles with scores
        const finalParticipants = Object.values(uniqueParticipants).map((p) => ({
          ...p,
          displayName: profileMap[p.email]?.displayName || p.name,
          photoURL: profileMap[p.email]?.photoURL || "",
        }));

        // Sort and slice top 6
        const sortedParticipants = finalParticipants
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);

        setScores(sortedParticipants);
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

  // Memoized calculations
  const totalAllSem = useMemo(() => {
    return Object.values(semTotals).reduce((acc, val) => acc + (Number(val) || 0), 0);
  }, [semTotals]);

  const totalAllScores = useMemo(() => {
    return scores.reduce((acc, s) => acc + (Number(s.score) || 0), 0);
  }, [scores]);

  const highestScore = useMemo(() => {
    return Math.max(...scores.map((s) => Number(s.score) || 0), 0);
  }, [scores]);

  if (loading) return <ScoreBoardSkeleton />;

  if (!available) return null;

  return (
    <div className="overflow-hidden bg-black py-8 px-4">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Score Board
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
        </div>

        {/* Tabs */}
        <div
          className="flex justify-center mb-8 space-x-2 animate-slide-up"
          role="tablist"
          aria-label="Scoreboard tabs"
        >
          <button
            onClick={() => setActiveTab("overall")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
              activeTab === "overall"
                ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-md scale-105"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm hover:shadow-md"
            }`}
            role="tab"
            aria-selected={activeTab === "overall"}
            aria-label="View overall semester scores"
          >
            <FaChartSimple className="text-lg" />
            <span>Overall</span>
          </button>
          <button
            onClick={() => setActiveTab("individual")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
              activeTab === "individual"
                ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-md scale-105"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm hover:shadow-md"
            }`}
            role="tab"
            aria-selected={activeTab === "individual"}
            aria-label="View individual participant scores"
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
                const totalScore = Number(semTotals[sem]) || 0;
                const percent = totalAllSem > 0 ? (totalScore / totalAllSem) * 100 : 0;

                return (
                  <div
                    key={sem}
                    className="group relative bg-gray-800/30 backdrop-blur-lg rounded-lg p-6 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-400/10"
                    style={{ animationDelay: `${index * 100}ms` }}
                    aria-label={`Semester ${sem}, Score: ${totalScore}, Progress: ${percent.toFixed(0)}%`}
                  >
                    {/* Semester Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-black">{sem.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="text-center py-4">
                      <span className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                        {totalScore}
                      </span>
                      <div className="text-sm text-gray-400 mt-1">Points</div>
                    </div>

                    <ProgressBar percent={percent} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scores.map((score) => {
                const totalScore = Number(score.score) || 0;
                const percent = totalAllScores > 0 ? (totalScore / totalAllScores) * 100 : 0;
                const isTopScorer = totalScore === highestScore && totalScore > 0;
                const topScorersCount = scores.filter((s) => Number(s.score) || 0 === highestScore).length;
                const isSingleTopScorer = topScorersCount === 1;

                return (
                  <div
                    key={`${score.email}-${score.sem}`}
                    className="group relative bg-gray-800/30 backdrop-blur-lg rounded-lg p-6 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-400/10"
                    aria-label={`Participant ${score.displayName || score.name}, Semester ${score.sem}, Score: ${totalScore}, Progress: ${percent.toFixed(0)}%`}
                  >
                    {/* Top Scorer Badge */}
                    {isTopScorer && (
                      <div
                        className={`absolute -top-3 right-0 z-10 ${
                          isSingleTopScorer ? "animate-bounce" : "animate-pulse"
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">🏆</span>
                          </div>
                          {isSingleTopScorer && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Profile Section */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        {score.photoURL ? (
                          <img
                            src={score.photoURL}
                            alt={score.displayName || score.name}
                            className={`w-12 h-12 rounded-full border-2 ${
                              isTopScorer ? "border-yellow-400 shadow-lg shadow-yellow-400/30" : "border-yellow-400/50"
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isTopScorer
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-400/30"
                                : "bg-gradient-to-br from-yellow-400 to-yellow-600"
                            }`}
                          >
                            <span className="text-lg">👤</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {score.displayName || score.name}
                          {isTopScorer && <span className="ml-2 text-yellow-400 text-sm">⭐</span>}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">{score.sem}</p>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="text-center py-4 relative">
                      {isTopScorer && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                          🏆 Highest Score!
                        </div>
                      )}
                      <span
                        className={`text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent ${
                          isTopScorer ? "drop-shadow-lg" : ""
                        }`}
                      >
                        {score.score}
                      </span>
                      <div className="text-sm text-gray-400 mt-1">Achieved</div>
                    </div>

                    <ProgressBar percent={percent} isHighlighted={isTopScorer} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
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