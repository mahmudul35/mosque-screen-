import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuth } from "../contexts/auth"
import type { Plan } from "./plans"

import { Button } from "@/components/ui/button"
import { MonitorPlay, Settings, Calendar, Smartphone, ChevronRight, CheckCircle2, ShieldCheck, Play } from "lucide-react"

export function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const { user, role, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "plans"), (snap) => {
      const data: Plan[] = []
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as Plan))
      setPlans(data.filter(p => p.isActive).sort((a, b) => a.order - b.order))
    })
    return () => unsub()
  }, [])

  return (
    <div className="min-h-screen bg-[#05070f] text-white selection:bg-emerald-500/30 font-sans">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#05070f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <MonitorPlay className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Mosque SaaS</span>
          </div>
          
          <div className="flex items-center gap-4">
            {!loading && user ? (
              <Button onClick={() => navigate("/dashboard")} className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 font-medium">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4">Log in</Link>
                <Button onClick={() => navigate("/register")} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 font-medium border border-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  Start Free Trial
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Modernize Your Mosque Display Today
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-8 leading-[1.1]">
              The Ultimate Digital Display System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Smart Mosques</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Automated prayer times, stunning Islamic themes, dynamic announcements, and effortless 6-digit screen pairing. All managed from the cloud.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => navigate("/register")} className="h-14 px-8 text-lg bg-white text-black hover:bg-zinc-200 rounded-full font-semibold shadow-xl hover:scale-105 transition-all">
                Get Started Now <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Button variant="outline" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="h-14 px-8 text-lg rounded-full font-medium border-white/20 hover:bg-white/5 text-white">
                <Play className="w-5 h-5 mr-2" /> View Plans
              </Button>
            </div>
          </div>

          {/* TV Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20"></div>
            <div className="relative rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl overflow-hidden aspect-video">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
              
              {/* Dummy UI representing the Mosque Display */}
              <div className="absolute inset-0 p-8 flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="text-emerald-400 font-bold text-2xl tracking-widest uppercase">Fajr</div>
                  <div className="text-white text-5xl font-light tabular-nums tracking-tighter">04:45 <span className="text-2xl text-zinc-400">AM</span></div>
                </div>
                <div className="mt-auto grid grid-cols-5 gap-4">
                  {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p, i) => (
                    <div key={p} className={`p-4 rounded-xl border ${i === 0 ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-black/40 border-white/10 backdrop-blur-md'}`}>
                      <div className="text-sm text-zinc-400 mb-1">{p}</div>
                      <div className="text-xl text-white font-medium">12:30</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-950/50 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Manage multiple screens across different halls from one central dashboard.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: "Auto Prayer Times", desc: "Calculates precise prayer times based on your mosque's exact coordinates and timezone." },
              { icon: Smartphone, title: "Magic 6-Digit Pairing", desc: "No more typing URLs on a TV remote. Just enter a 6-digit code to pair any Smart TV instantly." },
              { icon: Settings, title: "Cloud Management", desc: "Update announcements, themes, and Iqamah times from your phone. TVs update instantly." }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-zinc-900 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Choose the perfect plan for your mosque. No hidden fees.</p>
          </div>

          {plans.length === 0 ? (
            <div className="flex justify-center"><div className="animate-pulse w-32 h-8 bg-white/10 rounded-full"></div></div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
              {plans.map((plan, i) => {
                // Highlight the highest-priced non-free plan that isn't the last one, or the middle plan
                const isPopular = plans.length >= 2 && plan.price > 0 && i === Math.min(1, plans.length - 1)
                return (
                <div key={plan.id} className={`relative p-8 rounded-3xl border ${isPopular ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-105 z-10' : 'bg-zinc-900 border-white/10'}`}>
                  {isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">Most Popular</div>}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">${plan.price}</span>
                      <span className="text-zinc-400">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>Up to <strong>{plan.maxScreens}</strong> Screens</span>
                    </li>
                    <li className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.features.premiumThemes ? 'text-emerald-500' : 'text-zinc-700'}`} />
                      <span className={!plan.features.premiumThemes ? 'text-zinc-600 line-through' : ''}>Premium Themes</span>
                    </li>
                    <li className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.features.customAnnouncements ? 'text-emerald-500' : 'text-zinc-700'}`} />
                      <span className={!plan.features.customAnnouncements ? 'text-zinc-600 line-through' : ''}>Custom Announcements</span>
                    </li>
                    <li className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.features.prioritySupport ? 'text-emerald-500' : 'text-zinc-700'}`} />
                      <span className={!plan.features.prioritySupport ? 'text-zinc-600 line-through' : ''}>Priority 24/7 Support</span>
                    </li>
                  </ul>

                  <Button
                    onClick={() => navigate(`/register?plan=${plan.id}`)}
                    className={`w-full h-12 rounded-xl font-semibold text-base transition-all ${isPopular ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  >
                    {plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
                  </Button>
                </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <MonitorPlay className="w-5 h-5" />
            <span className="font-semibold text-white">Mosque SaaS</span>
          </div>
          <div className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Mosque SaaS. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <ShieldCheck className="w-4 h-4" /> Secure & Encrypted
          </div>
        </div>
      </footer>
    </div>
  )
}
