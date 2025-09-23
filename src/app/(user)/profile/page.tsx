"use client";
import React, { useEffect, useMemo, useState } from "react";
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
  LuMail,
  LuCalendarCheck,
  LuUser,
  LuUsers,
  LuCalendarX,
} from "react-icons/lu";
import { events, semesters } from "@utils/constants";

type Invite = {
  id: string;
  eventTitle: string;
  status: string;
  role: "inviter" | "invitee";
  email: string;
  eventId?: string;
  hasExtraData?: boolean;
  extraData?: { name: string; type: string }[];
};

type Registration = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string | null;
  isGroup: boolean;
  leaderUid?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<null | typeof auth.currentUser>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [semester, setSemester] = useState("");
  const [phone, setPhone] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [updatingInvite, setUpdatingInvite] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInvite, setCurrentInvite] = useState<Invite | null>(null);
  const [extraFieldData, setExtraFieldData] = useState<Record<string, string>>(
    {}
  );
  const router = useRouter();
  const isComplete = useMemo(
    () =>
      rollNumber.trim() !== "" && semester.trim() !== "" && phone.trim() !== "",
    [rollNumber, semester, phone]
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
          setRollNumber(data.rollNumber || "");
          setSemester(data.semester || "");
          setPhone(data.phone || "");
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setProfileLoaded(true);
      }
    };
    fetchProfile();
  }, [user]);

  // Real-time invites listener
  useEffect(() => {
    if (!user) return;

    const inviterQ = query(
      collection(db, "invitations"),
      where("inviterUid", "==", user.uid)
    );
    const inviteeQ = query(
      collection(db, "invitations"),
      where("inviteeUid", "==", user.uid)
    );

    const unsubInviter = onSnapshot(inviterQ, (snap) => {
      const inviterInvites = snap.docs.map((d) => ({
        id: d.id,
        eventId: d.data().eventId,
        eventTitle: d.data().eventTitle,
        status: d.data().status,
        role: "inviter" as const,
        email: d.data().inviteeEmail,
      }));
      setInvites((prev) =>
        [...prev.filter((i) => i.role !== "inviter"), ...inviterInvites].filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        )
      );
    });

    const unsubInvitee = onSnapshot(inviteeQ, (snap) => {
      const inviteeInvites = snap.docs.map((d) => ({
        id: d.id,
        eventTitle: d.data().eventTitle,
        eventId: d.data().eventId,
        hasExtraData: d.data().hasExtraData,
        extraData: d.data().extraData || null,
        status: d.data().status,
        role: "invitee" as const,
        email: d.data().inviterEmail,
      }));
      setInvites((prev) =>
        [...prev.filter((i) => i.role !== "invitee"), ...inviteeInvites].filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        )
      );
    });

    return () => {
      unsubInviter();
      unsubInvitee();
    };
  }, [user]);


  // Real-time registrations listener
  useEffect(() => {
    if (!user) return;

    const regQ = query(
      collection(db, "registrations"),
      where("participantMails", "array-contains", user.email)
    );
    const unsubRegs = onSnapshot(regQ, (snap) => {
      setRegistrations(
        snap.docs.map((d) => ({
          id: d.id,
          eventId: d.data().eventId,
          eventTitle: d.data().eventTitle,
          eventDate: d.data().eventDate,
          isGroup: d.data().isGroup,
          leaderUid: d.data().leaderUid, // Retrieve leaderUid
        }))
      );
    });

    return () => unsubRegs();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!isComplete) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!/^\+?\d{10,14}$/.test(phone.trim())) {
      toast.error("Please enter a valid phone number (10-14 digits).");
      return;
    }
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      const dataToSave = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
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
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleInviteResponse = async (
    invite: Invite,
    newStatus: "accepted" | "declined"
  ) => {
    if (newStatus === "accepted" && invite.hasExtraData) {
      setCurrentInvite(invite);
      setIsModalOpen(true);
    } else {
      setUpdatingInvite(invite.id);
      try {
        const ref = doc(db, "invitations", invite.id);

        const inviteData = await runTransaction(db, async (transaction) => {
          const inviteDoc = await transaction.get(ref);
          if (!inviteDoc.exists()) throw new Error("Invite does not exist!");

          const currentStatus = inviteDoc.data().status;
          if (currentStatus !== "pending") {
            throw new Error(`Invite already ${currentStatus}.`);
          }

          transaction.update(ref, { status: newStatus });
          return inviteDoc.data();
        });

        if (inviteData) {
          await fetch("/api/invite-response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inviterEmail: inviteData.inviterEmail,
              inviteeName: inviteData.inviteeEmail,
              eventTitle: inviteData.eventTitle,
              status: newStatus,
            }),
          });
        }

        toast.success(`Invite ${newStatus} successfully.`);
      } catch (e: any) {
        console.error("Failed to update invite status", e);
        toast.error(
          e.message || "Failed to update invite status. Please try again."
        );
      } finally {
        setUpdatingInvite(null);
      }
    }
  };

  const handleModalSubmit = async () => {
    if (!currentInvite) return;

    setUpdatingInvite(currentInvite.id);
    setIsModalOpen(false);

    try {
      const ref = doc(db, "invitations", currentInvite.id);

      const inviteData = await runTransaction(db, async (transaction) => {
        const inviteDoc = await transaction.get(ref);
        if (!inviteDoc.exists()) throw new Error("Invite does not exist!");

        const currentStatus = inviteDoc.data().status;
        if (currentStatus !== "pending") {
          throw new Error(`Invite already ${currentStatus}.`);
        }

        transaction.update(ref, {
          status: "accepted",
          extraData: { ...extraFieldData },
        });
        return inviteDoc.data();
      });

      if (inviteData) {
        await fetch("/api/invite-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inviterEmail: inviteData.inviterEmail,
            inviteeName: inviteData.inviteeEmail,
            eventTitle: inviteData.eventTitle,
            status: "accepted",
          }),
        });
      }

      toast.success(`Invite accepted successfully.`);
    } catch (e: any) {
      console.error("Failed to update invite status", e);
      toast.error(
        e.message || "Failed to update invite status. Please try again."
      );
    } finally {
      setUpdatingInvite(null);
      setCurrentInvite(null);
      setExtraFieldData({});
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
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
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "text-green-400 bg-green-900/50";
      case "declined":
        return "text-red-400 bg-red-900/50";
      case "pending":
        return "text-yellow-400 bg-yellow-900/50";
      default:
        return "text-gray-400 bg-gray-700/50";
    }
  };

  if (loading || !profileLoaded) {
    return (
      <div className="min-h-screen pt-[12vh] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-[12vh] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-6 text-gray-300">You are not signed in.</p>
          <Link
            href="/"
            className="bg-yellow-400 rounded-lg px-[5vw] py-3 text-black-950 font-semibold"
          >
            Go to Home 
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[12vh] text-white sm:px-6 lg:px-8 pb-12">
  <div className="px-[3vw] md:pt-[2rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
    {/* Profile Section */}
    <div className="bg-black-950 bg-opacity-60 p-4 sm:p-8 rounded-xl border border-gray-800">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {user.photoURL && (
          <div className="p-1 rounded-full border-[2px] border-yellow-400">
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
          <h1 className="text-3xl font-bold text-yellow-400">
            {user.displayName || "User"}
          </h1>
          <p className="text-gray-300">{user.email}</p>
        </div>
        <button
          onClick={() => {
            signOut(auth)
            toast.success("Logout successful")
            setTimeout(() => {
              router.replace('/')
            }, 300);
          }}
          className="sm:ml-auto mt-4 sm:mt-0 text-red-600 hover:text-white transition-colors flex items-center gap-2 border border-red-700 px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <LuLogOut />
          Sign out
        </button>
      </div>

      {/* Completion form */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-yellow-400 mb-4">
          Complete your profile
        </h2>
        {!isComplete && (
          <p className="text-sm text-yellow-500 mb-4">
            Please complete your profile to register for events.
          </p>
        )}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Roll Number *
            </label>
            <input
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="10-14 digit phone number"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              disabled={saving || !isComplete}
              onClick={handleSave}
              className="w-full sm:w-auto bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black-950 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 flex items-center justify-center gap-2"
            >
              <LuSave />
              {saving ? "Saving..." : "Save details"}
            </button>
            <Link
              href="/events"
              className="w-full sm:w-auto border border-yellow-400 text-yellow-400 px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 hover:text-black-950 transition-colors flex items-center justify-center gap-2"
            >
              <LuCalendarDays />
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Registered Events Section */}
    <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl border border-gray-800">
  <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
    <LuCalendarCheck /> Registered Events
  </h2>
  <p className="text-sm text-gray-400 mb-4">
    *Only the leader of a group registration can cancel the event.
  </p>
  {registrations.length === 0 ? (
    <p className="text-gray-400">
      You have not registered for any events yet.
    </p>
  ) : (
    <div className="space-y-3">
      {registrations.map((reg) => (
        <div
          key={reg.id}
          className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center gap-4">
            {reg.isGroup ? (
              <LuUsers className="text-yellow-400" />
            ) : (
              <LuUser className="text-yellow-400" />
            )}
            <div>
              <p className="text-gray-200 font-medium">{reg.eventTitle}</p>
              {reg.eventDate && (
                <p className="text-gray-400 text-sm">Date: {reg.eventDate}</p>
              )}
            </div>
          </div>
          {(() => {
            const event = events.find((e) => e.id === reg.eventId);
            if (!event || !reg.leaderUid || user.uid !== reg.leaderUid) return false;

            const now = new Date();
            const finalDate = new Date(event.regFinalDate);

            // If RegCloseTime is defined, adjust the final date
            if (event.RegCloseTime) {
              finalDate.setHours(event.RegCloseTime.hours);
              finalDate.setMinutes(event.RegCloseTime.minutes);
            }

            // Only show Cancel button if current time is before the final registration date/time
            return now < finalDate;
          })() && (
            <button
              onClick={() => handleCancelRegistration(reg.id)}
              className="px-3 py-1 bg-red-500 rounded text-sm text-white font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}


        </div>
      ))}
    </div>
  )}
</div>

  </div>

  <InviteModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSubmit={handleModalSubmit}
    invite={currentInvite}
    extraFieldData={extraFieldData}
    setExtraFieldData={setExtraFieldData}
  />
</div>

  );
}

const InviteModal = ({
  isOpen,
  onClose,
  onSubmit,
  invite,
  extraFieldData,
  setExtraFieldData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  invite: Invite | null;
  extraFieldData: Record<string, string>;
  setExtraFieldData: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}) => {
  if (!isOpen || !invite) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExtraFieldData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-gray-700">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">
          Additional Information for {invite.eventTitle}
        </h2>
        <div className="space-y-4">
          {invite.extraData?.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.name}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={extraFieldData[field.name] || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-yellow-400 text-black-950 font-semibold rounded-lg hover:bg-yellow-500"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
