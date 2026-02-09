"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Download, Lock, Trash2, Sparkles } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

type Submission = {
  id: string
  name: string
  gender: string
  target_gender: string
  pickup_line: string
  class: string
  created_at: string
}

type LoveCalculation = {
  name1: string
  name2: string
  percentage: number
  timestamp: string
}

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loveCalculations, setLoveCalculations] = useState<LoveCalculation[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"hearts" | "love">("hearts")

  const ADMIN_PASSWORD = "kukudukozhi@2022"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError("")
      loadSubmissions()
      loadLoveCalculations()
    } else {
      setError("Incorrect password")
    }
  }

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("tinker_hearts_submissions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (err) {
      console.error("Error loading submissions:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadLoveCalculations = () => {
    try {
      const saved = localStorage.getItem("loveCalculations")
      if (saved) {
        setLoveCalculations(JSON.parse(saved))
      }
    } catch (err) {
      console.error("Error loading love calculations:", err)
    }
  }

  const downloadCSV = () => {
    const headers = ["Name", "Gender", "Target Gender", "Pickup Line/Feeling", "Class", "Submitted At"]

    const rows = submissions.map((sub) => [
      sub.name,
      sub.gender,
      sub.target_gender,
      sub.pickup_line.replace(/"/g, '""'), // Escape quotes
      sub.class,
      new Date(sub.created_at).toLocaleString(),
    ])

    // Create CSV with proper escaping
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // Add BOM for Excel compatibility
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })

    // Create download link
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `tinker_hearts_${new Date().toISOString().split("T")[0]}.csv`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  }

  const deleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return

    setDeleting(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("tinker_hearts_submissions").delete().eq("id", id)

      if (error) throw error

      setSubmissions((prev) => prev.filter((sub) => sub.id !== id))
    } catch (err) {
      console.error("Error deleting submission:", err)
      alert("Failed to delete submission")
    } finally {
      setDeleting(null)
    }
  }

  const deleteAllSubmissions = async () => {
    if (!confirm("Are you sure you want to DELETE ALL submissions? This cannot be undone!")) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("tinker_hearts_submissions")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")

      if (error) throw error

      setSubmissions([])
      alert("All submissions deleted successfully")
    } catch (err) {
      console.error("Error deleting all submissions:", err)
      alert("Failed to delete all submissions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        loadSubmissions()
        loadLoveCalculations()
      }, 30000) // Refresh every 30s
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        {/* Background hearts */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <Heart
              key={i}
              className="absolute text-rose-300/10 dark:text-rose-400/5 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
                width: `${30 + Math.random() * 50}px`,
                height: `${30 + Math.random() * 50}px`,
              }}
              fill="currentColor"
            />
          ))}
        </div>

        <Card className="w-full max-w-md relative z-10 border-2 border-rose-200/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full">
                <Lock className="w-8 h-8 text-rose-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </CardTitle>
            <p className="text-muted-foreground">Enter password to access submissions</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="h-12 border-2 border-rose-200/50 focus:border-rose-400"
                />
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 hover:from-rose-500 hover:via-pink-600 hover:to-purple-700"
              >
                <Lock className="mr-2 w-4 h-4" />
                Unlock
              </Button>
              <div className="text-center pt-4">
                <Link href="/" className="text-sm text-muted-foreground hover:text-rose-500 transition-colors">
                  Back to Home
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {activeTab === "hearts" ? (
              <Heart className="w-8 h-8 text-rose-400 fill-rose-400" />
            ) : (
              <Sparkles className="w-8 h-8 text-rose-400" />
            )}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              {activeTab === "hearts" ? "Tinker Hearts Admin" : "Love Calculator Admin"}
            </h1>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <Button
              onClick={() => {
                loadSubmissions()
                loadLoveCalculations()
              }}
              disabled={loading}
              variant="outline"
              className="border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 bg-transparent"
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
            {activeTab === "hearts" && (
              <>
                <Button
                  onClick={downloadCSV}
                  disabled={submissions.length === 0}
                  className="bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 hover:from-rose-500 hover:via-pink-600 hover:to-purple-700"
                >
                  <Download className="mr-2 w-4 h-4" />
                  Download CSV
                </Button>
                <Button
                  onClick={deleteAllSubmissions}
                  disabled={submissions.length === 0 || loading}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  Delete All
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-rose-200/50">
          <button
            onClick={() => setActiveTab("hearts")}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === "hearts"
                ? "text-rose-600 dark:text-rose-400 border-b-2 border-rose-400"
                : "text-muted-foreground hover:text-rose-500"
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Tinker Hearts ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab("love")}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === "love"
                ? "text-rose-600 dark:text-rose-400 border-b-2 border-rose-400"
                : "text-muted-foreground hover:text-rose-500"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Love Calculator ({loveCalculations.length})
          </button>
        </div>

        {/* Stats */}
        {activeTab === "hearts" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-rose-200/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-rose-600">{submissions.length}</p>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-rose-200/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-pink-600">
                    {
                      submissions.filter((s) => new Date(s.created_at).toDateString() === new Date().toDateString())
                        .length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-rose-200/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{new Set(submissions.map((s) => s.class)).size}</p>
                  <p className="text-sm text-muted-foreground">Unique Classes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="border-rose-200/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-rose-600">{loveCalculations.length}</p>
                  <p className="text-sm text-muted-foreground">Total Calculations</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-rose-200/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {loveCalculations.length > 0
                      ? (
                          loveCalculations.reduce((sum, c) => sum + c.percentage, 0) / loveCalculations.length
                        ).toFixed(1)
                      : "0"}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">Average Love Match</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content */}
        {activeTab === "hearts" ? (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <Card className="border-rose-200/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No submissions yet. Hearts will appear here!
                </CardContent>
              </Card>
            ) : (
              submissions.map((sub) => (
                <Card key={sub.id} className="border-rose-200/50 hover:border-rose-300 transition-colors">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-semibold text-lg">{sub.name}</p>
                        </div>
                        <div className="flex gap-6">
                          <div>
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-medium capitalize">{sub.gender}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Looking For</p>
                            <p className="font-medium capitalize">{sub.target_gender}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Class</p>
                          <p className="font-medium">{sub.class}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Pickup Line / Feeling</p>
                          <p className="font-medium text-rose-700 dark:text-rose-300 italic bg-rose-50 dark:bg-rose-950 p-3 rounded-lg border border-rose-200 dark:border-rose-800">
                            {sub.pickup_line}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Submitted</p>
                            <p className="text-sm">{new Date(sub.created_at).toLocaleString()}</p>
                          </div>
                          <Button
                            onClick={() => deleteSubmission(sub.id)}
                            disabled={deleting === sub.id}
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {deleting === sub.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loveCalculations.length === 0 ? (
              <Card className="border-rose-200/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No love calculations yet. Start calculating matches!
                </CardContent>
              </Card>
            ) : (
              loveCalculations.map((calc, index) => (
                <Card key={index} className="border-rose-200/50 hover:border-rose-300 transition-colors">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">First Name</p>
                          <p className="font-semibold text-lg">{calc.name1}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Second Name</p>
                          <p className="font-semibold text-lg">{calc.name2}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Love Match</p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                              {calc.percentage}%
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Calculated At</p>
                          <p className="text-sm">{calc.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-rose-500 transition-colors">
            Back to Tinker Hearts
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href="/love-calculator" className="text-muted-foreground hover:text-rose-500 transition-colors">
            Love Calculator
          </Link>
        </div>
      </div>
    </div>
  )
}
