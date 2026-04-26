import React, { useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import { Building2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const planParam = params.get("plan") || "free"

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    mosqueName: "",
    city: "",
    country: "Bangladesh",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      const ts = Date.now().toString().slice(-6)
      const c = formData.country.slice(0, 2).toUpperCase()
      const mosqueId = `MSQ-${c}-${ts}`

      await setDoc(doc(db, "mosques", mosqueId), {
        id: mosqueId,
        name: formData.mosqueName,
        country: formData.country,
        city: formData.city,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        plan: planParam,
        status: "active",
        screensCount: 1,
        adminId: user.uid,
        adminEmail: user.email,
        createdAt: new Date().toISOString(),
        prayerConfig: { method: "3" },
        themeSettings: { tvDesign: "E", fsClock: 88, fsAdhan: 25 },
        orientation: "landscape",
        displayLang: "en",
        typography: {
          fontFamily: "'Inter', sans-serif",
          fsClock: 88, fsAdhan: 25, fsIq: 34, fsNm: 10, fsSlide: 14, fsAr: 28
        },
        slideConfig: {
          showQuran: "1", showHadith: "1", showAnn: "1", showClean: "1",
          showDars: "0", showCommunity: "0", slideDur: "10"
        },
        contentItems: [],
        annItems: [],
      })

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "MOSQUE_ADMIN",
        mosqueId: mosqueId,
        createdAt: new Date().toISOString(),
      })

      if (planParam === "free") {
        navigate("/dashboard")
      } else {
        navigate(`/checkout?plan=${planParam}&mosqueId=${mosqueId}`)
      }
    } catch (err: any) {
      console.error(err)
      const code = err?.code || ""
      const friendlyErrors: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered. Try logging in instead.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password is too weak. Use at least 6 characters.",
        "auth/network-request-failed": "Network error. Please check your internet connection.",
        "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
      }
      setError(friendlyErrors[code] || "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative selection:bg-primary selection:text-primary-foreground p-4">
      <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-4">
        <ModeToggle />
      </div>

      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

      <Card className="w-full max-w-md z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-card/95 animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Set up your mosque's digital display in minutes
            {planParam !== "free" && (
              <span className="block mt-1 text-primary font-medium capitalize">
                Selected plan: {planParam}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/15 border border-destructive/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mosqueName">Mosque Name</Label>
              <Input
                id="mosqueName"
                required
                value={formData.mosqueName}
                onChange={e => setFormData({...formData, mosqueName: e.target.value})}
                className="bg-background/50 focus-visible:ring-primary"
                placeholder="e.g. Baitul Mukarram"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-muted-foreground font-normal">(for prayer times)</span></Label>
              <Input
                id="city"
                required
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className="bg-background/50 focus-visible:ring-primary"
                placeholder="e.g. Dhaka, London, Rome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="bg-background/50 focus-visible:ring-primary"
                placeholder="admin@mosque.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="bg-background/50 focus-visible:ring-primary"
                  placeholder="Min 6 chars"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="bg-background/50 focus-visible:ring-primary"
                  placeholder="Repeat password"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={loading} className="w-full text-md h-11 font-semibold transition-transform active:scale-[0.98]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Create Account
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
