'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/admin/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl max-w-md mx-4">
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
        
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">Redirecting...</h1>
        
        <p className="text-gray-300 mb-6">
          You are being redirected to the admin dashboard.
        </p>
        
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-yellow-500 h-2.5 rounded-full animate-progress"></div>
        </div>
        
        <p className="text-sm text-gray-400 mt-6">
          If you are not redirected automatically, 
          <a 
            href="/admin/dashboard" 
            className="text-yellow-400 hover:underline ml-1"
          >
            click here
          </a>.
        </p>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RedirectPage;