import React from 'react'

export default function LandingPageView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br bg-black-100 text-white text-center px-6">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-red-500">
          Obcyfest 3.0
        </h1>
        <p className="text-lg md:text-2xl text-green-400">
          Organized by the OBCYDIANS, Department of Computer Science and Engineering, CCET
        </p>
      </div>

      <div className="mt-12 space-y-4">
        <p className="text-2xl md:text-4xl font-semibold text-gray-200">
          You're at the right place,
        </p>
        <p className="text-2xl md:text-4xl font-semibold text-white animate-pulse">
          but the wrong time!
        </p>
      </div>

      <footer className="absolute bottom-6 text-sm text-gray-400">
        This site is currently under development. Stay tuned!
      </footer>
    </div>
  )
}
