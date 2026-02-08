'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <Link href="https://tinkerhub.org/events/V3AFAR17E1/tink-her-hack-4.0" target="_blank" rel="noopener noreferrer">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm cursor-pointer group">
        <div className="relative w-full h-full max-w-2xl max-h-2xl flex items-center justify-center p-4 animate-fade-in">
          <Image
            src="/tink-her-hack-splash.jpg"
            alt="Tink Her Hack 4.0 - TinkerHub CEMP"
            fill
            priority
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-70 px-4 py-2 rounded-lg">
              Click to register for Tink Her Hack 4.0
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
