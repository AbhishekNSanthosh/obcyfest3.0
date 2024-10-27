"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiMenuAlt2, HiX } from "react-icons/hi";

export default function HeaderContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = usePathname();

  const navItems = [
    {
      title: "About",
      link: "/#about",
    },
    {
      title: "FAQs",
      link: "/#faqs",
    },
    {
      title: "Contact",
      link: "/#contact",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <div
        className={`px-[5vw] min-h-[10vh] md:min-h-[13vh] lg:min-h-[13vh] flex w-full fixed top-0 z-20 transition-all duration-300 ${
          isScrolled ? "backdrop-blur-lg fixed" : "bg-transparent"
        }`}
      >
        <div className="flex flex-1 items-center justify-start">
          <Link href={"/"}>
            <Image
              src={"/logo/Obcylogomain.svg"}
              height={500}
              width={500}
              alt=""
              className="cursor-pointer lg:w-[3rem] lg:h-[3rem] md:h-[3rem] h-[2rem] md:w-[3rem] w-[2rem]"
            />
          </Link>
        </div>
        <div className="lg:flex md:flex hidden flex-2 items-center justify-center gap-[4vw]">
          <div className="flex flex-row gap-[2vw] rounded-[50px] p-2 px-4">
            {navItems.map((item, index) => (
              <Link
                href={item?.link}
                key={index}
                className="py-1 relative cursor-pointer text-yellow-400 font-medium after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0 after:bg-yellow-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                <span className="capitalize">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="lg:flex md:flex hidden flex-1 items-center justify-end gap-[4vw]">
          {location === "/events" ? (
            <Link href={"/"}>
              <button className="bg-yellow-400 rounded-lg px-[1rem] py-2 text-black-950 font-semibold">
                Go to Home
              </button>
            </Link>
          ) : (
            <Link href={"/events"}>
              <button className="bg-yellow-400 rounded-lg px-[1rem] py-2 text-black-950 font-semibold">
                Events
              </button>
            </Link>
          )}
        </div>
        <div className="flex md:hidden lg:hidden flex-1 items-center justify-end gap-[4vw]">
          <HiMenuAlt2
            className="text-3xl text-yellow-400 cursor-pointer"
            onClick={toggleDrawer}
          />
        </div>
      </div>

      {/* Drawer for mobile view */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-30 flex flex-col bg-black-950">
          {/* Top section with logo and close button */}
          <div className="flex items-center justify-between p-4 w-full">
            <Link href={"/"}>
              <Image
                src={"/logo/Obcylogomain.svg"}
                height={500}
                width={500}
                alt=""
                className="cursor-pointer lg:w-[3rem] lg:h-[3rem] md:h-[3rem] h-[2rem] md:w-[3rem] w-[2rem]"
              />
            </Link>
            <HiX
              className="text-3xl text-yellow-400 cursor-pointer"
              onClick={toggleDrawer}
            />
          </div>
          {/* Navigation items */}
          <div className="flex flex-col items-center gap-8 mt-8">
            {navItems.map((item, index) => (
              <Link
                href={item?.link}
                key={index}
                className="text-yellow-400 text-xl font-medium"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className="capitalize">{item.title}</span>
              </Link>
            ))}
          </div>
          <Link href={"/events"} className="w-[90vw] items-center justify-center flex ml-[5vw] mt-10">
            <button className="bg-yellow-400 rounded-lg px-[1rem] py-2 text-black-950 font-semibold w-full">
              Events
            </button>
          </Link>
          {/* Footer */}
          <div className="mt-auto mb-8 text-center text-white text-sm">
            <p>Made with 🤍 by Obcydians.</p>
            <p>© 2024 Obcyfest 3.0. All rights reserved.</p>
          </div>
        </div>
      )}
    </>
  );
}
