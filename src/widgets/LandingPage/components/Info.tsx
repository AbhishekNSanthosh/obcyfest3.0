import React from 'react'
import Faqs from './Faqs'
import Community from './Community'

export default function Info() {
  return (
    <div className='px-[5vw] md:py-[15vh] lg:py-[15vh] py-[5vh] flex md:flex-row lg:flex-row flex-col items-start justify-between gap-[4vw]'>
      <div className="flex-1 w-full">
        <Faqs />
      </div>
      <div className="w-[0.3px] bg-yellow-400 h-[50vh] hidden md:flex lg:flex"></div> {/* Adjusted height */}
      <div className="flex-1 mt-10 md:mt-0 lg:mt-0">
        <Community />
      </div>
    </div>
  )
}
