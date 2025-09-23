"use client";

import React, { useEffect, useState } from "react";
import { db } from "@lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { FaChartLine, FaStar, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

type Participant = { email: string; name: string };

type ScoreEntry = {
  id: string;
  sem: string;
  score: number | string;
  participants: Participant[];
};

export default function AdminScoreBoard() {
  const [sem, setSem] = useState("S1 A");
  const [score, setScore] = useState<string | number>(0);
  const [participants, setParticipants] = useState<Participant[]>([
    { email: "", name: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const semesterOptions = ["S1 A", "S1 B", "S3 A", "S3 B", "S5", "S7"];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const snapshot = await getDocs(collection(db, "score"));
    const data: ScoreEntry[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ScoreEntry, "id">),
    }));
    setEntries(data);
  };

  const handleParticipantChange = (
    index: number,
    field: "email" | "name",
    value: string
  ) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const addParticipant = () => {
    setParticipants([...participants, { email: "", name: "" }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleEdit = (entry: ScoreEntry) => {
    setSem(entry.sem);
    setScore(entry.score);
    setParticipants(
      entry.participants.length ? entry.participants : [{ email: "", name: "" }]
    );
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredParticipants = participants.filter((p) => p.email && p.name);

      if (editingId) {
        await updateDoc(doc(db, "score", editingId), {
          sem,
          score,
          participants: filteredParticipants,
        });
        toast.success("Score entry updated!");
      } else {
        await addDoc(collection(db, "score"), {
          sem,
          score,
          participants: filteredParticipants,
        });
        toast.success("Score entry added!");
      }

      setSem("S1 A");
      setScore(0);
      setParticipants([{ email: "", name: "" }]);
      setEditingId(null);

      fetchEntries();
    } catch (err) {
      console.error("Error saving document:", err);
      toast.error("Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalEntries = entries.length;
  const averageScore = totalEntries > 0 
    ? (entries.reduce((acc, entry) => acc + parseFloat("" + entry.score), 0) / totalEntries).toFixed(1)
    : "0";
  const highestScore = totalEntries > 0 
    ? Math.max(...entries.map(entry => parseFloat("" + entry.score))).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
            {editingId ? "Edit Score Entry" : "Admin Score Board"}
          </h1>
          <p className="text-gray-400">Manage score entries and participants</p>
        </div>

        {/* Statistics */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
            {[
              {
                label: "Total Entries",
                value: totalEntries,
                color: "text-blue-400",
                icon: <FaChartLine className="text-blue-400" />,
              },
              {
                label: "Average Score",
                value: averageScore,
                color: "text-yellow-400",
                icon: <FaChartLine className="text-yellow-400" />,
              },
              {
                label: "Highest Score",
                value: highestScore,
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
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Existing Entries */}
          {entries.length > 0 && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-semibold mb-6 text-yellow-400">Existing Entries</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="group relative bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/30 hover:border-yellow-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-400/5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-bold text-yellow-400 text-lg">{entry.sem}</span>
                        <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                          {entry.score}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">
                          {entry.participants.length} participant{entry.participants.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Participants List */}
                    {entry.participants.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-600/30">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Participants</div>
                        <div className="space-y-1">
                          {entry.participants.slice(0, 3).map((participant, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="truncate">{participant.name}</span>
                              <span className="text-gray-400 text-xs truncate ml-2">{participant.email}</span>
                            </div>
                          ))}
                          {entry.participants.length > 3 && (
                            <div className="text-yellow-400 text-xs">
                              +{entry.participants.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleEdit(entry)}
                      className="mt-4 w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-yellow-400/30"
                    >
                      <FaEdit />
                      Edit Entry
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Edit Form */}
          <div className="animate-fade-in-up">
            <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-600/30">
              <h2 className="text-2xl font-semibold mb-6 text-yellow-400">
                {editingId ? "Edit Entry" : "Add New Entry"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Semester</label>
                  <select
                    value={sem}
                    onChange={(e) => setSem(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  >
                    {semesterOptions.map((s) => (
                      <option className="bg-gray-900/50 text-white" key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Score */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Score</label>
                  <input
                    type="number"
                    min={0}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                    required
                  />
                </div>

                {/* Participants */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">Participants</label>
                    <span className="text-xs text-gray-400">{participants.length} added</span>
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {participants.map((p, index) => (
                      <div
                        key={index}
                        className="flex gap-2 items-start bg-gray-700/30 rounded-xl p-3 border border-gray-600/30"
                      >
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Name"
                            value={p.name}
                            onChange={(e) =>
                              handleParticipantChange(index, "name", e.target.value)
                            }
                            className="w-full bg-gray-600/30 border border-gray-500/30 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/50"
                            required
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={p.email}
                            onChange={(e) =>
                              handleParticipantChange(index, "email", e.target.value)
                            }
                            className="w-full bg-gray-600/30 border border-gray-500/30 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/50"
                            required
                          />
                        </div>
                        {participants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeParticipant(index)}
                            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 border border-red-400/30"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addParticipant}
                    className="mt-3 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-blue-400/30"
                  >
                    + Add Participant
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : editingId ? "Update Entry" : "Save Entry"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setSem("S1 A");
                      setScore(0);
                      setParticipants([{ email: "", name: "" }]);
                    }}
                    className="w-full py-2 bg-gray-600/30 hover:bg-gray-600/50 text-gray-400 rounded-xl font-medium transition-all duration-300 border border-gray-500/30"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
          </div>
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