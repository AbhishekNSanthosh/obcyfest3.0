'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { app, db } from '@lib/firebase';
import Sidebar from '@components/Sidebar';
import IconMenu from '@components/IconMenu';
import Loader from '@components/Loader';

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setIsAdmin(true);
          // redirect only if not already in dashboard
          if (!pathname.startsWith('/admin/dashboard')) {
            router.replace('/admin/dashboard');
          }
        } else {
          setIsAdmin(false);
          router.replace('/');
        }
      } else {
        setIsAdmin(false);
        router.replace('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // 🔄 Show loader while checking auth
  if (loading || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black-950 text-yellow-400">
        <div className="flex flex-col items-center gap-4">
          <Loader />
          <p className="text-lg font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // ❌ If not admin → don't render anything (redirect handles it)
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black-950 text-yellow-400">
        <p>Redirecting...</p>
      </div>
    );
  }

  // ✅ Dashboard layout (admin only)
  return (
    <div className="flex h-screen bg-black-950 text-white">
  {/* Sidebar */}
  <div
    className={`fixed inset-y-0 left-0 z-30 w-64 bg-black-900 border-r border-yellow-400/20 transform lg:translate-x-0 transition-transform ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}
  >
    <Sidebar />
  </div>

  {/* Main content */}
  <div className="flex-1 flex flex-col lg:ml-64"> 
    {/* Top bar (mobile only) */}
    <div className="bg-black-900 border-b border-yellow-400/20 shadow-md lg:hidden">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="p-4 text-yellow-400"
      >
        <IconMenu />
      </button>
    </div>

    {/* Dashboard content */}
    <main className="flex-1 p-6 overflow-y-auto">{children}</main>
  </div>
</div>
  );
};

export default AdminDashboardLayout;
