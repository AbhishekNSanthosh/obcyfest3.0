'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "@lib/firebase";

interface Registration {
  id: string;
  eventTitle: string;
  eventId: string;
  participants: { displayName: string; name: string; email: string; semester?: string }[];
  email: string;
  semester?: string;
}

const EventRegistrationsPage = ({ eventId }: { eventId: string }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [semesterFilter, setSemesterFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      setIsLoading(true);
      try {
        const registrationsCollection = collection(db, "registrations");
        const registrationsSnapshot = await getDocs(registrationsCollection);
        const registrationsList = registrationsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Registration)
        );

        // ✅ Only show registrations for this event
        const eventFiltered = registrationsList.filter(
          (reg) => reg.eventId === eventId
        );

        setRegistrations(eventFiltered);
        setFilteredRegistrations(eventFiltered);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrations();
  }, [eventId]);

  // Apply semester filter
  useEffect(() => {
    let filtered = registrations;

    if (semesterFilter) {
      filtered = filtered.filter((reg) =>
        reg.participants.some(
          (p) =>
            (p.semester || "").toLowerCase() === semesterFilter.toLowerCase()
        )
      );
    }

    setFilteredRegistrations(filtered);
  }, [semesterFilter, registrations]);

const exportToCsv = () => {
  // Find the maximum number of participants in any registration
  const maxParticipants = Math.max(
    ...filteredRegistrations.map((reg) => reg.participants.length)
  );

  // Build headers dynamically
  const headers = ["Sl. No"];
  for (let i = 0; i < maxParticipants; i++) {
    headers.push(`Name${i + 1}`, `Email${i + 1}`, `Semester${i + 1}`);
  }

  // Build rows
  const rows = filteredRegistrations.map((reg, index) => {
    const row = ["" + (index + 1)]; // Sl. No

  function formatSemester(sem: string) {
  if (!sem) return "-";
  const parts = sem.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]}-${parts[1]}` : parts[0];
}


    // Add participant details in correct order
    console.log(reg.participants);
    reg.participants.forEach((p) => {
      row.push(p.displayName || p.name || "", p.email || "",`${formatSemester(p.semester || "")}`);
    });

    // Pad with blanks if fewer participants than max
    while (row.length < headers.length) {
      row.push("", "", "");
    }

    return row;
  });

  // Convert to CSV
  let csvContent =
    "data:text/csv;charset=utf-8," +
    headers.join(",") +
    "\n" +
    rows.map((e) => e.join(",")).join("\n");

  // Download file
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${eventId}-registrations.csv`);
  document.body.appendChild(link);
  link.click();
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Event Registrations
            </h1>
            <p className="text-yellow-400 font-medium">{registrations[0]?.eventTitle}</p>
            <p className="text-gray-400 mt-1">
              {filteredRegistrations.length} registration(s) found
            </p>
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

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-auto">
              <label htmlFor="semesterFilter" className="block text-sm font-medium text-gray-300 mb-1">
                Filter by Semester
              </label>
              <input
                id="semesterFilter"
                type="text"
                placeholder="e.g. 5, 6, 7..."
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            {semesterFilter && (
              <button
                onClick={() => setSemesterFilter("")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors mt-5 md:mt-6"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : filteredRegistrations.length > 0 ? (
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Participants</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Semester</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredRegistrations.map((reg, index) => (
                    <tr key={reg.id} className="hover:bg-gray-750 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-yellow-400">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          {reg.participants.map((p, idx) => (
                            <div key={idx} className="text-sm font-medium text-white">
                              {p.displayName}{p.name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-yellow-400">
                        S{reg.participants[0]?.semester}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-2">
                          {reg.participants.map((p, idx) => (
                            <div key={idx} className="text-sm text-gray-300">
                              <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <span>{p.email}</span>
                              </div>
                            </div>
                          ))}
                        </div>
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
              {semesterFilter ? 
                `No registrations match semester "${semesterFilter}"` : 
                "There are no registrations for this event yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrationsPage;