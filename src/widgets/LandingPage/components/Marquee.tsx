import React from 'react';

export default function Marquee() {
  return (
    <div className="bg-yellow-400 text-black-950 overflow-hidden mt-[10vh] py-[3vh] mb-[5vh]">
      <div className="marquee">
        <div className="marquee-content">
          {/* Original items */}
          <span className="item uppercase font-semibold">obcydians ccet</span>
          <span className="item uppercase font-semibold">department of computer science & technology</span>
          <span className="item uppercase font-semibold">obcyfest 3.0</span>

          {/* Duplicate items for continuous effect */}
          <span className="item uppercase font-semibold">obcydians ccet</span>
          <span className="item uppercase font-semibold">department of computer science & technology</span>
          <span className="item uppercase font-semibold">obcyfest 3.0</span>
        </div>
      </div>
    </div>
  );
}
