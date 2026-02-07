"use client"

import type React from "react"

import { useState } from "react"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("tinker_hearts_submissions").insert({
        name: formData.name,
        gender: formData.gender,
        target_gender: formData.targetGender,
        pickup_line: formData.pickupLine,
        class: formData.class,
      })

      if (error) throw error
      setSuccess(true)
      setFormData({
        name: "",
        gender: "",
        targetGender: "",
        pickupLine: "",
        class: "",
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error submitting:", error)
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
        {[...Array(20)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-rose-300/20 dark:text-rose-400/10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
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

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-background/80 rounded-3xl shadow-2xl border-2 border-rose-200/50 p-8">
          {success && (
            <div className="mb-6 p-4 bg-rose-100 border border-rose-300 rounded-lg text-rose-800 text-center font-medium">
              Your heart has been shared! 💕
            </div>
          )}

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
          <div className="mt-8 flex items-center justify-center gap-4 text-center flex-wrap">
            <Link href="/love-calculator" className="text-sm text-muted-foreground hover:text-rose-500 transition-colors">
              Love Calculator
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-rose-500 transition-colors">
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
