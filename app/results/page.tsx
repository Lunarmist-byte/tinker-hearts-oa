"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Lock, ChevronDown } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

type MatchResult = {
  id: string
  name: string
  class: string
  match_name: string
  match_class: string
  message?: string
}

export default function ResultsPage() {
  const [name, setName] = useState("")
  const [class_, setClass_] = useState("")
  const [result, setResult] = useState<MatchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")
  const [showScroll, setShowScroll] = useState(true)
  const [revealed, setRevealed] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setRevealed(false)

    if (!name.trim() || !class_.trim()) {
      setError("Please enter your name and class")
      return
    }

    setSearching(true)

    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from("match_results")
        .select("*")
        .eq("name", name.trim())
        .eq("class", class_.trim())
        .single()

      if (err) {
        if (err.code === "PGRST116") {
          setError("No match found. You may not have been paired this Valentine's Day, but your love story is just beginning!")
        } else {
          throw err
        }
      } else {
        setResult(data)
        // Trigger animation after a short delay
        setTimeout(() => setRevealed(true), 500)
      }
    } catch (err) {
      console.error("[v0] Error searching match:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 dark:from-rose-950/20 dark:via-purple-950/20 dark:to-pink-950/20 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-rose-300/10 dark:text-rose-400/5 animate-float"
            style={{
              left: `${(i * 6.7) % 100}%`,
              top: `${(i * 13.3) % 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${15 + i}s`,
              width: `${20 + (i % 5) * 10}px`,
              height: `${20 + (i % 5) * 10}px`,
            }}
            fill="currentColor"
          />
        ))}
      </div>

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Heartfelt Scroll Message */}
          {showScroll && (
            <div className="mb-12 space-y-6 animate-fade-in">
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Your Valentine's Destiny Awaits
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  On this beautiful Valentine's Day, we gathered hearts seeking connection. While not everyone found their match, remember: the journey of love is as beautiful as the destination.
                </p>
              </div>

              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-rose-200/30 dark:border-rose-800/30 space-y-4">
                <p className="text-center text-muted-foreground italic">
                  "Love is not always about finding someone perfect. It's about finding someone whose imperfections perfectly complement your own."
                </p>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowScroll(false)}
                    className="bg-gradient-to-r from-rose-400 to-pink-600 hover:from-rose-500 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-full"
                  >
                    <ChevronDown className="w-4 h-4 mr-2 animate-bounce" />
                    Reveal Your Match
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search Card */}
          {!showScroll && (
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-white/5 rounded-3xl shadow-2xl border-2 border-rose-200/50 dark:border-rose-800/50 p-8 animate-fade-in">
              <CardContent className="space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                    Find Your Match
                  </h2>
                  <p className="text-muted-foreground">
                    Enter your name and class to discover your Valentine's connection
                  </p>
                </div>

                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="h-12 text-lg border-2 border-rose-200/50 focus:border-rose-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class" className="text-base font-semibold">
                      Your Class
                    </Label>
                    <Input
                      id="class"
                      value={class_}
                      onChange={(e) => setClass_(e.target.value)}
                      placeholder="Enter your class"
                      className="h-12 text-lg border-2 border-rose-200/50 focus:border-rose-400"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-100 dark:bg-rose-900/20 rounded-lg text-rose-700 dark:text-rose-300 text-center">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={searching}
                    className="w-full h-12 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 hover:from-rose-500 hover:via-pink-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl"
                  >
                    {searching ? "Searching..." : "Reveal My Match"}
                  </Button>
                </form>

                {/* Match Result - Animated Reveal */}
                {result && revealed && (
                  <div className="mt-8 space-y-6 animate-fade-in">
                    <div className="flex justify-center gap-2 mb-4">
                      {[0, 1, 2].map((i) => (
                        <Heart
                          key={i}
                          className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>

                    <div className="bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-900/30 dark:to-purple-900/30 rounded-2xl p-8 border-2 border-rose-300/50 dark:border-rose-700/50 space-y-4">
                      <p className="text-center text-muted-foreground text-sm uppercase tracking-widest font-semibold">
                        Your Valentine's Destiny
                      </p>

                      <div className="text-center space-y-3">
                        <div className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                          {name}
                        </div>
                        <Heart className="w-10 h-10 mx-auto text-rose-500 fill-rose-500 animate-pulse" />
                        <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                          {result.match_name}
                        </div>
                      </div>

                      {result.message && (
                        <div className="mt-6 p-4 bg-white/50 dark:bg-white/10 rounded-lg text-center italic text-muted-foreground">
                          {result.message}
                        </div>
                      )}

                      <p className="text-center text-sm text-muted-foreground mt-6">
                        Congratulations! 💕 Your paths crossed for a reason.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <Link href="/" className="text-sm text-muted-foreground hover:text-rose-500 transition-colors">
                    Back to Tinker Hearts
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
