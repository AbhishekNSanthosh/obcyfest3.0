"use client";
import TitleBar from "@components/TitleBar";
import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

// Define the type for a FAQ item
interface Faq {
  question: string;
  answer: string;
}

const faqs: Faq[] = [
  {
    question: "What is Obcyfest?",
    answer:
      "Obcyfest is a tech fest organized by the Computer Science department, featuring workshops, competitions, and talks from industry experts.",
  },
  {
    question: "When will Obcyfest take place?",
    answer: "Obcyfest will be held from October 30 to November 5, 2024.",
  },
  {
    question: "How can I register for events?",
    answer:
      "You can register for events through our official website by filling out the registration form.",
  },
  {
    question: "Is there a participation fee?",
    answer:
      "Some events may have a participation fee, which will be mentioned during the registration process.",
  },
  {
    question: "Can I volunteer at Obcyfest?",
    answer:
      "Yes! We welcome volunteers to help us with organizing the events. Please reach out to us for more information.",
  },
];

export default function Faqs() {
  return (
    <div className="flex flex-col gap-8">
      <TitleBar title="Frequently Asked Questions" className="text-xl" />
      <div className="flex flex-col">
        {faqs.map((faq, index) => (
          <FaqItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}

// Define the props for the FaqItem component
interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mb-2 border-b text-gray-400">
      <div
        className="py-2 cursor-pointer  flex items-center justify-between"
        onClick={toggleOpen}
      >
        <span className="text-lg font-light text-gray-400">{question}</span>
        {isOpen ? (
          <IoIosArrowDown className="text-gray-400"/>
        ) : (
          <IoIosArrowUp className="text-gray-400" />
        )}
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-40" : "max-h-0"
        }`}
      >
        <p className="py-2 text-gray-400 text-sm">{answer}</p>
      </div>
    </div>
  );
}
