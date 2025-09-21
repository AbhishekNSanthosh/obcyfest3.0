import React from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@lib/firebase";

export const dynamic = "force-dynamic"; // always fresh

interface Participant {
  name?: string;
  email?: string;
  semester?: string; // might be "1 A", "1A", "S1A", "5", etc.
  // sometimes semester might be under extraData in some DB shapes
  extraData?: { semester?: string } | any;
}

interface Registration {
  id: string;
  eventId?: string;
  eventTitle?: string;
  participants?: Participant[];
}

// Semesters you want to track (canonical form)
const semesters = ["S1 A", "S1 B", "S3 A", "S3 B", "S5", "S7"];

/** Normalize many possible inputs into canonical "S{num}" or "S{num} {LETTER}".
 * Examples:
 *  "1 A" -> "S1 A"
 *  "1A"  -> "S1 A"
 *  "S1A" -> "S1 A"
 *  "5"   -> "S5"
 *  "s3 b"-> "S3 B"
 */
function normalizeSemester(raw?: string | number | null): string | null {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).trim();

  if (!s) return null;

  // Replace common separators with a space and remove dots
  s = s.replace(/[_\-\.\u2013\u2014]/g, " ").replace(/\s+/g, " ");

  // Try to match patterns like: optional 'S', number, optional letter (A/B etc)
  // Examples matched: "S1 A", "1A", "1 A", "s3b", "5"
  const m = s.match(/^[sS]?\s*(\d{1,2})\s*([A-Za-z])?$/);
  if (!m) return null;

  const num = m[1];
  const letter = m[2] ? m[2].toUpperCase() : null;

  return letter ? `S${num} ${letter}` : `S${num}`;
}

export default async function Page() {
  // Fetch registrations (always fresh because page is force-dynamic)
  const snap = await getDocs(collection(db, "registrations"));
  const registrations = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Registration[];

  // Flatten participants safely
  const allParticipants: Participant[] = registrations.flatMap((r) =>
    Array.isArray(r.participants) ? r.participants : []
  );

  // Initialize counts for the target semesters
  const counts: Record<string, number> = Object.fromEntries(semesters.map((s) => [s, 0]));

  // Keep track of normalized-but-not-target semesters (e.g. S2, S4, S8) and raw unknowns for debugging
  const otherNormalized: Record<string, number> = {};
  const unknownRaw: Record<string, number> = {};

  let total = 0;
  for (const p of allParticipants) {
    total++;
    // read semester from possible locations
    const raw =
      (p as any).semester ??
      (p as any).sem ??
      (p as any).extraData?.semester ??
      (p as any).extra?.semester ??
      null;

    const normalized = normalizeSemester(raw);
    if (normalized && counts[normalized] !== undefined) {
      counts[normalized] += 1;
    } else if (normalized) {
      // Normalized but not in target semesters list (e.g. "S2" or "S4 B")
      otherNormalized[normalized] = (otherNormalized[normalized] || 0) + 1;
    } else {
      // Could not normalize - record the raw string for debugging
      const key = raw === null || raw === undefined ? "null/empty" : String(raw);
      unknownRaw[key] = (unknownRaw[key] || 0) + 1;
    }
  }

  // Prepare ratios
  const ratios: Record<string, string> = {};
  semesters.forEach((sem) => {
    ratios[sem] = total ? ((counts[sem] / total) * 100).toFixed(2) + "%" : "0%";
  });

  return (
    <div className="px-[5vw] pt-[100px]">
      <h1 className="text-2xl font-bold mb-4">Participants by Semester</h1>

      <table className="table-auto border-collapse border border-gray-300 w-full mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Semester</th>
            <th className="border px-4 py-2 text-right">Count</th>
            <th className="border px-4 py-2 text-right">Ratio</th>
          </tr>
        </thead>
        <tbody>
          {semesters.map((sem) => (
            <tr key={sem}>
              <td className="border px-4 py-2">{sem}</td>
              <td className="border px-4 py-2 text-right">{counts[sem]}</td>
              <td className="border px-4 py-2 text-right">{ratios[sem]}</td>
            </tr>
          ))}
          <tr className="font-bold bg-gray-50">
            <td className="border px-4 py-2">Total</td>
            <td className="border px-4 py-2 text-right">{total}</td>
            <td className="border px-4 py-2 text-right">100%</td>
          </tr>
        </tbody>
      </table>

      {/* Show otherNormalized and unknownRaw to help debug any mismatches */}
      {Object.keys(otherNormalized).length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Other normalized semesters (not in your target list)</h2>
          <ul className="list-disc ml-6">
            {Object.entries(otherNormalized).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(unknownRaw).length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Unknown / raw semester values (couldn't normalize)</h2>
          <ul className="list-disc ml-6">
            {Object.entries(unknownRaw).map(([k, v]) => (
              <li key={k}>
                "{k}": {v}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
