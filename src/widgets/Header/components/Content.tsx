import Image from "next/image";
import React from "react";

export default function HeaderContent() {
  const navItems = [
    {
      title: "about",
      link: "",
    },
    {
      title: "faqs",
      link: "",
    },
    {
        title: "Contact",
        link: "",
      },
  ];

  return (
    <div className="px-[5vw] min-h-[13vh] flex">
      <div className="flex flex-1 items-center justify-start">
        <Image src={'/logo/logo1.svg'} height={500} width={500} alt="" className="cursor-pointer w-[3rem] h-[3rem]"/>
        {/* <span className="text-yellow-400 font-extrabold text-4xl logo">
          OBCYFEST 3.0
        </span> */}
      </div>
      <div className="flex flex-1 items-center justify-end gap-[4vw]">
        <div className="flex flex-row gap-[4vw]">
          {navItems?.map((item, index) => (
            <div className="py-1 relative cursor-pointer text-gray-200 font-medium after:absolute after:left-0 after:bottom-0 after:h-[4px] after:w-0 after:bg-yellow-400 after:transition-all after:duration-300 hover:after:w-full">
              <span key={index} className="capitalize">
                {item?.title}
              </span>
            </div>
          ))}
        </div>
        <button className="bg-yellow-400 rounded-lg px-[1rem] py-2 text-black-950 font-semibold">
          Events
        </button>
      </div>
    </div>
  );
}
