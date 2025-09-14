// File: app/events/[eventId]/register/RegisterPageClient.tsx
'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { doc, collection, addDoc, deleteDoc, getDocs, query, where, serverTimestamp, onSnapshot, updateDoc, runTransaction, getDoc } from 'firebase/firestore'
import { auth, db } from '@lib/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LuUser, LuUsers, LuPlus, LuLoader } from 'react-icons/lu'
import { events } from '@utils/constants'
import toast from 'react-hot-toast'

type UserProfile = {
  uid: string
  email: string | null
  displayName: string | null
  semester?: string
}

interface RegisterPageClientProps {
  eventId: string
  event: (typeof events)[0]
}

const Loader = ({ text }: { text: string }) => (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4" />
        <p className="text-gray-300">{text}</p>
      </div>
    </div>
  );

export default function RegisterPageClient({ eventId, event }: RegisterPageClientProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteErrors, setInviteErrors] = useState<string>('')
  const [invited, setInvited] = useState<Array<{ id: string; email: string; status?: string }>>([])
  const [isInviting, setIsInviting] = useState(false)
  const [cancellingInvite, setCancellingInvite] = useState<string | null>(null)
  const [respondingInvite, setRespondingInvite] = useState<string | null>(null)

  const router = useRouter()

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u)
      if (u) {
        const docRef = doc(db, 'users', u.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setProfile({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            semester: data.semester,
          })
        } else {
          setProfile({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            semester: undefined,
          })
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Real-time invites listener (leader view)
  useEffect(() => {
    if (!profile) return

    const q = query(
      collection(db, 'invitations'),
      where('inviterUid', '==', profile.uid),
      where('eventId', '==', eventId)
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const invites = snap.docs.map(docSnap => ({
        id: docSnap.id,
        email: docSnap.data().inviteeEmail,
        status: docSnap.data().status,
      }))
      setInvited(invites)
    })

    return () => unsubscribe()
  }, [profile, eventId])

  const normalizedEventDate = useMemo(() => {
    if (!event?.date) return null
    return event.date.split(' to ')[0].trim()
  }, [event])

  const isGroupEvent = useMemo(() => {
    return event?.eventType.toLowerCase().includes('group')
  }, [event])

  const getGroupSize = () => {
    const match = event?.eventType.match(/\((\d+)(?:-(\d+))?\)/)
    if (match) {
      const min = parseInt(match[1], 10)
      const max = match[2] ? parseInt(match[2], 10) : min
      return { min, max }
    }
    return { min: 2, max: 5 }
  }

  const { min: minGroupSize, max: maxGroupSize } = getGroupSize()

  // Invite handling
  const handleCancelInvite = async (inviteId: string) => {
    setCancellingInvite(inviteId)
    try {
      await deleteDoc(doc(db, 'invitations', inviteId))
      toast.success('Invite cancelled.')
    } catch (err) {
      console.error('Failed to cancel invite:', err)
      toast.error('Failed to cancel invite. Please try again.')
    } finally {
      setCancellingInvite(null)
    }
  }

  const handleInvite = async () => {
    setInviteErrors('')
    const email = inviteEmail.trim().toLowerCase()
    if (!email) return setInviteErrors('Please enter an email.')
    if (!profile || !profile.semester) return setInviteErrors('Complete your profile first (semester required).')
    if(email === profile.email) return setInviteErrors('You cannot invite yourself.')

    setIsInviting(true)
    try {
      if (invited.find(i => i.email === email)) {
        setInviteErrors('You already invited this user.')
        return
      }

      const q = query(collection(db, 'users'), where('email', '==', email))
      const snap = await getDocs(q)
      if (snap.empty) {
        setInviteErrors('No user found with that email in obcyFest.')
        return
      }

      const invitee = snap.docs[0].data()
      const inviteeUid = invitee.uid

      if ((invitee.semester || '') !== (profile.semester || '')) {
        setInviteErrors('Invitee must be in the same semester.')
        return
      }

      if (normalizedEventDate) {
        const regQ = query(collection(db, 'registrations'), where('participantUids', 'array-contains', inviteeUid))
        const regSnap = await getDocs(regQ)
        const conflict = regSnap.docs.some(d => d.data().eventDate === normalizedEventDate)
        if (conflict) {
          setInviteErrors('Invitee is already registered for another event on the same day.')
          return
        }
      }

      await addDoc(collection(db, 'invitations'), {
        eventId,
        eventTitle: event?.title,
        inviterUid: profile.uid,
        inviterEmail: profile.email,
        inviteeUid,
        inviteeEmail: email,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setInviteEmail('')
      await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,    
        inviterName: profile.displayName,
        eventTitle: event?.title,
        inviteLink: `http://localhost:3000/profile`
    }),
});
      toast.success('Invite sent successfully!')
    } catch (err) {
      console.error(err)
      setInviteErrors('Failed to send invite. Please try again.')
    } finally {
      setIsInviting(false)
    }
  }

  // Group registration
  const handleRegisterGroup = async () => {
    if (!currentUser || !profile) return

    const acceptedInvites = invited.filter(i => i.status === 'accepted')
    const totalMembers = 1 + acceptedInvites.length
    if (totalMembers < minGroupSize) {
      toast.error(`You need at least ${minGroupSize} members.`)
      return
    }
    if (totalMembers > maxGroupSize) {
      toast.error(`Maximum ${maxGroupSize} members allowed.`)
      return
    }

    setIsSubmitting(true)
    try {
      await runTransaction(db, async (transaction) => {
        const participants: UserProfile[] = [{
          uid: profile.uid,
          email: profile.email,
          displayName: profile.displayName,
          semester: profile.semester,
        }]

        for (let invite of acceptedInvites) {
          const q = query(collection(db, 'users'), where('email', '==', invite.email)) // This is inefficient, but will keep for now.
          const snap = await getDocs(q)
          if (snap.empty) {
            throw new Error(`User ${invite.email} not found.`)
          }
          const data = snap.docs[0].data()
          participants.push({
            uid: data.uid,
            email: data.email,
            displayName: data.displayName,
            semester: data.semester,
          })
        }

        if (normalizedEventDate) {
          for (let p of participants) {
            const regQ = query(collection(db, 'registrations'), where('participantUids', 'array-contains', p.uid))
            const regSnap = await getDocs(regQ)
            if (regSnap.docs.some(d => d.data().eventDate === normalizedEventDate)) {
              throw new Error(`${p.displayName || p.email} is already registered for another event on the same day.`)
            }
          }
        }

        const regRef = doc(collection(db, 'registrations'))
        transaction.set(regRef, {
          eventId: event?.id,
          eventTitle: event?.title,
          eventDate: normalizedEventDate || null,
          isGroup: true,
          leaderUid: profile.uid,
          participantUids: participants.map(p => p.uid),
          participants,
          createdAt: serverTimestamp(),
        })

        for (let invite of acceptedInvites) {
          const inviteRef = doc(db, 'invitations', invite.id)
          transaction.delete(inviteRef)
        }
      })

      toast.success('Group registration successful!')
      router.push(`/events/${eventId}`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Individual registration
  const handleRegisterIndividual = async () => {
    if (!currentUser || !profile) return

    setIsSubmitting(true)
    try {
      if (normalizedEventDate) {
        const regQ = query(collection(db, 'registrations'), where('participantUids', 'array-contains', profile.uid))
        const regSnap = await getDocs(regQ)
        if (regSnap.docs.some(d => d.data().eventDate === normalizedEventDate)) {
          toast.error('You are already registered for another event on the same day.')
          setIsSubmitting(false)
          return
        }
      }

      await addDoc(collection(db, 'registrations'), {
        eventId: event?.id,
        eventTitle: event?.title,
        eventDate: normalizedEventDate || null,
        isGroup: false,
        leaderUid: profile.uid,
        participantUids: [profile.uid],
        participants: [{
          uid: profile.uid,
          email: profile.email,
          displayName: profile.displayName,
          semester: profile.semester || null,
        }],
        createdAt: serverTimestamp(),
      })
      toast.success('Registration successful!')
      router.push(`/events/${eventId}`)
    } catch (err) {
      console.error(err)
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <Loader text="Loading registration details..." />
  }

  return (
    <div className="min-h-screen py-16 sm:py-24 text-white">
      {!currentUser ? (
        <div className="min-h-screen flex items-center justify-center bg-black-950 text-white">
          <div className="text-center px-4">
            <p className="text-gray-300 text-lg">
              Please sign in to register.
            </p>
            <Link href="/profile" className="text-yellow-400 hover:underline mt-2 inline-block">
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
                <Link href="/profile" className="text-yellow-400 hover:underline mt-2 inline-block">
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
                Register for {event?.title}
              </h1>
              <p className="text-gray-300 text-base sm:text-lg">
                {event?.eventType} • Registration Fee: {event?.registrationFee}
              </p>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* User details */}
              <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl border border-gray-800">
                <h2 className="text-lg font-semibold text-yellow-400 mb-6 flex items-center gap-2">
                  <LuUser className="text-lg" />
                  Your Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      value={profile?.displayName || ''}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                    <input
                      value={profile?.semester || ''}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      value={profile?.email || ''}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Group Invite */}
              {isGroupEvent && (
                <div className="bg-black-950 bg-opacity-60 p-6 rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-yellow-400 flex items-center gap-2">
                      <LuUsers className="text-lg" />
                      Invite Members by Email ({1 + invited.filter(i => i.status === 'accepted').length}/{maxGroupSize})
                    </h2>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">
                    Invite {minGroupSize - 1} to {maxGroupSize - 1} members. Invites require same semester and no
                    same-day conflict.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="member@example.com"
                      className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      disabled={isInviting}
                    />
                    <button
                      type="button"
                      onClick={handleInvite}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-black-950 rounded-lg font-semibold hover:bg-yellow-500 disabled:opacity-50"
                      disabled={isInviting}
                    >
                      {isInviting ? <LuLoader className="animate-spin" /> : <LuPlus />}
                      {isInviting ? 'Sending...' : 'Send Invite'}
                    </button>
                  </div>
                  {inviteErrors && <p className="text-red-400 text-sm mt-2">{inviteErrors}</p>}

                  {invited.length > 0 && (
                    <div className="mt-6 space-y-2">
                      {invited.map((m) => (
                        <div
                          key={m.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 w-full"
                        >
                          {/* Email and Status */}
                          <span className="text-gray-200 break-words truncate sm:truncate-none max-w-full sm:max-w-xs">
                            {m.email} {m.status ? `(${m.status})` : ''}
                          </span>

                          {/* Buttons */}
                          <div className="flex flex-wrap sm:flex-nowrap gap-2 items-start sm:items-center mt-2 sm:mt-0">
                            {profile?.uid === currentUser?.uid && (
                              <button
                                onClick={() => handleCancelInvite(m.id)}
                                className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                disabled={cancellingInvite === m.id}
                              >
                                {cancellingInvite === m.id ? 'Removing...' : 'Remove'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-400 text-xs mt-4">Note: Members will need to accept the invite separately.</p>
                </div>
              )}

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
                    {isSubmitting ? 'Registering...' : 'Submit'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting || !currentUser || invited.filter(i => i.status === 'accepted').length + 1 < minGroupSize}
                    onClick={handleRegisterGroup}
                    className="w-full sm:w-auto bg-yellow-400 text-black-950 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-yellow-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <LuLoader className="animate-spin" />}
                    {isSubmitting ? 'Registering...' : 'Submit'}
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
  )
}