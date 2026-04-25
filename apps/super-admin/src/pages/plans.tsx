import { useState, useEffect } from "react"
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuth } from "../contexts/auth"
import { Shield, Save, Plus, Trash2, Edit2, Loader2, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface Plan {
  id: string
  name: string
  priceId?: string // For Stripe
  price: number
  interval: "month" | "year"
  maxScreens: number
  features: {
    premiumThemes: boolean
    customAnnouncements: boolean
    prioritySupport: boolean
    [key: string]: boolean
  }
  isActive: boolean
  order: number
}

// Default initial plans if none exist
const DEFAULT_PLANS: Plan[] = [
  {
    id: "free", name: "Free", price: 0, interval: "month", maxScreens: 1,
    features: { premiumThemes: false, customAnnouncements: false, prioritySupport: false }, isActive: true, order: 1
  },
  {
    id: "basic", name: "Basic", price: 15, interval: "month", maxScreens: 2,
    features: { premiumThemes: true, customAnnouncements: false, prioritySupport: false }, isActive: true, order: 2
  },
  {
    id: "pro", name: "Pro", price: 30, interval: "month", maxScreens: 5,
    features: { premiumThemes: true, customAnnouncements: true, prioritySupport: true }, isActive: true, order: 3
  }
]

export function PlansPage() {
  const { role } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    if (role !== "SUPER_ADMIN") return

    const unsub = onSnapshot(collection(db, "plans"), (snap) => {
      if (snap.empty) {
        // Seed default plans if collection is completely empty
        seedDefaultPlans()
      } else {
        const data: Plan[] = []
        snap.forEach(d => data.push({ id: d.id, ...d.data() } as Plan))
        setPlans(data.sort((a, b) => a.order - b.order))
        setLoading(false)
      }
    })

    return () => unsub()
  }, [role])

  const seedDefaultPlans = async () => {
    for (const plan of DEFAULT_PLANS) {
      await setDoc(doc(db, "plans", plan.id), plan)
    }
  }

  const handleUpdatePlan = async (planId: string, updates: Partial<Plan>) => {
    setSavingId(planId)
    try {
      await updateDoc(doc(db, "plans", planId), updates)
    } catch (error) {
      console.error(error)
      alert("Failed to update plan")
    } finally {
      setSavingId(null)
    }
  }

  const handleFeatureToggle = (plan: Plan, featureKey: string, currentValue: boolean) => {
    handleUpdatePlan(plan.id, {
      features: { ...plan.features, [featureKey]: !currentValue }
    })
  }

  if (role !== "SUPER_ADMIN") {
    return <div className="p-8 text-center text-red-500">Access Denied. Super Admin only.</div>
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dynamic Pricing Plans</h1>
        <p className="text-muted-foreground mt-1">Manage subscription packages, pricing, and feature access limits globally.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`border-border/60 ${!plan.isActive && 'opacity-60'}`}>
            <CardHeader className="pb-4 border-b bg-muted/20">
              <div className="flex justify-between items-center mb-2">
                <Badge variant={plan.price === 0 ? "secondary" : "default"} className="uppercase tracking-widest text-[10px]">
                  {plan.id}
                </Badge>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                    <input 
                      type="checkbox" 
                      checked={plan.isActive} 
                      onChange={(e) => handleUpdatePlan(plan.id, { isActive: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Active
                  </label>
                </div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Input 
                  className="font-bold text-xl h-8 px-2 w-full" 
                  defaultValue={plan.name} 
                  onBlur={(e) => {
                    if (e.target.value !== plan.name) handleUpdatePlan(plan.id, { name: e.target.value })
                  }}
                />
              </CardTitle>
              <CardDescription>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-2xl font-bold text-foreground">
                    $ <input 
                      type="number" 
                      className="w-16 bg-transparent border-b border-dashed border-gray-500 focus:border-primary focus:outline-none"
                      defaultValue={plan.price}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val) && val !== plan.price) handleUpdatePlan(plan.id, { price: val })
                      }}
                    />
                  </span>
                  <span className="text-sm pb-1">/ {plan.interval}</span>
                </div>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex justify-between">
                  Max Allowed Screens
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{plan.maxScreens} Limit</span>
                </label>
                <Input 
                  type="number" 
                  min={1} 
                  defaultValue={plan.maxScreens} 
                  onBlur={(e) => {
                    const val = parseInt(e.target.value)
                    if (!isNaN(val) && val !== plan.maxScreens) handleUpdatePlan(plan.id, { maxScreens: val })
                  }}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Features Included</label>
                
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">Premium Themes</span>
                  <input 
                    type="checkbox" 
                    checked={plan.features.premiumThemes || false} 
                    onChange={() => handleFeatureToggle(plan, 'premiumThemes', plan.features.premiumThemes)}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">Custom Announcements</span>
                  <input 
                    type="checkbox" 
                    checked={plan.features.customAnnouncements || false} 
                    onChange={() => handleFeatureToggle(plan, 'customAnnouncements', plan.features.customAnnouncements)}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">Priority Support</span>
                  <input 
                    type="checkbox" 
                    checked={plan.features.prioritySupport || false} 
                    onChange={() => handleFeatureToggle(plan, 'prioritySupport', plan.features.prioritySupport)}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/10 border-t py-3 flex justify-between items-center text-xs text-muted-foreground">
              {savingId === plan.id ? (
                <span className="flex items-center text-primary"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...</span>
              ) : (
                <span className="flex items-center text-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Saved to Database</span>
              )}
              <span>Order: {plan.order}</span>
            </CardFooter>
          </Card>
        ))}

        <Card className="border-border/60 border-dashed flex flex-col items-center justify-center p-8 bg-card/10 cursor-pointer hover:bg-card/30 transition-colors">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Create Custom Plan</h3>
          <p className="text-sm text-muted-foreground text-center mt-2 max-w-[200px]">Add a custom enterprise or localized package.</p>
        </Card>
      </div>
    </div>
  )
}
