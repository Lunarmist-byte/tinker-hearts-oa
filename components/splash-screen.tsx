'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-purple-500/20 backdrop-blur-md">
      <div className="text-center space-y-6 px-4 animate-fade-in">
        <div className="flex justify-center gap-3 mb-4">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className="w-12 h-12 text-rose-500 fill-rose-500 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Thank You!
          </h1>
          
          <p className="text-2xl font-semibold text-rose-700 dark:text-rose-300">
            Thank you for making Tink Her Hack and Tinker Hearts a success
          </p>
          
          <p className="text-lg text-rose-600 dark:text-rose-400">
            With love, TinkerHub CEMP Team
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {[...Array(5)].map((_, i) => (
            <Heart
              key={i}
              className="w-6 h-6 text-rose-400 fill-rose-400 animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
