import Image from "next/image";
import React from "react";

export default function FooterContent() {
  return (
    <footer className="p-[2vw] w-full bg-black-950 text-gray-100">
      <div className="w-full p-10 bg-yellow-400 rounded-md flex flex-col justify-between items-center gap-5">
        
        {/* Logo Section */}
        <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-col items-center md:items-start">
          <Image src={'/logo/black.svg'} height={1000} width={1000} alt="Obcyfest Logo" className="w-[200px] mb-4"/>
          <p className="text-black-950 text-sm md:text-base font-medium">Celebrating Innovation and Tech at Obcyfest 3.0</p>
        </div>

        {/* Quick Links Section */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-800">
            <li><a href="#about" className="hover:text-black transition-colors">About Us</a></li>
            <li><a href="#faqs" className="hover:text-black transition-colors">FAQs</a></li>
            <li><a href="#events" className="hover:text-black transition-colors">Events</a></li>
            <li><a href="#contact" className="hover:text-black transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h3>
          <p className="text-sm text-gray-800">
            Cochin College of Engineering and Technology,<br />
            Kerala, India<br />
            <a href="mailto:contact@obcyfest.com" className="hover:text-black transition-colors">contact@obcyfest.com</a>
          </p>
        </div>

        {/* Social Media Links */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:scale-110 transition-transform">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-yellow-400 font-bold">F</div>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:scale-110 transition-transform">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-yellow-400 font-bold">T</div>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:scale-110 transition-transform">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-yellow-400 font-bold">I</div>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:scale-110 transition-transform">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-yellow-400 font-bold">L</div>
            </a>
          </div>
        </div>
        </div>
              {/* Bottom Footer Text */}
              <div className="h-[1px] w-[100%] bg-gray-600 mt-3"></div>
      <div className="flex justify-center items-center mt-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} Obcyfest 3.0. All rights reserved.
      </div>
      </div>


    </footer>
  );
}
