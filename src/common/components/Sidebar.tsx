'use client';

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FaHome, FaCalendar, FaChartLine } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { IoSettings, IoGameController } from "react-icons/io5";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname();

  const links = useMemo(
    () => [
      {
        href: "/admin/dashboard/",
        label: "Home",
        icon: <FaHome className="h-6 w-6" />,
      },
      {
        href: "/admin/dashboard/user-management",
        label: "User Management",
        icon: <MdGroups className="h-6 w-6" />,
      },
      {
        href: "/admin/dashboard/events",
        label: "Event Registrations",
        icon: <FaCalendar className="h-6 w-6" />,
      },
      {
        href: "/admin/dashboard/scoreboard/",
        label: "Scoreboard",
        icon: <FaChartLine className="h-6 w-6" />,
      },
      {
        href: "/admin/dashboard/events/addevent/",
        label: "Add Event",
        icon: <IoGameController className="h-6 w-6" />,
      },
      {
        href: "/admin/dashboard/settings/",
        label: "Settings",
        icon: <IoSettings className="h-6 w-6" />,
      },
    ],
    []
  );

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-950 text-yellow-400 min-h-screen shadow-lg
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        role="navigation"
        aria-label="Admin dashboard navigation"
      >
        {/* Logo section */}
        <div className="p-4 border-b border-yellow-400/30 flex items-center justify-between lg:justify-center">
          <div className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <Link href="/" onClick={() => setIsOpen(false)}>
                <Image
                  src="/logo/logo1.svg"
                  alt="ObcyFest Admin Logo"
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

          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-md bg-yellow-400 text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="mt-6 p-2">
          <ul className="space-y-1">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin/dashboard/" &&
                  pathname.startsWith(link.href));

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? "bg-yellow-400 text-black font-semibold shadow-lg"
                          : "hover:bg-yellow-400/10 hover:text-yellow-300"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Navigate to ${link.label}`}
                  >
                    <span
                      className={isActive ? "text-black" : "text-yellow-400"}
                    >
                      {link.icon}
                    </span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-yellow-400/30 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} ObcyFest.</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;