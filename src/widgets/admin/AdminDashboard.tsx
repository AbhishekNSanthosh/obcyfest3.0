"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@lib/firebase";
import { events } from "@utils/constants";
import { LuUsers, LuCalendar, LuChartBar } from "react-icons/lu";
import Loader from "@components/Loader";
import Link from "next/link";

type Registration = {
  id: string;
  eventId: string;
  eventTitle: string;
  participants: any[];
};

const StatCard = ({ title, value, icon }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-700 rounded-xl p-6 flex items-center gap-6">
    <div className="bg-yellow-400 bg-opacity-20 text-yellow-400 p-4 rounded-full">
      {icon}
    </div>
    <div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-white text-3xl font-bold">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [eventRegistrations, setEventRegistrations] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        setTotalUsers(usersSnapshot.size);

        const registrationsCollection = collection(db, "registrations");
        const registrationsSnapshot = await getDocs(registrationsCollection);
        const registrations = registrationsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Registration)
        );

        let totalRegs = 0;
        const registrationsByEvent: Record<string, number> = {};
        events.forEach(event => registrationsByEvent[event.id] = 0);

        registrations.forEach((registration) => {
          totalRegs += registration.participants.length;
          if (registrationsByEvent[registration.eventId] !== undefined) {
            registrationsByEvent[registration.eventId] += 1;
          }
        });

        setTotalRegistrations(totalRegs);
        setEventRegistrations(registrationsByEvent);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
    
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-8">Admin Dashboard</h1>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Users" value={totalUsers} icon={<LuUsers size={28} className="text-black" />} />
        <StatCard title="Total Registrations" value={totalRegistrations} icon={<LuCalendar size={28} className="text-black" />} />
        <StatCard title="Events" value={events.length} icon={<LuChartBar size={28} className="text-black" />} />
      </div>

      {/* Event-specific Stats */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-6">Event Registrations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/admin/dashboard/events/${event.id}`} passHref>
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-700 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                <h3 className="font-semibold text-white truncate mb-1" title={event.title}>{event.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{event.type}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Registrations:</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {eventRegistrations[event.id] || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;