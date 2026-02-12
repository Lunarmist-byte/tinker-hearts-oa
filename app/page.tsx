"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    targetGender: "",
    pickupLine: "",
    class: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [hearts, setHearts] = useState<Array<{ id: number; left: number; top: number; delay: number; duration: number; width: number; height: number }>>([])

  useEffect(() => {
    // Generate random hearts only on client side to avoid hydration mismatch
    const generatedHearts = [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      width: 20 + Math.random() * 40,
      height: 20 + Math.random() * 40,
    }))
    setHearts(generatedHearts)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    if (!formData.name.trim() || !formData.gender || !formData.targetGender || !formData.pickupLine.trim() || !formData.class.trim()) {
      console.error("[v0] Form validation failed: missing required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      console.log("[v0] Submitting form data:", { ...formData })
      
      const { error } = await supabase.from("tinker_hearts_submissions").insert({
        name: formData.name.trim(),
        gender: formData.gender,
        target_gender: formData.targetGender,
        pickup_line: formData.pickupLine.trim(),
        class: formData.class.trim(),
      })

      if (error) {
        console.error("[v0] Supabase error:", error)
        throw error
      }
      
      console.log("[v0] Form submitted successfully")
      setSuccess(true)
      setFormData({
        name: "",
        gender: "",
        targetGender: "",
        pickupLine: "",
        class: "",
      })
    } catch (error) {
      console.error("[v0] Error submitting form:", error instanceof Error ? error.message : String(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background hearts animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {hearts.map((heart) => (
          <Heart
            key={heart.id}
            className="absolute text-rose-300/20 dark:text-rose-400/10 animate-float"
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              width: `${heart.width}px`,
              height: `${heart.height}px`,
            }}
            fill="currentColor"
          />
        ))}
      </div>

      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-rose-400 fill-rose-400 animate-pulse" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Tinker Hearts
            </h1>
            <Heart className="w-12 h-12 text-rose-400 fill-rose-400 animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground">Share your feelings, make a connection</p>
        </div>

        {/* Success Modal */}
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="w-full max-w-md animate-fade-in">
              <div className="backdrop-blur-xl bg-background/95 rounded-3xl shadow-2xl border-2 border-rose-200/50 p-8 text-center space-y-6">
                {/* Animated Hearts */}
                <div className="flex justify-center gap-3 mb-4">
                  {[0, 1, 2].map((i) => (
                    <Heart
                      key={i}
                      className="w-12 h-12 text-rose-400 fill-rose-400 animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                    Your Heart Has Been Shared!
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Your feelings are now locked in safe hands
                  </p>
                </div>

                <div className="bg-gradient-to-r from-rose-100 to-purple-100 dark:from-rose-950 dark:to-purple-950 rounded-2xl p-6 border border-rose-200/50 dark:border-rose-800/50">
                  <p className="text-sm text-muted-foreground mb-2">Wait for</p>
                  <p className="text-4xl font-bold text-rose-600 dark:text-rose-400">
                    14th February 12:00 AM
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">for the magical results</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    On Valentine's Day, we'll reveal all the perfect matches and connections made through Tinker Hearts 💑
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    Cupid is working behind the scenes!
                  </p>
                </div>

                <Button
                  onClick={() => setSuccess(false)}
                  className="w-full h-12 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 hover:from-rose-500 hover:via-pink-600 hover:to-purple-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-background/80 rounded-3xl shadow-2xl border-2 border-rose-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-semibold">
                Your Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                required
                className="h-12 border-2 border-rose-200/50 focus:border-rose-400"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-lg font-semibold">
                Your Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <SelectTrigger className="h-12 border-2 border-rose-200/50 focus:border-rose-400">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-Binary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Gender */}
            <div className="space-y-2">
              <Label htmlFor="targetGender" className="text-lg font-semibold">
                Looking For
              </Label>
              <Select
                value={formData.targetGender}
                onValueChange={(value) => setFormData({ ...formData, targetGender: value })}
                required
              >
                <SelectTrigger className="h-12 border-2 border-rose-200/50 focus:border-rose-400">
                  <SelectValue placeholder="Select target gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-Binary</SelectItem>
                  <SelectItem value="endhelum-madhi">Endhelum Madhi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pickup Line / Feeling */}
            <div className="space-y-2">
              <Label htmlFor="pickupLine" className="text-lg font-semibold">
                Your Pickup Line / Feeling
              </Label>
              <Textarea
                id="pickupLine"
                value={formData.pickupLine}
                onChange={(e) => setFormData({ ...formData, pickupLine: e.target.value })}
                placeholder="Share your heart..."
                required
                rows={4}
                className="border-2 border-rose-200/50 focus:border-rose-400 resize-none"
              />
            </div>

            {/* Class */}
            <div className="space-y-2">
              <Label htmlFor="class" className="text-lg font-semibold">
                Your Class
              </Label>
              <Input
                id="class"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="e.g., CS 2024, ECE 2025"
                required
                className="h-12 border-2 border-rose-200/50 focus:border-rose-400"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 hover:from-rose-500 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                "Sending Love..."
              ) : (
                <>
                  Share Your Heart <Heart className="ml-2 w-5 h-5 fill-current" />
                </>
              )}
            </Button>
          </form>

          {/* Navigation Links */}
          <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
            <Link 
              href="/love-calculator" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              💕 Find Your Love Match 💕
            </Link>
            <span className="text-muted-foreground text-xl">•</span>
            <Link href="/results" className="text-base text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-semibold">
              Results
            </Link>
            <span className="text-muted-foreground text-xl">•</span>
            <Link href="/admin" className="text-base text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-semibold">
              Admin
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Made with <span className="text-rose-500">❤️</span> at Ippozhe enkilum penne kittateey</p>
        </div>
      </div>
    </div>
  )
}
