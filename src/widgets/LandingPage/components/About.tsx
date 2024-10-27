"use client";
import TitleBar from "@components/TitleBar";
import Image from "next/image";
import React, { useState } from "react";

export default function About() {
  const aboutus = [
    {
      title: "About CCET",
      img: "/logo/carmel.png",
      content:
        "By spreading ideas worthy enough to be shared, the power of inspiration and change is created. A global community striving towards spreading ideas from every discipline and culture, that is TED in a nutshell. It is a non-profit organisation that helps people get the deeper meaning of ideas, attitudes and the world itself. From its origin in 1984, TED talks have touched people’s hearts. It continues to be watched all around the world. The impact a TED event creates is unmatched. TED conferences and events inspire and motivate people towards becoming a better version of themselves.",
    },
    {
      title: "About Department of CSE",
      img: "/logo/dep.webp",
      content:
        "By spreading ideas worthy enough to be shared, the power of inspiration and change is created. A global community striving towards spreading ideas from every discipline and culture, that is TED in a nutshell. It is a non-profit organisation that helps people get the deeper meaning of ideas, attitudes and the world itself. From its origin in 1984, TED talks have touched people’s hearts. It continues to be watched all around the world. The impact a TED event creates is unmatched. TED conferences and events inspire and motivate people towards becoming a better version of themselves.",
    },
    {
      title: "About OBCYDIANS",
      img: "/logo/obcydians.svg",
      content:
        "By spreading ideas worthy enough to be shared, the power of inspiration and change is created. A global community striving towards spreading ideas from every discipline and culture, that is TED in a nutshell. It is a non-profit organisation that helps people get the deeper meaning of ideas, attitudes and the world itself. From its origin in 1984, TED talks have touched people’s hearts. It continues to be watched all around the world. The impact a TED event creates is unmatched. TED conferences and events inspire and motivate people towards becoming a better version of themselves.",
    },
  ];

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex px-[5vw] flex-col w-full gap-5 h-auto py-[15vh]">
     <TitleBar title="About us" className="text-3xl capitalize font-semibold"/>
      <div className="flex">
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            {aboutus.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`text-left p-4 transition-colors duration-200 ${
                  activeTab === index
                    ? "bg-yellow-400 text-black-950"
                    : "bg-transparent text-gray-500"
                }`}
              >
                {item.title}
              </button>
            ))}
            <div className="flex flex-col gap-3 mt-5">
              <h2 className="text-2xl font-bold">{aboutus[activeTab].title}</h2>
              <p className="mt-2 text-gray-500">{aboutus[activeTab].content}</p>
            </div>
          </div>
        </div>
        <div className="w-[1px] h-[90%] bg-yellow-400"></div>
        {/* Right Column - Content */}
        <div className="flex-1 p-4 flex items-center justify-center w-full">
          <Image
            src={aboutus[activeTab].img}
            alt="About Image"
            width={1500}
            height={1500}
            className="w-[20rem] h-[20rem]"
          />
        </div>
      </div>
    </div>
  );
}
