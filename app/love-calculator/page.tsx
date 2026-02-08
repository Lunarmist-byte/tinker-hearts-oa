"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Sparkles } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

type LoveCalculation = {
  name1: string
  name2: string
  percentage: number
  timestamp: string
}

export default function LoveCalculatorPage() {
  const [name1, setName1] = useState("")
  const [name2, setName2] = useState("")
  const [lovePercentage, setLovePercentage] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculations, setCalculations] = useState<LoveCalculation[]>([])

  useEffect(() => {
    // Load calculations from localStorage
    const saved = localStorage.getItem("loveCalculations")
    if (saved) {
      setCalculations(JSON.parse(saved))
    }
  }, [])

  const generateLovePercentage = (n1: string, n2: string): number => {
    const combined = (n1 + n2).toLowerCase()
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash % 101)
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name1.trim() || !name2.trim()) return

    setIsCalculating(true)

    // Simulate calculation time
    setTimeout(() => {
      const percentage = generateLovePercentage(name1, name2)
      setLovePercentage(percentage)

      // Save to localStorage
      const newCalculation: LoveCalculation = {
        name1,
        name2,
        percentage,
        timestamp: new Date().toLocaleString(),
      }

      const updated = [newCalculation, ...calculations]
      setCalculations(updated)
      localStorage.setItem("loveCalculations", JSON.stringify(updated))

      setIsCalculating(false)
    }, 800)
  }

  const getLoveMessage = (percentage: number): string => {
    if (percentage >= 90) return "Soulmates! 💫"
    if (percentage >= 80) return "Deeply Connected 💕"
    if (percentage >= 70) return "Strong Bond 💗"
    if (percentage >= 60) return "Good Match 💖"
    if (percentage >= 50) return "Potential 💝"
    if (percentage >= 40) return "Promising 💞"
    if (percentage >= 30) return "Could Work 💓"
    if (percentage >= 20) return "Interesting 💗"
    if (percentage >= 10) return "Maybe... 💘"
    return "Keep Looking 💔"
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-200/20 dark:bg-rose-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Floating hearts */}
        {[...Array(15)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-rose-300/15 dark:text-rose-400/10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${12 + Math.random() * 8}s`,
              width: `${20 + Math.random() * 50}px`,
              height: `${20 + Math.random() * 50}px`,
            }}
            fill="currentColor"
          />
        ))}
      </div>

      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-rose-400 animate-pulse" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Love Calculator
            </h1>
            <Sparkles className="w-12 h-12 text-rose-400 animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground">Discover your compatibility magic ✨</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Calculator Card */}
          <div className="md:col-span-2">
            <div className="backdrop-blur-xl bg-background/80 rounded-3xl shadow-2xl border-2 border-rose-200/50 p-8 sticky top-8">
              <form onSubmit={handleCalculate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name1" className="text-lg font-semibold">
                    First Name
                  </Label>
                  <Input
                    id="name1"
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                    placeholder="Your name"
                    className="h-14 text-lg border-2 border-rose-200/50 focus:border-rose-400 text-center"
                  />
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-rose-200/30" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-background text-muted-foreground">
                      <Heart className="w-4 h-4 inline" />
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name2" className="text-lg font-semibold">
                    Second Name
                  </Label>
                  <Input
                    id="name2"
                    value={name2}
                    onChange={(e) => setName2(e.target.value)}
                    placeholder="Their name"
                    className="h-14 text-lg border-2 border-rose-200/50 focus:border-rose-400 text-center"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isCalculating || !name1.trim() || !name2.trim()}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 hover:from-rose-500 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isCalculating ? (
                    <>
                      <Sparkles className="mr-2 w-5 h-5 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      Calculate <Heart className="ml-2 w-5 h-5 fill-current" />
                    </>
                  )}
                </Button>
              </form>

              {/* Result Display */}
              {lovePercentage !== null && (
                <div className="mt-8 space-y-4 animate-in fade-in duration-500">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Your Love Match</p>
                    <div className="text-6xl font-bold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                      {lovePercentage}%
                    </div>
                    <p className="text-xl font-semibold text-rose-600 dark:text-rose-400">
                      {getLoveMessage(lovePercentage)}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="h-3 bg-rose-100 dark:bg-rose-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${lovePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground italic">
                    {name1} + {name2}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 space-y-3 text-center text-sm">
                <Link href="/" className="block text-muted-foreground hover:text-rose-500 transition-colors">
                  Back to Tinker Hearts
                </Link>
                <Link href="/admin" className="block text-muted-foreground hover:text-rose-500 transition-colors">
                  View All Calculations
                </Link>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="md:col-span-3">
            <div className="backdrop-blur-xl bg-background/80 rounded-3xl shadow-2xl border-2 border-rose-200/50 p-8">
              <h2 className="text-2xl font-bold mb-6 text-rose-600 dark:text-rose-400">Recent Searches</h2>

              {calculations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Start calculating to see your love matches here...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {calculations.map((calc, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-950 dark:to-purple-950 rounded-xl border border-rose-200/50 dark:border-rose-800/50 hover:border-rose-400 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-rose-900 dark:text-rose-100">
                            {calc.name1} <span className="text-rose-400">❤️</span> {calc.name2}
                          </p>
                          <p className="text-xs text-muted-foreground">{calc.timestamp}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                            {calc.percentage}%
                          </p>
                          <p className="text-xs text-rose-600 dark:text-rose-400">{getLoveMessage(calc.percentage)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Made with <span className="text-rose-500">❤️</span> by Aswin, Amal & his <span className="text-rose-500">❤️</span></p>
        </div>
      </div>
    </div>
  )
}
