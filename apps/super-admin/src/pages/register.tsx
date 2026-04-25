import React, { useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import { Building2, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const planParam = params.get("plan") || "free"

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    mosqueName: "",
    country: "Bangladesh",
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // 2. Generate a Mosque ID (e.g., MSQ-BD-TIMESTAMP)
      const ts = Date.now().toString().slice(-6)
      const c = formData.country.slice(0, 2).toUpperCase()
      const mosqueId = `MSQ-${c}-${ts}`

      // 3. Create Mosque document in 'mosques' collection
      await setDoc(doc(db, "mosques", mosqueId), {
        id: mosqueId,
        name: formData.mosqueName,
        country: formData.country,
        city: "",
        timezone: "Asia/Dhaka", // Can be dynamic later
        plan: "free", // Default plan
        status: "active", // Active until billing is enforced
        screensCount: 1,
        adminId: user.uid,
        createdAt: new Date().toISOString(),
        prayerConfig: { method: "3" },
        themeSettings: { theme: "E", fsClock: 88, fsAdhan: 25 },
        orientation: "landscape",
        typography: {
          fontFamily: "'Inter', sans-serif",
          fsClock: 88, fsAdhan: 25, fsIq: 34, fsNm: 10, fsSlide: 14, fsAr: 28
        }
      })

      // 4. Create User document in 'users' collection linking to Mosque
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "MOSQUE_ADMIN",
        mosqueId: mosqueId,
        createdAt: new Date().toISOString(),
      })

      // 5. Redirect to checkout with plan and mosqueId (avoids AuthContext race condition)
      navigate(`/checkout?plan=${planParam}&mosqueId=${mosqueId}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <Building2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Mosque Account</h1>
          <p className="text-zinc-400 text-sm">Set up your digital display in minutes</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Mosque Name</label>
            <div className="relative">
              <Building2 className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                required
                value={formData.mosqueName}
                onChange={e => setFormData({...formData, mosqueName: e.target.value})}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="e.g. Baitul Mukarram"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="admin@mosque.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl mt-6 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
