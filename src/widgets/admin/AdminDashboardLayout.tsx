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

  return (
    <div className="flex max-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col"> 
        {/* Top bar (mobile only) */}
        <div className="bg-black shadow-md lg:hidden sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-4 text-yellow-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Dashboard content */}
        <main className="flex-1 max-w-screen">{children}</main>
      </div>
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboardLayout;
