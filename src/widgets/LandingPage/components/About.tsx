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
        "Carmel College of Engineering & Technology (CCET), Punnapra, Alappuzha, is a premier institution founded in 2014-15 by the St. Joseph’s Carmel Educational & Charitable Trust of CMI. As a self-financing college approved by AICTE and affiliated with APJ Abdul Kalam Technological University, CCET provides accessible, quality engineering education. In addition to academics, CCET promotes all-round development through extracurricular activities and a dedicated placement cell, shaping socially responsible engineers for a positive impact.",
    },
    {
      title: "About OBCYDIANS",
      img: "/logo/dep.webp",
      content:
        "Obcydians is the dynamic team representing the Department of Computer Science and Engineering at Carmel College of Engineering & Technology (CCET). Comprising of talented students and dedicated faculty, Obcydians fosters innovation, technical excellence, and collaborative growth in computer science. Through workshops, hackathons, and seminars, the team provides a platform for students to explore emerging technologies and gain practical experience, preparing them to make meaningful contributions to the tech industry.",
    },
    {
      title: "About OBCYFEST",
      img: "/logo/obcydians.svg",
      content:
        "ObcyFest is the annual mini-tech fest organized by the Department of Computer Science and Engineering at Carmel College of Engineering & Technology (CCET). Designed to inspire and engage students, ObcyFest features a variety of events, including coding competitions, workshops, fun activities and games. It provides a platform for students to demonstrate their technical skills, collaborate with peers, and explore emerging technologies. ObcyFest nurtures creativity, fosters teamwork, and enhances the learning experience, making it a highlight of the academic calendar for CSE students.",
    },
  ];

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex px-[5vw] flex-col w-full gap-5 h-auto md:py-[15vh] lg:py-[15vh] py-[8vh]">
     <TitleBar title="About us" className="text-3xl capitalize font-semibold text-yellow-400"/>
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
        <div className="w-[1px] h-[90%] bg-yellow-400 hidden md:flex lg:flex"></div>
        {/* Right Column - Content */}
        <div className="flex-1 p-4 items-center justify-center w-full hidden md:flex lg:flex">
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
