'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "@lib/firebase";
import Sidebar from "@components/Sidebar";
import Loader from "@components/Loader";

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Memoize the auth check to prevent unnecessary re-renders
  const checkAuth = useCallback(async () => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().role === "admin") {
            setIsAdmin(true);
            if (!pathname.startsWith("/admin/dashboard")) {
              router.replace("/admin/dashboard");
            }
          } else {
            setIsAdmin(false);
            router.replace("/");
          }
        } else {
          setIsAdmin(false);
          router.replace("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAdmin(false);
        router.replace("/?error=auth-failed");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    checkAuth().then(fn => {
      unsubscribe = fn;
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [checkAuth]);

  // Loading state with improved UI
  if (loading || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-yellow-400">
        <div className="flex flex-col items-center gap-4 p-4">
          <Loader />
          <p className="text-lg font-medium animate-pulse">
            Loading Obcyfest Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Redirect state with improved UI
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-yellow-400">
        <div className="flex flex-col items-center gap-4 p-4">
          <Loader />
          <p className="text-lg font-medium">Redirecting to Home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-gray-900 shadow-lg">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-4 text-yellow-400 hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isSidebarOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default AdminDashboardLayout;