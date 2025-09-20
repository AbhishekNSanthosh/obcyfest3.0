'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "@lib/firebase";

interface Participant {
  displayName: string;
  name: string;
  email: string;
  semester?: string;
}

interface Registration {
  id: string;
  eventTitle: string;
  eventId: string;
  participants: Participant[];
  email: string;
  transactionId: string;
  semester?: string;
}

const EventRegistrationsPage = ({ eventId }: { eventId: string }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Normalize semester string for search
  const normalizeSemester = (sem: string) => sem.replace(/\s+/g, "").toLowerCase();

  // Highlight matching text in search
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

  // Fetch registrations from Firestore
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

  // Apply search filter
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
              normalizeSemester(p.semester || "").includes(query)
          )
      );
    }
    setFilteredRegistrations(filtered);
  }, [searchQuery, registrations]);

  // Export CSV
  const exportToCsv = () => {
    const maxParticipants = Math.max(
      ...filteredRegistrations.map((reg) => reg.participants.length),
      0
    );

    const headers = ["Sl. No", "Transaction ID"];
    for (let i = 0; i < maxParticipants; i++) {
      headers.push(`Name${i + 1}`, `Email${i + 1}`, `Semester${i + 1}`);
    }

    const rows = filteredRegistrations.map((reg, index) => {
      const row = ["" + (index + 1), reg.transactionId];
      const formatSemester = (sem: string) => {
        if (!sem) return "-";
        const parts = sem.trim().split(/\s+/);
        return parts.length > 1 ? `${parts[0]}-${parts[1]}` : parts[0];
      };

      reg.participants.forEach((p) => {
        row.push(
          p.displayName || p.name || "",
          p.email || "",
          `${formatSemester(p.semester || "")}`
        );
      });

      while (row.length < headers.length) {
        row.push("", "", "");
      }
      return row;
    });

    let csvContent =
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
    <div className="min-h-screen bg-gradient-to-br  text-gray-100 px-[5vw] mt-[100px]">
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
          <button
            onClick={exportToCsv}
            disabled={filteredRegistrations.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg shadow-lg hover:from-yellow-400 hover:to-yellow-500 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export to CSV
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-800/20 rounded-xl p-4 mb-6 shadow-lg flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-300 mb-1">
              Search (Name, Email, Semester, Transaction ID, Event Title)
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
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="self-end px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Clear
            </button>
          )}
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
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase">#</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase">Participants</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase">Semester</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/10 divide-y divide-gray-700">
                  {filteredRegistrations.map((reg, index) => (
                    <tr key={reg.id} className="hover:bg-gray-750 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-yellow-400">{index + 1}</td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          {reg.participants.map((p, idx) => (
                            <div key={idx} className="text-sm font-medium text-white">
                              {highlightText(p.displayName || p.name || "", searchQuery)}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-yellow-400">
                        {reg.participants[0]?.semester
                          ? highlightText(`S${reg.participants[0].semester}`, searchQuery)
                          : "-"}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-2">
                          {reg.participants.map((p, idx) => (
                            <div key={idx} className="text-sm text-gray-300 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              {highlightText(p.email, searchQuery)}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-yellow-400 flex items-center gap-2">
                        {highlightText(reg.transactionId, searchQuery)}
                        <button
                          onClick={() => navigator.clipboard.writeText(reg.transactionId)}
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No registrations found</h3>
            <p className="text-gray-500">
              {searchQuery ? `No results match your search` : "There are no registrations for this event yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrationsPage;
