"use client";

import { semesters } from "@utils/constants";
import React, { useEffect, useMemo, useState } from "react";
import {
  doc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  runTransaction,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@lib/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuUser, LuPlus, LuLoader } from "react-icons/lu";
import { events } from "@utils/constants";
import toast from "react-hot-toast";
import { AppEvent } from "@lib/types";
import { IoClose } from "react-icons/io5";

import { BsCopy } from "react-icons/bs";
import parseDate from "@utils/parseDate";

type Member = {
  roll?: string | null;
  name?: string | null;
  email?: string | null;
  semester?: string | null;
  phone?: string | null;
  extraData?: Record<string, any>;
};

type Registration = {
  id: string;
  eventId: string;
  eventTitle: string;
  participants: any[];
};

interface RegisterPageClientProps {
  isAdmin?: boolean;
  eventId: string;
  event: (typeof events)[0];
}

const Loader = ({ text }: { text: string }) => (
  <div className="min-h-screen flex items-center justify-center text-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4" />
      <p className="text-gray-300">{text}</p>
    </div>
  </div>
);

export default function AdminRegisterPageClient({
  isAdmin = false,
  eventId,
  event,
}: RegisterPageClientProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGreen, setIsGreen] = useState(false);
  const [isClosed, setIsClosed] = useState<boolean | null>(null);
  const [extraData, setExtraData] = useState<Record<string, string>>({});

  // Admin state management
  const [chosenEvent, setChosenEvent] = useState<AppEvent | undefined>();
  const [participants, setParticipants] = useState<Member[]>([
    { roll: "", name: "", email: "", semester: "", phone: "" },
  ]);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const registrationsCollection = collection(db, "registrations");
        const registrationsSnapshot = await getDocs(registrationsCollection);
        const registrations = registrationsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Registration)
        );

        const registrationsByEvent: Record<string, number> = {};
        events.forEach((event) => (registrationsByEvent[event.id] = 0));

        registrations.forEach((registration) => {
          if (registrationsByEvent[registration.eventId] !== undefined) {
            registrationsByEvent[registration.eventId] += 1;
          }
        });

        const closed =
          event?.regFinalDate &&
          (parseDate(
            event.regFinalDate,
            event.RegCloseTime?.hours,
            event.RegCloseTime?.minutes
          ) < new Date() ||
            (typeof event.maxParticipation !== "undefined" &&
              registrationsByEvent[event.id] >=
                Number(
                  event.maxParticipation
                    .replace(/Teams?/i, "")
                    .replace(/Participants?/i, "")
                    .trim()
                )));

        setIsClosed(!!closed);
        if (closed && !isAdmin) {
          router.replace("/events");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [event, isAdmin, router]);

  useEffect(() => {
    if (
      !isAdmin &&
      parseDate(
        event.regFinalDate,
        event.RegCloseTime?.hours,
        event.RegCloseTime?.minutes
      ) <= new Date()
    ) {
      return router.replace("/events");
    }
  }, [event?.regFinalDate, router, isAdmin]);

  const handleAddParticipant = () => {
    setParticipants([
      ...participants,
      { roll: "", name: "", email: "", semester: "", phone: "" },
    ]);
  };

  useEffect(() => {
    if (isAdmin && Number(event?.memberMinCount)) {
      setParticipants(
        Array.from({ length: Number(event.memberMinCount) }, () => ({
          roll: "",
          name: "",
          email: "",
          semester: "",
          phone: "",
        }))
      );
    }
  }, [event, isAdmin]);

  const handleChange = (
    index: number,
    field: string,
    value: string,
    isExtra = false
  ) => {
    setParticipants((prev) =>
      prev.map((p, i) =>
        i === index
          ? isExtra
            ? { ...p, extraData: { ...p.extraData, [field]: value } }
            : { ...p, [field]: value }
          : p
      )
    );
  };

  // Auth listener - simplified for admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const normalizedEventDate = useMemo(() => {
    if (!event?.date) return null;
    return event.date.split(" to ")[0].trim();
  }, [event]);

  const isGroupEvent = useMemo(() => {
    return event?.eventType.toLowerCase().includes("group");
  }, [event]);

  const getGroupSize = () => {
    const match = event?.eventType.match(/\((\d+)(?:-(\d+))?\)/);
    if (match) {
      const min = parseInt(match[1], 10);
      const max = match[2] ? parseInt(match[2], 10) : min;
      return { min, max };
    }
    return { min: 1, max: 5 };
  };

  const { min: minGroupSize, max: maxGroupSize } = getGroupSize();

  // Admin registration handler
  const handleAdminRegister = async () => {
    if (participants.some((p) => !p.name || !p.email)) {
      toast.error(
        "Please fill in at least name and email for all participants."
      );
      return;
    }

    if (!isAdmin) {
      toast.error("Admin access required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await runTransaction(db, async (transaction) => {
        // Validate participants
        const validatedParticipants = participants.map((p, index) => ({
          uid: `admin-added-${Date.now()}-${index}`,
          email: p.email?.trim() || `admin-participant-${index}@event.com`,
          displayName: p.name?.trim() || `Participant ${index + 1}`,
          semester: p.semester?.trim() || "N/A",
          phone: p.phone?.trim() || "N/A",
          roll: p.roll?.trim() || "N/A",
          extraData: p.extraData || {},
        }));

        // Check for duplicate emails
        const emails = validatedParticipants.map((p) => p.email.toLowerCase());
        const uniqueEmails = new Set(emails);

        if (emails.length !== uniqueEmails.size) {
          throw new Error("Duplicate participant emails found.");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const email of emails) {
          if (!emailRegex.test(email) && !email.includes("admin-participant")) {
            throw new Error(`Invalid email detected: ${email}`);
          }
        }

        // Check for conflicts (only for offline events)
        if (!event?.isOnline && normalizedEventDate) {
          for (const p of validatedParticipants) {
            const regQ = query(
              collection(db, "registrations"),
              where("participantMails", "array-contains", p.email)
            );
            const regSnap = await getDocs(regQ);

            for (const d of regSnap.docs) {
              const regData = d.data();
              if (
                regData.eventDate === normalizedEventDate &&
                regData.eventId
              ) {
                const conflictEvent = events.find(
                  (e) => e.id === regData.eventId
                );
                if (conflictEvent && !conflictEvent.isOnline) {
                  throw new Error(
                    `${p.displayName} (${p.email}) is already registered for "${conflictEvent.title}" on ${normalizedEventDate}.`
                  );
                }
              }
            }
          }
        }

        // Check if already registered for this event
        for (const p of validatedParticipants) {
          const qSameEvent = query(
            collection(db, "registrations"),
            where("eventId", "==", event?.id),
            where("participantMails", "array-contains", p.email)
          );
          const sameEventSnap = await getDocs(qSameEvent);

          if (!sameEventSnap.empty) {
            throw new Error(
              `${p.displayName} is already registered for this event.`
            );
          }
        }

        if (!isGreen) {
          setIsGreen(true);
          throw new Error("Please fill payment details");
        }

        if (!transactionId) {
          throw new Error("Please enter transaction ID");
        }

        // Save registration
        const regRef = doc(collection(db, "registrations"));
        transaction.set(regRef, {
          eventId: event?.id,
          eventTitle: event?.title,
          eventDate: normalizedEventDate || null,
          isGroup: isGroupEvent,
          transactionId,
          amountPaid: event?.registrationFee,
          leaderUid: currentUser?.uid || "admin",
          leaderEmail: currentUser?.email || "admin@system",
          participantMails: validatedParticipants.map((p) => p.email),
          participants: validatedParticipants,
          adminAdded: true,
          addedBy: currentUser?.email || "admin",
          createdAt: serverTimestamp(),
        });
      });

      toast.success("Admin registration successful!");
      router.replace(`/admin/dashboard/events/${eventId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const selectedEvent = events.find((event) => event.id === eventId);
    setChosenEvent(selectedEvent);
  }, [eventId]);

  const handleRemoveParticipant = (index: number) => {
    if (participants.length > (Number(event?.memberMinCount) || 1)) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  if (loading && isClosed === null) {
    return <Loader text="Loading registration details..." />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-300">
            Admin privileges required for this page.
          </p>
          <Link
            href="/events"
            className="text-yellow-400 hover:underline mt-4 inline-block"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 sm:py-24 text-white">
      {/* Header */}
      <div className="px-6 sm:px-6 lg:px-8 py-6 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
            Admin: Register Participants for{" "}
            <span className="bg-yellow-400 text-black">{event?.title}</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg">
            {event?.eventType} • Registration Fee: {event?.registrationFee}
          </p>
          <p className="text-green-400 text-sm mt-1">
            Admin Mode - Manual participant registration
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Participants Section */}
          <div>
            {participants.map((participant, index) => (
              <div
                key={index}
                className="relative grid grid-cols-1 p-9 sm:grid-cols-2 gap-4 mb-6 border border-gray-700 rounded-lg bg-black"
              >
                {/* Participant Title */}
                <h3 className="absolute -top-3 left-3 bg-black px-2 text-yellow-400 text-sm font-semibold rounded">
                  Participant {index + 1}
                </h3>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={participant.name || ""}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                {/* Roll No */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Roll No.
                  </label>
                  <input
                    type="text"
                    value={participant.roll || ""}
                    onChange={(e) =>
                      handleChange(index, "roll", e.target.value)
                    }
                    placeholder="Roll Number"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={participant.email || ""}
                    onChange={(e) =>
                      handleChange(index, "email", e.target.value)
                    }
                    placeholder="participant@example.com"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={participant.semester || ""}
                    onChange={(e) =>
                      handleChange(index, "semester", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    {semesters.map((s) => (
                      <option key={s} value={String(s)}>
                        S{s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mobile No.
                  </label>
                  <input
                    type="tel"
                    value={participant.phone || ""}
                    onChange={(e) =>
                      handleChange(index, "phone", e.target.value)
                    }
                    placeholder="7907247909"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                {/* Extra Fields */}
                {event.requiresExtraData &&
                  Array.isArray(event.extraFields) && (
                    <div className="col-span-1 sm:col-span-2 mt-4 bg-black/60 p-4 rounded-lg border border-gray-800">
                      <h4 className="text-md font-semibold text-yellow-400 mb-3">
                        Additional Info
                      </h4>
                      <div className="space-y-3">
                        {event.extraFields.map(
                          (field: { name: string; type: string }) => (
                            <div key={field.name}>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                {field.name}
                              </label>
                              <input
                                type={field.type}
                                value={
                                  participant.extraData?.[field.name] || ""
                                }
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  handleChange(
                                    index,
                                    field.name,
                                    e.target.value,
                                    true
                                  )
                                }
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Remove button */}
                {participants.length > (Number(event?.memberMinCount) || 1) && (
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(index)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                  >
                    <IoClose />
                  </button>
                )}
              </div>
            ))}

            {/* Add Participant Button */}
            {participants.length < (Number(event?.memberMaxCount) || 10) && (
              <div className="flex justify-start mt-4">
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600"
                >
                  <LuPlus />
                  Add Participant
                </button>
              </div>
            )}
          </div>

          {/* Payment Section */}
          {isGreen && (
            <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl border border-gray-800">
              <h2 className="text-lg font-semibold text-yellow-400 mb-6 flex items-center gap-2">
                Payment Details
              </h2>
              <p className="text-sm text-gray-300 mb-4">
                Payment information for record keeping.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registration Fee */}
                <div className="flex flex-col gap-2 p-4 rounded-md bg-gray-900/40 border border-gray-800">
                  <label className="text-xs text-gray-300">
                    Registration Fee
                  </label>
                  <span className="text-sm font-medium text-white">
                    {event?.registrationFee}
                  </span>
                </div>

                {/* Transaction ID Input */}
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs text-gray-300">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter transaction ID or 'CASH' for cash payments"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleAdminRegister}
              className="w-full sm:w-auto bg-yellow-400 text-black-950 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-yellow-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <LuLoader className="animate-spin" />}
              {isSubmitting
                ? "Registering..."
                : !isGreen
                ? "Check Details"
                : "Register Participants"}
            </button>
            <Link
              href={isAdmin ? "/admin/events" : `/events/${eventId}`}
              className="w-full sm:w-auto border border-yellow-400 text-yellow-400 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-yellow-400 hover:text-black-950 text-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
