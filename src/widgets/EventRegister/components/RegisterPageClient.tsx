// File: app/events/[eventId]/register/RegisterPageClient.tsx
"use client";
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
import Image from "next/image";
import { BsCopy } from "react-icons/bs";

type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  semester?: string | null;
  rollNumber: string | null;
  phone: string | null;
  extraData?: Record<string, string>;
};

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

export default function RegisterPageClient({
  eventId,
  event,
}: RegisterPageClientProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isClosed, setIsClosed] = useState<boolean | null>(null);
  const [inviteErrors, setInviteErrors] = useState<string>("");
  const [invited, setInvited] = useState<
    Array<{
      id: string;
      inviterUid?: string;
      inviterEmail?: string;
      inviteeUid?: string;
      inviteeEmail: string;
      status?: string;
      extraData?: Record<string, any> | null;
    }>
  >([]);
  const [isInviting, setIsInviting] = useState(false);
  const [cancellingInvite, setCancellingInvite] = useState<string | null>(null);
  const [extraData, setExtraData] = useState<Record<string, string>>({});

  //New changes by Abhishek..
  const [chosenEvent, setChosenEvent] = useState<AppEvent | undefined>();
  const [members, setMembers] = useState<Member[]>([
    { roll: "", name: "", email: "", semester: "", phone: "" },
  ]);
  const [participants, setParticipants] = useState<Member[]>([]);
  const [transactionId, setTransactionId] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const parseDate = (str: string) => {
    const [day, month, year] = str.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
  };

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
        (parseDate(event.regFinalDate) < new Date() ||
          (typeof event.maxParticipation !== "undefined" &&
            registrationsByEvent[event.id] >=
              Number(
                event.maxParticipation
                  .replace(/Teams?/i, "")
                  .replace(/Participants?/i, "")
                  .trim()
              )));

     setIsClosed(!!closed);
      if (closed) {
        router.replace("/events");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };
  fetchData();
}, []);


  useEffect(() => {
    if (parseDate(event.regFinalDate) <= new Date()) {
     return router.replace("/events");
    }
  }, [event?.regFinalDate, router]);

  useEffect(() => {
    if (profile) {
      setParticipants([
        {
          roll: profile.rollNumber ?? "",
          name: profile.displayName ?? "",
          email: profile.email ?? "",
          semester: profile.semester ?? "",
          phone: profile.phone ?? "",
        },
        ...members,
      ]);
    }
  }, [profile, members]);

  const handleAddMember = () => {
    setMembers([
      ...members,
      { roll: "", name: "", email: "", semester: "", phone: "" },
    ]);
  };

  useEffect(() => {
    if (Number(event?.memberMinCount) - 2) {
      setMembers(
        Array.from({ length: Number(event.memberMinCount) - 1 }, () => ({
          roll: "",
          name: "",
          email: "",
          semester: "",
          phone: "",
        }))
      );
    }
  }, [event]);

  const handleChange = (
    index: number,
    field: string,
    value: string,
    isExtra = false,
    isLeader = false
  ) => {
    if (isLeader) {
      setProfile((prev) => {
        if (!prev) return prev; // do nothing if null

        return {
          ...prev,
          extraData: {
            ...(prev.extraData ?? {}),
            [field]: value,
          },
        };
      });
    } else {
      setMembers((prev) =>
        prev.map((m, i) =>
          i === index
            ? isExtra
              ? { ...m, extraData: { ...m.extraData, [field]: value } }
              : { ...m, [field]: value }
            : m
        )
      );
    }
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            semester: data.semester,
            phone: data.phone,
            rollNumber: data.rollNumber,
          });
        } else {
          setProfile({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            semester: undefined,
            phone: null,
            rollNumber: null,
          });
        }
      } else {
        setProfile(null);
      }
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
    return { min: 2, max: 5 };
  };

  const { min: minGroupSize, max: maxGroupSize } = getGroupSize();


  // Group registration
  const handleRegisterGroup = async () => {
    if (
      members.some(
        (m) => !m.roll || !m.name || !m.email || !m.semester || !m.phone
      )
    ) {
      toast.error("Please fill in all the team member details.");
      return;
    }
    if (!transactionId) {
      toast.error("Kindly make the payment and fill the transaction");
      return;
    }
    if (!currentUser || !profile) return;

    setIsSubmitting(true);
    try {
      await runTransaction(db, async (transaction) => {
        const participants: any[] = [
          {
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName,
            semester: profile.semester,
            phone: profile.phone,
            roll: profile.rollNumber,
            extraData: extraData || {}, // ✅ leader’s extra fields
          },
          ...members.map((m) => ({
            roll: m.roll,
            name: m.name,
            email: m.email,
            semester: m.semester,
            phone: m.phone,
            extraData: m.extraData || {}, // ✅ member’s extra fields
          })),
        ];

        // ✅ Check conflicts
        if (!event?.isOnline && normalizedEventDate) {
          for (const p of participants) {
            const regQ = query(
              collection(db, "registrations"),
              where("participantMails", "array-contains", p.email)
            );
            const regSnap = await getDocs(regQ);

            // Find any conflicting registration
            const conflictDoc = regSnap.docs.find(
              (d) => d.data().eventDate === normalizedEventDate
            );

            if (conflictDoc) {
              const conflictData = conflictDoc.data();
              const conflictEventTitle =
                conflictData.eventTitle || "another event";

              throw new Error(
                `${
                  p.displayName || p.email
                } is already registered for "${conflictEventTitle}" on the ${normalizedEventDate}.`
              );
            } else {
              console.log("No date conflicts for", p.email);
            }
          }
        }

        const qSameEvent = query(
          collection(db, "registrations"),
          where("eventId", "==", event?.id),
          where("participantMails", "array-contains", profile.email)
        );
        const sameEventSnap = await getDocs(qSameEvent);

        if (!sameEventSnap.empty) {
          throw new Error("Oops! You're already registered for this event.");
        }

        // ✅ Save registration
        const regRef = doc(collection(db, "registrations"));
        transaction.set(regRef, {
          eventId: event?.id,
          eventTitle: event?.title,
          eventDate: normalizedEventDate || null,
          isGroup: true,
          transactionId,
          amountPaid: event?.registrationFee,
          leaderUid: profile.uid,
          participantMails: participants.map((p) => p.email),
          participants,
          createdAt: serverTimestamp(),
        });
      });

      toast.success("Group registration successful!");
      router.replace(`/events/`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Individual registration
  const handleRegisterIndividual = async () => {
    if (!transactionId) {
      toast.error("Kindly make the payment and fill the transaction");
      return;
    }
    if (!currentUser || !profile) return;

    setIsSubmitting(true);
    try {
      if (normalizedEventDate) {
        const regQ = query(
          collection(db, "registrations"),
          where("participantMails", "array-contains", profile.email)
        );
        const regSnap = await getDocs(regQ);
        if (
          !event?.isOnline &&
          regSnap.docs.some((d) => d.data().eventDate === normalizedEventDate)
        ) {
          toast.error(
            "You have already registered for another event on the same day."
          );

          setIsSubmitting(false);
          return;
        }
      }

      const qSameEvent = query(
        collection(db, "registrations"),
        where("eventId", "==", event?.id),
        where("participantMails", "array-contains", profile.email)
      );
      const sameEventSnap = await getDocs(qSameEvent);

      if (!sameEventSnap.empty) {
        throw new Error("Oops! You're already registered for this event.");
      }

      await addDoc(collection(db, "registrations"), {
        eventId: event?.id,
        eventTitle: event?.title,
        eventDate: normalizedEventDate || null,
        isGroup: false,
        leaderUid: profile.uid,
        participantMails: [profile.email],
        transactionId,
        amountPaid: event?.registrationFee,
        participants: [
          {
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName,
            semester: profile.semester || null,
            ...extraData,
          },
        ],
        createdAt: serverTimestamp(),
      });
      await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: profile.email,
          inviterName: "ObcyFest Team",
          inviteType: "individual",
          eventTitle: event?.title,
          inviteLink:
            `${process.env.NEXT_PUBLIC_BASE_URL}/profile` ||
            `${window.location.origin}/profile`,
        }),
      });
      toast.success("Registration successful!");
      router.push(`/events`);
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    const selectedEvent = events.find((event) => event.id === eventId);
    setChosenEvent(selectedEvent);
  }, [eventId, events]);

  const handleRemoveMember = (index: number) => {
    if (members.length > (Number(event?.memberMaxCount) - 2 || 1)) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  if (loading && isClosed === null || isClosed === true) {
    return <Loader text="Loading registration details..." />;
  }

  // {isGroupEvent && (
  //               <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl border border-gray-800">
  //                 <div className="flex items-center justify-between mb-6">
  //                   <h2 className="text-base sm:text-lg md:text-xl font-semibold text-yellow-400 flex items-center gap-2">
  //                     <LuUsers className="text-lg" />
  //                     Invite Members by Email (
  //                     {1 +
  //                       invited.filter((i) => i.status === "accepted").length}
  //                     /{maxGroupSize})
  //                   </h2>
  //                 </div>
  //                 <p className="text-gray-400 text-sm mb-6">
  //                   Invite {minGroupSize - 1} to {maxGroupSize - 1} members.
  //                   Invites require same semester and no same-day conflict.
  //                 </p>

  //                 <div className="flex flex-col sm:flex-row gap-3">
  //                   <input
  //                     type="email"
  //                     value={inviteEmail}
  //                     onChange={(e) => setInviteEmail(e.target.value)}
  //                     placeholder="member@example.com"
  //                     className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
  //                     disabled={isInviting}
  //                   />
  //                   <button
  //                     type="button"
  //                     onClick={handleInvite}
  //                     className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-black-950 rounded-lg font-semibold hover:bg-yellow-500 disabled:opacity-50"
  //                     disabled={isInviting}
  //                   >
  //                     {isInviting ? (
  //                       <LuLoader className="animate-spin" />
  //                     ) : (
  //                       <LuPlus />
  //                     )}
  //                     {isInviting ? "Sending..." : "Send Invite"}
  //                   </button>
  //                 </div>
  //                 {inviteErrors && (
  //                   <p className="text-red-400 text-sm mt-2">{inviteErrors}</p>
  //                 )}

  //                 {invited.length > 0 && (
  //                   <div className="mt-6 space-y-2">
  //                     {invited.map((m) => (
  //                       <div
  //                         key={m.id}
  //                         className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 w-full"
  //                       >
  //                         {/* Email and Status */}
  //                         <div className="flex items-center max-w-full bg-gray-900 rounded-lg px-3 py-2">
  //                           <span
  //                             className="text-gray-200 truncate max-w-[80%]" // only email is truncated
  //                             title={m.inviteeEmail || "Unknown Email"}
  //                           >
  //                             {m.inviteeEmail || "Unknown Email"}
  //                           </span>
  //                           <span className="text-gray-400 ml-1">
  //                             {m.status && `(${m.status})`}
  //                           </span>
  //                         </div>

  //                         {/* Buttons */}
  //                         <div className="flex flex-wrap sm:flex-nowrap gap-2 items-start sm:items-center mt-2 sm:mt-0">
  //                           {profile?.uid === currentUser?.uid && (
  //                             <button
  //                               onClick={() => handleCancelInvite(m.id)}
  //                               className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
  //                               disabled={cancellingInvite === m.id}
  //                             >
  //                               {cancellingInvite === m.id
  //                                 ? "Removing..."
  //                                 : "Remove"}
  //                             </button>
  //                           )}
  //                         </div>
  //                       </div>
  //                     ))}
  //                   </div>
  //                 )}
  //                 <p className="text-gray-400 text-xs mt-4">
  //                   Note: Members will need to accept the invite separately.
  //                 </p>
  //               </div>
  //             )}

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // After login, send to profile to ensure completion
      router.push("/profile");
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen py-16 sm:py-24 text-white">
      {!currentUser ? (
        <div className="min-h-[80vh] flex items-center justify-center bg-black-950 text-white px-6">
          <div className="max-w-md w-full bg-black/70 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            {/* Heading */}
            <h1 className="text-2xl font-bold text-yellow-400 mb-3">
              Sign In Required
            </h1>
            <p className="text-gray-400 text-base mb-6">
              Please sign in to register for events and access your profile.
            </p>

            {/* Link to profile */}

            {/* Google sign-in button */}
            <button
              onClick={() => {
                handleGoogleLogin();
                handleLinkClick();
              }}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-yellow-400 text-black-950 font-semibold text-lg shadow-md hover:bg-yellow-500 active:scale-95 transition"
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.6-6.1 8-11.3 8a12 12 0 010-24c3 0 5.6 1.1 7.7 2.9l5.7-5.7C34.4 6.6 29.5 4 24 4a20 20 0 100 40c11 0 20-9 20-20 0-1.3-.1-2.6-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.6 15.6 19 13 24 13c3 0 5.6 1.1 7.7 2.9l5.7-5.7C34.4 6.6 29.5 4 24 4c-7.3 0-13.7 3.9-17.2 9.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.5 0 10.4-2.2 14-5.8l-6.4-5.5c-2 1.4-4.6 2.3-7.6 2.3-5.1 0-9.5-3.3-11.2-7.9l-6.5 5C10.3 40.2 16.7 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-.8 2.1-2.3 4-4.3 5.2l.1.1 6.4 5.5c-.4.4.1-.1.9-1 2.5-2.6 5.1-6.8 5.1-13.3 0-1.3-.1-2.6-.4-3.5z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      ) : !profile?.semester ? (
        <div className="min-h-screen flex items-center justify-center bg-black-950 text-white">
          <div className="text-center px-4">
            <p className="text-gray-300 text-lg">
              Please complete your profile to register for events.
            </p>
            <Link
              href="/profile"
              className="text-yellow-400 hover:underline mt-2 inline-block"
            >
              Go to Profile
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="px-6 sm:px-6 lg:px-8 py-6 border-b border-gray-800">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                Register for{" "}
                <span className="bg-yellow-400 text-black">{event?.title}</span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg">
                {event?.eventType} • Registration Fee: {event?.registrationFee}
              </p>
              {event.isOnline && (
                <p className="text-green-400 text-sm mt-1">
                  This event does not have any schedule conflicts.
                </p>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* User details */}
              <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl border border-gray-800 relative">
                {isGroupEvent && (
                  <h3 className="absolute -top-3 left-3 bg-black px-2 text-yellow-400 text-sm font-semibold rounded">
                    Member 1
                  </h3>
                )}
                <h2 className="text-lg font-semibold text-yellow-400 mb-6 flex items-center gap-2">
                  <LuUser className="text-lg" />
                  Your Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      value={profile?.displayName || ""}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Semester
                    </label>
                    <input
                      value={profile?.semester || ""}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div className="">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      value={profile?.email || ""}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Roll No:
                    </label>
                    <input
                      value={profile?.rollNumber || ""}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mobile no:
                    </label>
                    <input
                      value={profile?.phone || ""}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                {/* Extra fields */}
                {event.requiresExtraData &&
                  Array.isArray(event.extraFields) && (
                    <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl border mt-10 border-gray-800">
                      <h2 className="text-lg font-semibold text-yellow-400 mb-6">
                        Additional Info
                      </h2>
                      <div className="space-y-4">
                        {event.extraFields.map(
                          (field: { name: string; type: string }) => (
                            <div key={field.name}>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                {field.name}
                              </label>
                              <input
                                type={field.type}
                                value={extraData[field.name] || ""}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  setExtraData(
                                    (prev: Record<string, string>) => ({
                                      ...prev,
                                      [field.name]: e.target.value,
                                    })
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
              </div>

              {/* Group Invite */}

              {isGroupEvent && (
                <div>
                  {members.map((member, index) => (
                    <div
                      key={index}
                      className="relative grid grid-cols-1 p-9 sm:grid-cols-2 gap-4 mb-4 border border-gray-700 rounded-lg bg-black"
                    >
                      {/* Member Title */}
                      <h3 className="absolute -top-3 left-3 bg-black px-2 text-yellow-400 text-sm font-semibold rounded">
                        Member {index + 2}
                      </h3>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={member.name || ""}
                          onChange={(e) =>
                            handleChange(index, "name", e.target.value)
                          }
                          placeholder="Full Name"
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          disabled={isInviting}
                        />
                      </div>

                      {/* Roll No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Roll No.
                        </label>
                        <input
                          type="number"
                          value={member.roll || ""}
                          onChange={(e) =>
                            handleChange(index, "roll", e.target.value)
                          }
                          placeholder="Roll Number"
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          disabled={isInviting}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={member.email || ""}
                          onChange={(e) =>
                            handleChange(index, "email", e.target.value)
                          }
                          placeholder="member@example.com"
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          disabled={isInviting}
                        />
                      </div>

                      {/* Semester */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Semester
                        </label>
                        <select
                          value={member?.semester || ""}
                          onChange={(e) =>
                            handleChange(index, "semester", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          <option value="">select</option>
                          {profile?.semester && (
                            <option value={profile.semester}>
                              {profile.semester}
                            </option>
                          )}
                        </select>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Teammates must be from the same semester.
                        </p>
                      </div>

                      {/* Mobile */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Mobile No.
                        </label>
                        <input
                          type="tel"
                          value={member.phone || ""}
                          onChange={(e) =>
                            handleChange(index, "phone", e.target.value)
                          }
                          placeholder="7907247909"
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          disabled={isInviting}
                        />
                      </div>

                      {/* 🔥 Extra Fields - now tied to each member */}
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
                                        member.extraData?.[field.name] || ""
                                      }
                                      onChange={
                                        (
                                          e: React.ChangeEvent<HTMLInputElement>
                                        ) =>
                                          handleChange(
                                            index,
                                            field.name,
                                            e.target.value,
                                            true
                                          ) // mark as extra field
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
                      {Number(event?.memberMinCount) <
                        Number(event?.memberMaxCount) &&
                        index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(index)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                            disabled={isInviting}
                          >
                            <IoClose />
                          </button>
                        )}
                    </div>
                  ))}

                  {/* Add Member Button */}
                  {members.length <
                    (Number(event?.memberMaxCount) - 1 || members.length) && (
                    <div className="flex justify-start mt-4">
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50"
                        disabled={isInviting}
                      >
                        <LuPlus />
                        Add Member
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl border border-gray-800">
                <h2 className="text-lg font-semibold text-yellow-400 mb-6 flex items-center gap-2">
                  Payment
                </h2>
                <p className="text-sm text-gray-300 mb-4">
                  Please make the payment using the details provided below.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="flex flex-col gap-2 p-4 rounded-md bg-gray-900/40 border border-gray-800">
                    <label className="text-xs text-gray-300 flex items-center justify-between">
                      Phone
                      <button
                        className="text-yellow-400 flex items-center gap-2 text-xs hover:underline"
                        onClick={() => {
                          if (event?.gpay) {
                            navigator.clipboard.writeText(event.gpay);
                            // alert("Phone number copied to clipboard!");
                            toast.success("Phone number copied to clipboard!")
                          }
                        }}
                      >
                        <BsCopy />
                        Copy
                      </button>
                    </label>
                    <span className="text-sm font-medium text-white">
                      {event?.gpay}
                    </span>
                  </div>

                  {/* UPI */}
                  <div className="flex flex-col gap-2 p-4 rounded-md bg-gray-900/40 border border-gray-800">
                    <label className="text-xs text-gray-300 flex items-center justify-between">
                      UPI ID
                      <button
                        className="text-yellow-400 flex items-center gap-2 text-xs hover:underline"
                        onClick={() => {
                          if (event?.upi1) {
                            navigator.clipboard.writeText(event.upi1);
                            // alert("UPI ID copied to clipboard!");
                            toast.success("UPI ID copied to clipboard!")
                          }
                        }}
                      >
                        <BsCopy />
                        Copy
                      </button>
                    </label>
                    <span className="text-sm font-medium text-white">
                      {event?.upi1}
                    </span>
                  </div>

                  {/* Registration Fee */}
                  <div className="flex flex-col gap-2 p-4 rounded-md bg-gray-900/40 border border-gray-800">
                    <label className="text-xs text-gray-300">
                      Registration Fee
                    </label>
                    <span className="text-sm font-medium text-white">
                      {event?.registrationFee}
                    </span>
                  </div>

                  {/* Pay Button */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:hidden">
                    {[
                      {
                        name: "GPay",
                        img: "/gpay.png",
                        getLink: (
                          upiId: string,
                          name: string,
                          amount: number
                        ) =>
                          `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name||"")}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${event?.title} Event Payment`)}`,
                      },
                      {
                        name: "Paytm",
                        img: "/paytm.png",
                        getLink: (
                          upiId: string,
                          name: string,
                          amount: number
                        ) =>
                          `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name||"")}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${event?.title} Event Payment`)}`,
                      },
                      {
                        name: "PhonePe",
                        img: "/ppay.png",
                        getLink: (
                          upiId: string,
                          name: string,
                          amount: number
                        ) =>
                         `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name||"")}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${event?.title} Event Payment`)}`,
                      },
                    ].map((item, idx) => {
                      const upiId = idx === 1 ? event?.upi2 : event?.upi1; // Paytm uses upi2
                      const amount = Number(event.registrationFee.replace("/-", "")) || 0;
                      const coordinatorName =
                        event?.coordinators[0]?.name || "Coordinator";
                      const upiLink = item.getLink(
                        upiId!,
                        coordinatorName,
                        amount
                      );

                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            window.open(upiLink, "_blank"); // open link in new tab
                          }}
                          className="flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg text-gray-600 font-medium bg-black border border-gray-800 hover:opacity-90 transition"
                        >
                          <Image
                            src={item.img}
                            className="w-[7rem]"
                            width={100}
                            height={100}
                            alt={item.name}
                          />
                          <span>Pay with {item.name}</span>
                          <span className="text-yellow-400 font-semibold">
                            &#x20B9;{amount}/-
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Transaction ID Input */}
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-xs text-gray-300">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your transaction ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isGroupEvent ? (
                  <button
                    type="button"
                    disabled={isSubmitting || !currentUser}
                    onClick={handleRegisterIndividual}
                    className="w-full sm:w-auto bg-yellow-400 text-black-950 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-yellow-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <LuLoader className="animate-spin" />}
                    {isSubmitting ? "Registering..." : "Submit"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={
                      isSubmitting
                      // || members.length === Number(event?.memberMinCount)-1
                    }
                    onClick={handleRegisterGroup}
                    className="w-full sm:w-auto bg-yellow-400 text-black-950 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-yellow-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <LuLoader className="animate-spin" />}
                    {isSubmitting ? "Registering..." : "Submit"}
                  </button>
                )}
                <Link
                  href={`/events/${eventId}`}
                  className="w-full sm:w-auto border border-yellow-400 text-yellow-400 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-yellow-400 hover:text-black-950 text-center"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
