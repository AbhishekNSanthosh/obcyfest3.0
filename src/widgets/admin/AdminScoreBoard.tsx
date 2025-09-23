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
    setParticipants(entry.participants.length ? entry.participants : [{ email: "", name: "" }]);
    setEditingId(entry.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredParticipants = participants.filter((p) => p.email && p.name);

      if (editingId) {
        // Update existing entry
        await updateDoc(doc(db, "score", editingId), {
          sem,
          score,
          participants: filteredParticipants,
        });
        alert("Score entry updated!");
      } else {
        // Add new entry
        await addDoc(collection(db, "score"), {
          sem,
          score,
          participants: filteredParticipants,
        });
        alert("Score entry added!");
      }

      // Reset form
      setSem("S1 A");
      setScore(0);
      setParticipants([{ email: "", name: "" }]);
      setEditingId(null);

      fetchEntries();
    } catch (err) {
      console.error("Error saving document:", err);
      alert("Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {editingId ? "Edit Score Entry" : "Add Score Entry"}
      </h1>

      {/* Existing entries */}
      {entries.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Existing Entries</h2>
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="p-2 border rounded flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold">{entry.sem}</span> - Score:{" "}
                  {entry.score} - Participants: {entry.participants.length}
                </div>
                <button
                  onClick={() => handleEdit(entry)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Semester */}
        <div>
          <label className="block text-sm font-medium mb-1">Semester</label>
          <select
            value={sem}
            onChange={(e) => setSem(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {semesterOptions.map((s) => (
              <option className="text-black" key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Score */}
        <div>
          <label className="block text-sm font-medium mb-1">Score</label>
          <input
            type="text"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Participants */}
        <div>
          <label className="block text-sm font-medium mb-2">Participants</label>
          {participants.map((p, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Name"
                value={p.name}
                onChange={(e) =>
                  handleParticipantChange(index, "name", e.target.value)
                }
                className="flex-1 border rounded px-3 py-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={p.email}
                onChange={(e) =>
                  handleParticipantChange(index, "email", e.target.value)
                }
                className="flex-1 border rounded px-3 py-2"
                required
              />
              {participants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParticipant(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addParticipant}
            className="px-3 py-2 bg-blue-500 text-white rounded"
          >
            + Add Participant
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-600 text-white rounded font-semibold"
        >
          {loading ? "Saving..." : editingId ? "Update Entry" : "Save Entry"}
        </button>
      </form>
    </div>
  );
}
