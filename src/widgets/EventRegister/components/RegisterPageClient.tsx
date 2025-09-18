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
  onSnapshot,
  updateDoc,
  runTransaction,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuUser, LuUsers, LuPlus, LuLoader } from "react-icons/lu";
import { events } from "@utils/constants";
import toast from "react-hot-toast";
import { AppEvent } from "@lib/types";
import { IoClose } from "react-icons/io5";
import Image from "next/image";

type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  semester?: string | null;
  rollNumber: string | null;
  phone: string | null;
};

type Member = {
  roll?: string | null;
  name?: string | null;
  email?: string | null;
  semester?: string | null;
  phone?: string | null;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
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
  const [respondingInvite, setRespondingInvite] = useState<string | null>(null);
  const [extraData, setExtraData] = useState<Record<string, string>>({});

  //New changes by Abhishek..
  const [chosenEvent, setChosenEvent] = useState<AppEvent | undefined>();
  const [teamMates, setTeamMates] = useState([]);
  const [members, setMembers] = useState<Member[]>([
    { roll: "", name: "", email: "", semester: "", phone: "" },
  ]);
  const [participants, setParticipants] = useState<Member[]>([]);
  const [transactionId, setTransactionId] = useState("");

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

  console.log("Participants:", participants);
  console.log("Profile:", profile);
  const router = useRouter();

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

  const handleChange = (index: number, field: keyof Member, value: string) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
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
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time invites listener (leader view)
  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, "invitations"),
      where("inviterUid", "==", profile.uid),
      where("eventId", "==", eventId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const invites = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        inviteeEmail: docSnap.data().inviteeEmail,
        inviteeUid: docSnap.data().inviteeUid,
        inviterUid: docSnap.data().inviterUid,
        inviterEmail: docSnap.data().inviterEmail,
        extraData: docSnap.data().extraData || null,
        status: docSnap.data().status,
      }));
      console.log("Invites updated:", invites);
      setInvited(invites);
    });

    return () => unsubscribe();
  }, [profile, eventId]);

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

  // Invite handling
  const handleCancelInvite = async (inviteId: string) => {
    setCancellingInvite(inviteId);
    try {
      await deleteDoc(doc(db, "invitations", inviteId));
      toast.success("Invite cancelled.");
    } catch (err) {
      console.error("Failed to cancel invite:", err);
      toast.error("Failed to cancel invite. Please try again.");
    } finally {
      setCancellingInvite(null);
    }
  };

  const handleInvite = async () => {
    setInviteErrors("");
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return setInviteErrors("Please enter an email.");
    if (!profile || !profile.semester)
      return setInviteErrors(
        "Complete your profile first (semester required)."
      );
    if (email === profile.email)
      return setInviteErrors("You cannot invite yourself.");

    setIsInviting(true);
    try {
      if (invited.find((i) => i.inviteeEmail === email)) {
        setInviteErrors("You already invited this user.");
        return;
      }

      const q = query(collection(db, "users"), where("email", "==", email));
      const snap = await getDocs(q);
      if (snap.empty) {
        setInviteErrors("No user found with that email in obcyFest.");
        return;
      }

      const invitee = snap.docs[0].data();
      const inviteeUid = invitee.uid;

      if ((invitee.semester || "") !== (profile.semester || "")) {
        setInviteErrors("Invitee must be in the same semester.");
        return;
      }

      if (!event?.isOnline && normalizedEventDate) {
        const regQ = query(
          collection(db, "registrations"),
          where("participantUids", "array-contains", inviteeUid)
        );
        const regSnap = await getDocs(regQ);
        const conflict = regSnap.docs.some(
          (d) => d.data().eventDate === normalizedEventDate
        );
        if (conflict) {
          setInviteErrors(
            "Invitee is already registered for another event on the same day."
          );
          return;
        }
      }
      console.log(event?.requiresExtraData, event?.extraFields);
      await addDoc(collection(db, "invitations"), {
        eventId,
        eventTitle: event?.title,
        inviterUid: profile.uid,
        inviterEmail: profile.email,
        inviteeUid,
        inviteeEmail: email,
        hasExtraData: event?.requiresExtraData ?? false, // ✅ fallback to false
        extraData: event?.requiresExtraData ? event?.extraFields ?? null : null,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setInviteEmail("");
      // await fetch("/api/send-invite", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     to: email,
      //     inviterName: profile.displayName,
      //     eventTitle: event?.title,
      //     inviteLink:
      //       `${process.env.NEXT_PUBLIC_BASE_URL}/profile` ||
      //       `${window.location.origin}/profile`,
      //   }),
      // });
      toast.success("Invite sent successfully!");
    } catch (err) {
      console.error(err);
      setInviteErrors("Failed to send invite. Please try again." + err);
    } finally {
      setIsInviting(false);
    }
  };

  // Group registration
  const handleRegisterGroup = async () => {
    console.log(members);
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
    console.log("Group registration called!!!");
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
            ...(extraData || {}),
          },
          ...members,
        ];

        // ✅ Check conflicts
        if (normalizedEventDate) {
          for (let p of participants) {
            const regQ = query(
              collection(db, "registrations"),
              where("participantUids", "array-contains", p.email)
            );
            const regSnap = await getDocs(regQ);
            if (
              regSnap.docs.some(
                (d) => d.data().eventDate === normalizedEventDate
              )
            ) {
              throw new Error(
                `${
                  p.displayName || p.email
                } is already registered for another event on the same day.`
              );
            } else {
              console.log("No date conflicts");
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
      // router.push(`/events/${eventId}`);
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
        participantUids: [profile.uid],
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
      toast.success("Registration successful!");
      router.push(`/events/${eventId}`);
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
    console.log(selectedEvent);
  }, [eventId, events]);

  const handleRemoveMember = (index: number) => {
    if (members.length > (Number(event?.memberMaxCount) - 2 || 1)) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  console.log(members);

  if (loading) {
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

  return (
    <div className="min-h-screen py-16 sm:py-24 text-white">
      {!currentUser ? (
        <div className="min-h-screen flex items-center justify-center bg-black-950 text-white">
          <div className="text-center px-4">
            <p className="text-gray-300 text-lg">Please sign in to register.</p>
            <Link
              href="/profile"
              className="text-yellow-400 hover:underline mt-2 inline-block"
            >
              Go to Profile to Sign In
            </Link>
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
                  This is an online event (no schedule conflicts).
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
              </div>
              {/* Extra fields */}
              {event.requiresExtraData && Array.isArray(event.extraFields) && (
                <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl border border-gray-800">
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
                              setExtraData((prev: Record<string, string>) => ({
                                ...prev,
                                [field.name]: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Group Invite */}

              {isGroupEvent && (
                <div>
                  {members.map((member, index) => (
                    <div
                      key={index}
                      className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 border border-gray-700 rounded-lg bg-black"
                    >
                      {/* Member Title */}
                      <h3 className="absolute -top-3 left-3 bg-black px-2 text-yellow-400 text-sm font-semibold rounded">
                        Member {index + 2}
                      </h3>

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
                          value={member.semester || profile?.semester || ""}
                          onChange={(e) =>
                            handleChange(index, "semester", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
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

                      {/* Remove button - top right */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="flex flex-col gap-2 p-4 rounded-md bg-gray-900/40 border border-gray-800">
                    <label className="text-xs text-gray-300">Phone</label>
                    <span className="text-sm font-medium text-white">
                      +91 9876543210
                    </span>
                  </div>

                  {/* UPI */}
                  <div className="flex flex-col gap-2 p-4 rounded-md bg-gray-900/40 border border-gray-800">
                    <label className="text-xs text-gray-300">UPI ID</label>
                    <span className="text-sm font-medium text-white">
                      name@upi
                    </span>
                  </div>

                  {/* Pay Button */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* GPay */}
                    <button
                      onClick={() => {
                        const upiId = "name@upi";
                        const name = "Recipient Name";
                        const amount = "100"; // optional
                        const upiLink = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=Event%20Payment`;
                        window.location.href = upiLink;
                      }}
                      className="flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg text-gray-600 font-medium bg-black border border-gray-800 hover:opacity-90 transition"
                    >
                      <Image
                        src={"/gpay.png"}
                        className="w-[7rem]"
                        width={100}
                        height={100}
                        alt="Google Pay"
                      />
                      <span>Pay with GPay</span>
                      <span className="text-yellow-400 font-semibold">
                        ₹100/-
                      </span>
                    </button>

                    {/* Paytm */}
                    <button
                      onClick={() => {
                        const upiId = "name@upi";
                        const name = "Recipient Name";
                        const amount = "100"; // optional
                        const upiLink = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=Event%20Payment`;
                        window.location.href = upiLink;
                      }}
                      className="flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg text-gray-600 font-medium bg-black border border-gray-800 hover:opacity-90 transition"
                    >
                      <Image
                        src={"/paytm.png"}
                        className="w-[7rem]"
                        width={100}
                        height={100}
                        alt="Paytm"
                      />
                      <span>Pay with Paytm</span>
                      <span className="text-yellow-400 font-semibold">
                        ₹100/-
                      </span>
                    </button>

                    {/* PhonePe */}
                    <button
                      onClick={() => {
                        const upiId = "name@upi";
                        const name = "Recipient Name";
                        const amount = "100"; // optional
                        const upiLink = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=Event%20Payment`;
                        window.location.href = upiLink;
                      }}
                      className="flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg text-gray-600 font-medium bg-black border border-gray-800 hover:opacity-90 transition"
                    >
                      <Image
                        src={"/ppay.png"}
                        className="w-[5rem]"
                        width={100}
                        height={100}
                        alt="PhonePe"
                      />
                      <span>Pay with PhonePe</span>
                      <span className="text-yellow-400 font-semibold">
                        ₹100/-
                      </span>
                    </button>
                  </div>

                  {/* Transaction ID Input */}
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-xs text-gray-300">
                      Transaction ID
                    </label>
                    <input
                      onChange={(e) => {
                        setTransactionId(e.target.value);
                      }}
                      type="text"
                      placeholder="Enter your transaction ID"
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
                      isSubmitting || members.length === event?.memberMinCount
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
