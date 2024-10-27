import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function FooterContent() {
  const navItems = [
    { title: "About", link: "" },
    { title: "FAQs", link: "" },
    { title: "Events", link: "" },
    { title: "Contact", link: "" },
  ];

  return (
    <footer className="md:p-[2vw] lg:p-[2vw] p-[4vw] w-full bg-black-950">
      <div className="w-full md:p-10 lg:p-10 p-5 bg-yellow-400 rounded-md flex flex-col justify-start items-center gap-5">
        {/* Logo Section */}
        <div className="flex w-full md:flex-row lg:flex-row flex-col gap-10 md:gap-0 lg:gap-0 items-start justify-between">
          <div className="flex flex-col items-start md:items-start flex-[2]">
            <Image
              src={"/logo/black.svg"}
              height={1000}
              width={1000}
              alt="Obcyfest Logo"
              className="w-[200px] mb-4"
            />
            <p className="text-black-950 text-sm md:text-base font-medium">
              Celebrating Innovation and Tech at Obcyfest 3.0
            </p>
            <p className="text-sm text-gray-800">
              Join us in celebrating the spirit of innovation and technology. Be
              the first to know about our upcoming events, workshops, and more!
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="flex flex-col items-center md:items-start flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Quick Links
            </h3>
            <ul className="md:space-y-2 lg:space-y-2 space-y-0 text-sm text-gray-800">
              {navItems.map((item, index) => (
                <li key={index}>
                  {"->"}{" "}
                  <a
                    href={`${item.link}`}
                    className="hover:text-black transition-colors"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col items-start md:items-start justify-start flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Contact Us
            </h3>
            <p className="text-sm text-gray-800">
              Carmel College of Engineering and Technology,
              <br />
              Punnapra | Alappuzha-688004, Kerala
              <br />
            </p>
            <Link
              href="mailto:obcyfest@carmelcet.in"
              className="hover:text-black-950 text-gray-800 transition-colors mt-4"
            >
              obcyfest@carmelcet.in
            </Link>
            <Link
              href="https://wa.me/+917907247909" target="_blank"
              className="hover:text-black-950 text-gray-800 transition-colors mt-4"
            >
             +91 7907247909
            </Link>
          </div>
        </div>

        {/* Bottom Footer Text */}
        <div className="h-[0.5px] w-[100%] bg-black-950 mt-5"></div>
        <div className="flex justify-between items-center md:flex-row lg:flex-row flex-col mt-4 text-black-950 text-sm w-full gap-2">
          <div className="">
            Made with 🖤 by Obcydians.
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} Obcyfest 3.0. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
