'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import { FaHome } from "react-icons/fa";
import { FaCalendar } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import {FaChartLine} from "react-icons/fa";


const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  

  const links = [
    {
      href: '/admin/dashboard/',
      label: 'Home',
      icon: (
        <FaHome className='h-6 w-6' />
      )
    },
    {
      href: '/admin/dashboard/user-management',
      label: 'User Management',
      icon: (
        <MdGroups className='h-6 w-6' />
      )
    },
    {
      href: '/admin/dashboard/events',
      label: 'Event Registrations',
      icon: (
        <FaCalendar className='h-6 w-6' />
      )
    },
    {
      href: '/admin/dashboard/scoreboard/',
      label: 'Scoreboard',
      icon: (
        <FaChartLine className='h-6 w-6' />
      )
    }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-yellow-400 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-black text-yellow-400 h-full shadow-lg
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo section */}
        <div className="p-4 border-b border-yellow-400 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <Link href="/">
              <Image
                src="/logo/logo1.svg" // Replace with your logo path
                alt="Admin Logo"
                fill
                className="object-contain"
                />
                </Link>
            </div>
            <div>
              <h2 className="text-lg font-bold">Admin Panel</h2>
              <p className="text-xs text-gray-400">Management Console</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="mt-6">
          <ul>
            {links.map(link => (
              <li key={link.href} className="px-2 py-2">
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg transition-all
                    ${pathname === link.href
                      ? 'bg-yellow-400 text-black font-semibold shadow-lg'
                      : 'hover:bg-yellow-400 hover:text-black hover:shadow-md'
                    }
                  `}
                >
                  <span className={pathname === link.href ? "text-black" : "hover:text-yellow-400 "}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-yellow-400 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} ObcyFest.</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;