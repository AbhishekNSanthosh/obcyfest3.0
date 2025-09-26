"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@lib/firebase";
import Link from "next/link";
import { LuPlus } from "react-icons/lu";

interface ExtraData {
  inGameName?: string;
  userId?: string;
  name?: string;
  phone?: string;
  [key: string]: any;
}

interface Participant {
  displayName: string;
  name: string;
  phone: string;
  email: string;
  semester?: string;
  extraData?: ExtraData;
}

type UserDoc = {
  email: string;
  phone?: string;
};

interface Registration {
  id: string;
  eventTitle: string;
  eventId: string;
  participants: Participant[];
  email: string;
  transactionId: string;
  semester?: string;
}

const EventRegistrationsPage = ({
  eventId,
  isAdmin = false,
}: {
  eventId: string;
  isAdmin?: boolean;
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<
    Registration[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>(""); // ✅ single select
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 📌 Semester order
  const semesterOrder = ["1 A", "1 B", "3 A", "3 B", "5", "7"];

  const compareSemesters = (a?: string, b?: string) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    const normA = a.trim().toUpperCase();
    const normB = b.trim().toUpperCase();

    const idxA = semesterOrder.indexOf(normA);
    const idxB = semesterOrder.indexOf(normB);

    if (idxA === -1 && idxB === -1) return normA.localeCompare(normB);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  };

  // Highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, idx) =>
          regex.test(part) ? (
            <span key={idx} className="bg-yellow-400 text-black px-1 rounded">
              {part}
            </span>
          ) : (
            <span key={idx}>{part}</span>
          )
        )}
      </>
    );
  };

  // Fetch registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      setIsLoading(true);
      try {
        const registrationsCollection = collection(db, "registrations");
        const registrationsSnapshot = await getDocs(registrationsCollection);
        const registrationsList = registrationsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Registration)
        );

        const eventFiltered = registrationsList.filter(
          (reg) => reg.eventId === eventId
        );

        setRegistrations(eventFiltered);
        setFilteredRegistrations(eventFiltered);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrations();
  }, [eventId]);

  // Normalize phone
  const normalizePhone = (raw: string) => {
    let str = String(raw);
    if (/e\+/i.test(str)) {
      str = Number(str).toFixed(0);
    }
    str = str.replace(/\D/g, "");
    return `+91${str.replace(/^91/, "")}`;
  };

  const getUserPhones = async (
    registrations: Array<{
      participants: Array<{ email?: string }>;
    }>
  ): Promise<Record<string, string>> => {
    const allEmails = Array.from(
      new Set(
        registrations.flatMap(
          (reg) =>
            reg.participants.map((p) => p.email).filter(Boolean) as string[]
        )
      )
    );

    const phoneMap: Record<string, string> = {};

    for (let i = 0; i < allEmails.length; i += 30) {
      const chunk = allEmails.slice(i, i + 30);
      const q = query(collection(db, "users"), where("email", "in", chunk));
      const snap = await getDocs(q);

      snap.forEach((doc) => {
        const data = doc.data() as UserDoc;
        if (data.email) {
          phoneMap[data.email] = data.phone ?? "";
        }
      });
    }

    return phoneMap;
  };

  // Apply search + filters + sort
  useEffect(() => {
    let filtered = [...registrations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          reg.transactionId.toLowerCase().includes(query) ||
          reg.eventTitle.toLowerCase().includes(query) ||
          reg.participants.some(
            (p) =>
              p.displayName?.toLowerCase().includes(query) ||
              p.name?.toLowerCase().includes(query) ||
              p.email?.toLowerCase().includes(query) ||
              p.semester?.toLowerCase().includes(query) ||
              (p.extraData &&
                Object.values(p.extraData).some((val) =>
                  String(val).toLowerCase().includes(query)
                ))
          )
      );
    }

    // 📌 Semester filter
    if (selectedSemester) {
      filtered = filtered.filter(
        (reg) =>
          reg.participants[0]?.semester?.toUpperCase() ===
          selectedSemester.toUpperCase()
      );
    }

    // 📌 Sort by semester
    filtered.sort((a, b) =>
      compareSemesters(a.participants[0]?.semester, b.participants[0]?.semester)
    );

    setFilteredRegistrations(filtered);
  }, [searchQuery, registrations, selectedSemester]);

  // Export CSV
  const exportToCsv = async () => {
    const phoneMap = await getUserPhones(filteredRegistrations);

    const maxParticipants = Math.max(
      ...filteredRegistrations.map((reg) => reg.participants.length),
      0
    );

    const headers = ["Sl. No", "Transaction ID"];
    for (let i = 0; i < maxParticipants; i++) {
      headers.push(
        `Name${i + 1}`,
        `Email${i + 1}`,
        `Semester${i + 1}`,
        `ExtraData${i + 1}`,
        `PhoneNumber${i + 1}`
      );
    }

    const rows = filteredRegistrations.map((reg, index) => {
      const row = [`${index + 1}`, `"${reg.transactionId}"`];
      reg.participants.forEach((p) => {
        const extraString = p.extraData
          ? Object.entries(p.extraData)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" | ")
          : "-";

        const phone = normalizePhone(phoneMap[p.email] || "");

        row.push(
          `${p.displayName || p.name || ""}`,
          `${p.email || ""}`,
          `${p.semester || ""}`,
          `${extraString}`,
          phone
        );
      });
      while (row.length < headers.length) {
        row.push("", "", "", "");
      }
      return row;
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${eventId}-registrations.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br text-gray-100 px-[5vw] mt-[100px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Event Registrations
              <p className="bg-yellow-400 text-black font-medium">
                {registrations[0]?.eventTitle}
              </p>
            </h1>
            <p className="text-gray-400 mt-1">
              {filteredRegistrations.length} registration(s) found
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Add New Participant Button - Only for Admins */}
            {isAdmin && (
              <Link
                href={`./${eventId}/register`}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-400 hover:to-green-500 transition-all flex items-center gap-2"
              >
                <LuPlus className="text-lg" />
                Add New
              </Link>
            )}

            <button
              onClick={exportToCsv}
              disabled={filteredRegistrations.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg shadow-lg hover:from-yellow-400 hover:to-yellow-500 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export to CSV
            </button>
          </div>
        </div>

        {/* Search + Filter Bar */}
        <div className="bg-gray-800/20 rounded-xl p-4 mb-6 shadow-lg flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label
              htmlFor="searchQuery"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Search (Name, Email, Semester, Transaction ID, Event Title, Extra
              Data)
            </label>
            <input
              id="searchQuery"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Semester Dropdown */}
          <div className="flex items-end">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-gray-700 text-gray-200 border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Semesters</option>
              {semesterOrder.map((sem) => (
                <option key={sem} value={sem}>
                  S{sem}
                </option>
              ))}
            </select>
            {selectedSemester && (
              <button
                onClick={() => setSelectedSemester("")}
                className="ml-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 flex-col gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            <p className="text-gray-400">Fetching registrations...</p>
          </div>
        ) : filteredRegistrations.length > 0 ? (
          <div className="bg-gray-800/30 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750 sticky top-0 z-10">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase">
                      #
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase">
                      Participants
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase">
                      Semester
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/10 divide-y divide-gray-700">
                  {filteredRegistrations.map((reg, index) => (
                    <tr
                      key={reg.id}
                      className="hover:bg-gray-750 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-yellow-400">
                        {index + 1}
                      </td>

                      {/* Participants with inline extra data */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          {reg.participants.map((p, idx) => {
                            const extraShort = p.extraData
                              ? Object.entries(p.extraData)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(" | ")
                              : "";
                            return (
                              <div
                                key={idx}
                                className="text-sm font-medium text-white"
                              >
                                {highlightText(
                                  p.displayName || p.name || "",
                                  searchQuery
                                )}
                                {extraShort && (
                                  <span className="text-xs text-yellow-400 ml-1">
                                    ({highlightText(extraShort, searchQuery)})
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-sm font-medium text-yellow-400">
                        S
                        {reg.participants[0]?.semester
                          ? highlightText(
                              reg.participants[0].semester,
                              searchQuery
                            )
                          : "-"}
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-300">
                        <div className="flex flex-col gap-2">
                          {reg.participants.map((p, idx) => (
                            <div key={idx} className="text-sm text-gray-300">
                              {highlightText(p.email, searchQuery)}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-sm font-medium text-yellow-400 flex items-center gap-2">
                        {highlightText(reg.transactionId, searchQuery)}
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(reg.transactionId)
                          }
                          className="text-gray-400 hover:text-yellow-400 transition"
                          title="Copy Transaction ID"
                        >
                          📋
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              No registrations found
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedSemester
                ? `No results match your filters`
                : "There are no registrations for this event yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrationsPage;
