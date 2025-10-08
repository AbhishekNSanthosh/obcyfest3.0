"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "@lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import toast from "react-hot-toast";
import {
  doc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  LuSave,
  LuLogOut,
  LuCalendarDays,
  LuCalendarCheck,
  LuUser,
  LuUsers,
} from "react-icons/lu";
import { events, semesters } from "@utils/constants";

type Registration = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string | null;
  isGroup: boolean;
  leaderUid?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<typeof auth.currentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [semester, setSemester] = useState("");
  const [phone, setPhone] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const router = useRouter();

  const isComplete = useMemo(
    () =>
      displayName.trim() !== "" &&
      rollNumber.trim() !== "" &&
      semester.trim() !== "" &&
      phone.trim() !== "",
    [displayName, rollNumber, semester, phone]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileLoaded(true);
        return;
      }
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setDisplayName(data.displayName || user.displayName || "");
          setRollNumber(data.rollNumber || "");
          setSemester(data.semester || "");
          setPhone(data.phone || "");
        } else {
          setDisplayName(user.displayName || "");
        }
      } catch (e) {
        console.error("Failed to load profile", e);
        toast.error("Failed to load profile.");
      } finally {
        setProfileLoaded(true);
      }
    };
    fetchProfile();
  }, [user]);

  // Real-time registrations listener
  useEffect(() => {
    if (!user) return;

    const regQ = query(
      collection(db, "registrations"),
      where("participantMails", "array-contains", user.email)
    );
    const unsubRegs = onSnapshot(
      regQ,
      (snap) => {
        setRegistrations(
          snap.docs.map((d) => ({
            id: d.id,
            eventId: d.data().eventId,
            eventTitle: d.data().eventTitle,
            eventDate: d.data().eventDate,
            isGroup: d.data().isGroup,
            leaderUid: d.data().leaderUid,
          }))
        );
      },
      (error) => {
        console.error("Failed to fetch registrations", error);
        toast.error("Failed to fetch registrations.");
      }
    );

    return () => unsubRegs();
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    if (!isComplete) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!/^\+?\d{10,14}$/.test(phone.trim())) {
      toast.error("Please enter a valid phone number (10-14 digits).");
      return;
    }
    if (displayName.trim().length > 50) {
      toast.error("Full name must be 50 characters or less.");
      return;
    }
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      const dataToSave = {
        uid: user.uid,
        email: user.email || null,
        displayName: displayName.trim(),
        photoURL: user.photoURL || null,
        rollNumber: rollNumber.trim(),
        semester: semester.trim(),
        phone: phone.trim(),
        updatedAt: serverTimestamp(),
      };

      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(ref);
        if (docSnap.exists()) {
          transaction.update(ref, dataToSave);
        } else {
          transaction.set(ref, { ...dataToSave, createdAt: serverTimestamp() });
        }
      });

      toast.success("Profile updated successfully.");
      router.back();
    } catch (e) {
      toast.error("Failed to save profile. Please try again.");
      console.error("Error saving profile:", e);
    } finally {
      setSaving(false);
    }
  }, [user, isComplete, displayName, rollNumber, semester, phone, router]);

  const handleCancelRegistration = useCallback(
    async (registrationId: string) => {
      if (!user) return;

      if (!confirm("Are you sure you want to cancel this registration?")) {
        return;
      }

      try {
        const regRef = doc(db, "registrations", registrationId);
        await runTransaction(db, async (transaction) => {
          const regDoc = await transaction.get(regRef);
          if (!regDoc.exists()) {
            throw new Error("Registration not found.");
          }
          if (regDoc.data().leaderUid !== user.uid) {
            throw new Error("Only the leader can cancel this registration.");
          }
          transaction.delete(regRef);
        });

        toast.success("Registration cancelled successfully.");
      } catch (e: any) {
        console.error("Failed to cancel registration", e);
        toast.error(
          e.message || "Failed to cancel registration. Please try again."
        );
      }
    },
    [user]
  );

  if (loading || !profileLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-6 text-gray-300 text-lg">You are not signed in.</p>
          <Link
            href="/"
            className="bg-yellow-400 rounded-lg px-8 py-3 text-black-950 font-semibold hover:bg-yellow-500 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <br />
        <br />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Details Section */}
          <div className="bg-gray-950/80 p-6 rounded-xl shadow-lg border border-yellow-400/30">
            <div className="flex flex-col items-center sm:items-start gap-6">
              {user.photoURL && (
                <div className="p-1 rounded-full border-2 border-yellow-400">
                  <Image
                    src={user.photoURL}
                    alt="avatar"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
              )}
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold text-yellow-400">
                  {displayName || "User"}
                </h2>
                <p className="text-gray-300 text-md mt-1">{user.email}</p>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                Profile Details
              </h3>
              {!isComplete && (
                <p className="text-sm text-yellow-500 mb-4">
                  Please complete your profile to register for events.
                </p>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-yellow-400/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Roll Number *
                  </label>
                  <input
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-yellow-400/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                    placeholder="Enter your roll number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Semester *
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-yellow-400/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                    required
                  >
                    <option value="" disabled>
                      Select Semester
                    </option>
                    {semesters.map((s) => (
                      <option key={s} value={String(s)}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    inputMode="tel"
                    className="w-full px-4 py-3 bg-gray-800 border border-yellow-400/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                    placeholder="10-14 digit phone number"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <button
                    disabled={saving || !isComplete}
                    onClick={handleSave}
                    className="w-full sm:w-auto bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black-950 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <LuSave size={20} />
                    {saving ? "Saving..." : "Save details"}
                  </button>

                  <button
                    onClick={async () => {
                      await signOut(auth);
                      toast.success("Logout successful");
                      router.replace("/");
                    }}
                    className="w-full sm:w-auto text-red-500 border border-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <LuLogOut size={20} />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Events Section */}
          <div className="bg-gray-950/80 p-6 rounded-xl shadow-lg border border-yellow-400/30">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
              <LuCalendarCheck size={20} /> Registered Events
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              *Only the leader of a group registration can cancel the event.
            </p>
            {registrations.length === 0 ? (
              <p className="text-gray-400 text-lg">
                You have not registered for any events yet.
              </p>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between bg-gray-900 border border-yellow-400/20 rounded-lg p-4 hover:bg-yellow-400/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {reg.isGroup ? (
                        <LuUsers className="text-yellow-400" size={20} />
                      ) : (
                        <LuUser className="text-yellow-400" size={20} />
                      )}
                      <div>
                        <p className="text-gray-200 font-medium text-lg">
                          {reg.eventTitle}
                        </p>
                        {reg.eventDate && (
                          <p className="text-gray-400 text-sm">
                            Date: {reg.eventDate}
                          </p>
                        )}
                      </div>
                    </div>
                    {(() => {
                      const event = events.find((e) => e.id === reg.eventId);
                      if (
                        !event ||
                        !reg.leaderUid ||
                        user.uid !== reg.leaderUid
                      )
                        return null;

                      const now = new Date();
                      const finalDate = new Date(event.regFinalDate);

                      if (event.RegCloseTime) {
                        finalDate.setHours(event.RegCloseTime.hours);
                        finalDate.setMinutes(event.RegCloseTime.minutes);
                      }

                      return now < finalDate ? (
                        <button
                          onClick={() => handleCancelRegistration(reg.id)}
                          className="px-4 py-2 bg-red-600 rounded-lg text-sm text-white font-semibold hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      ) : null;
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
