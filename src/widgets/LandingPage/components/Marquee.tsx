import { eventName } from '@utils/constants';
import React from 'react';

export default function Marquee({ speed = 10 }) {  // pass speed in seconds
  return (
    <div className="bg-yellow-400 text-black-950 mt-[10vh] py-[3vh] mb-[5vh] overflow-hidden">
      <div >
        <div
          className="marquee-content flex whitespace-nowrap"
          style={{ animation: `marquee ${speed}s linear infinite` }}
        >
          <span className="item uppercase font-semibold mx-8">obcydians ccet</span>
          <span className="item uppercase font-semibold mx-8">department of computer science & technology</span>
          <span className="item uppercase font-semibold mx-8">{eventName}</span>

          {/* Duplicates for seamless scroll */}
          <span className="item uppercase font-semibold mx-8">obcydians ccet</span>
          <span className="item uppercase font-semibold mx-8">department of computer science & technology</span>
          <span className="item uppercase font-semibold mx-8">{eventName}</span>
        </div>
      </div>
    </div>
  );
}
