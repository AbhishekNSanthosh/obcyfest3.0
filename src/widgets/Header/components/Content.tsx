"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function HeaderContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navItems = [
    {
      title: "About",
      link: "",
    },
    {
      title: "FAQs",
      link: "",
    },
    {
      title: "Contact",
      link: "",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={`px-[5vw] min-h-[13vh] flex fixed w-full z-20 transition-all duration-300 ${isScrolled ? "backdrop-blur-lg" : "bg-transparent"}`}>
      <div className="flex flex-1 items-center justify-start">
        <Image src={'/logo/obcylogomain.svg'} height={500} width={500} alt="" className="cursor-pointer w-[3rem] h-[3rem]"/>
      </div>
      <div className="flex flex-1 items-center justify-center gap-[4vw]">
        <div className="flex flex-row gap-[4vw]">
          {navItems.map((item, index) => (
            <div key={index} className="py-1 relative cursor-pointer text-gray-200 font-medium after:absolute after:left-0 after:bottom-0 after:h-[4px] after:w-0 after:bg-yellow-400 after:transition-all after:duration-300 hover:after:w-full">
              <span className="capitalize">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-[4vw]">
        <button className="bg-yellow-400 rounded-lg px-[1rem] py-2 text-black-950 font-semibold">
          Events
        </button>
      </div>
    </div>
  );
}
