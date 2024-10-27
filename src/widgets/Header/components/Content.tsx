"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiMenuAlt2 } from "react-icons/hi";

export default function HeaderContent() {
  const [isScrolled, setIsScrolled] = useState(false);
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
    // {
    //   title: "Community Partners",
    //   link: "",
    // },
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

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`px-[5vw] min-h-[10vh] md:min-h-[13vh] lg:min-h-[13vh] flex w-full fixed top-0 z-20 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-lg fixed" : "bg-transparent"
      }`}
    >
      <div className="flex flex-1 items-center justify-start">
        <Link href={"/"}>
          <Image
            src={"/logo/obcylogomain.svg"}
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
        <HiMenuAlt2 className="text-3xl text-yellow-400"/>
      </div>
    </div>
  );
}
