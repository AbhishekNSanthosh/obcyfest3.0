import React from 'react'
import Faqs from './Faqs'
import Community from './Community'

export default function Info() {
  return (
    <div className='px-[5vw] py-[15vh] flex flex-row items-start justify-between gap-[4vw]'>
      <div className="flex-1 w-full">
        <Faqs />
      </div>
      <div className="w-[0.3px] bg-yellow-400 h-[50vh]"></div> {/* Adjusted height */}
      <div className="flex-1">
        <Community />
      </div>
    </div>
  )
}
