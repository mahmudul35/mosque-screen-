import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAuth } from "../contexts/auth"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { CheckCircle2, Loader2, ShieldCheck, CreditCard, ArrowLeft, MonitorPlay, Palette, Megaphone, HeadphonesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlanData {
  name: string
  price: number
  interval: string
  maxScreens: number
  features: {
    premiumThemes: boolean
    customAnnouncements: boolean
    prioritySupport: boolean
  }
}

export function CheckoutPage() {
  const { mosqueId: authMosqueId, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [planData, setPlanData] = useState<PlanData | null>(null)
  const [planLoading, setPlanLoading] = useState(true)

  const searchParams = new URLSearchParams(location.search)
  const plan = searchParams.get("plan") || "free"
  const urlMosqueId = searchParams.get("mosqueId") || null

  const effectiveMosqueId = urlMosqueId ?? authMosqueId
  const isReady = !!effectiveMosqueId && (!!urlMosqueId || !authLoading) && !!planData

  // Fetch real plan data from Firestore
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const planDoc = await getDoc(doc(db, "plans", plan))
        if (planDoc.exists()) {
          setPlanData(planDoc.data() as PlanData)
        } else {
          // Fallback for unknown plan
          setPlanData({ name: plan, price: 0, interval: "month", maxScreens: 1, features: { premiumThemes: false, customAnnouncements: false, prioritySupport: false } })
        }
      } catch {
        setPlanData({ name: plan, price: 0, interval: "month", maxScreens: 1, features: { premiumThemes: false, customAnnouncements: false, prioritySupport: false } })
      } finally {
        setPlanLoading(false)
      }
    }
    fetchPlan()
  }, [plan])

  // Redirect if free plan — shouldn't be on checkout
  useEffect(() => {
    if (!planLoading && planData && planData.price === 0) {
      navigate("/dashboard", { replace: true })
    }
  }, [planData, planLoading, navigate])

  // Redirect to register if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/register")
    }
  }, [user, authLoading, navigate])

  const handleConfirmPayment = async () => {
    if (!effectiveMosqueId) {
      navigate("/login")
      return
    }

    setIsProcessing(true)

    // Simulate payment gateway delay
    await new Promise<void>(resolve => setTimeout(resolve, 2000))

    try {
      await updateDoc(doc(db, "mosques", effectiveMosqueId), {
        plan: plan,
        status: "active",
        subscriptionId: "sub_demo_" + Math.random().toString(36).substring(7),
      })

      setIsSuccess(true)
      setTimeout(() => navigate("/dashboard"), 2000)
    } catch (err) {
      console.error("Checkout update failed:", err)
      setIsProcessing(false)
    }
  }

  if ((authLoading && !urlMosqueId) || planLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-zinc-400">Your account is now active. Redirecting to your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Subscription</h1>
          <p className="text-zinc-400 text-sm">
            You are subscribing to the <strong className="text-white uppercase">{planData?.name || plan}</strong> plan.
          </p>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400">Plan</span>
            <span className="font-semibold text-white capitalize">{planData?.name || plan}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400">Billing Cycle</span>
            <span className="font-semibold text-white capitalize">{planData?.interval || "month"}ly</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400">Screens</span>
            <span className="font-semibold text-white">Up to {planData?.maxScreens || 1}</span>
          </div>
          <div className="border-t border-white/10 my-3 pt-3 flex justify-between items-center">
            <span className="text-zinc-300 font-medium">Total Due Today</span>
            <span className="text-xl font-bold text-emerald-400">${planData?.price?.toFixed(2) || "0.00"}</span>
          </div>
        </div>

        {/* Plan features */}
        {planData && (
          <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Included Features</p>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <MonitorPlay className="w-4 h-4 text-emerald-400 shrink-0" />
              Up to {planData.maxScreens} TV Screen{planData.maxScreens > 1 ? 's' : ''}
            </div>
            <div className={`flex items-center gap-2 text-sm ${planData.features.premiumThemes ? 'text-zinc-300' : 'text-zinc-600 line-through'}`}>
              <Palette className={`w-4 h-4 shrink-0 ${planData.features.premiumThemes ? 'text-emerald-400' : 'text-zinc-700'}`} />
              Premium Themes
            </div>
            <div className={`flex items-center gap-2 text-sm ${planData.features.customAnnouncements ? 'text-zinc-300' : 'text-zinc-600 line-through'}`}>
              <Megaphone className={`w-4 h-4 shrink-0 ${planData.features.customAnnouncements ? 'text-emerald-400' : 'text-zinc-700'}`} />
              Custom Announcements
            </div>
            <div className={`flex items-center gap-2 text-sm ${planData.features.prioritySupport ? 'text-zinc-300' : 'text-zinc-600 line-through'}`}>
              <HeadphonesIcon className={`w-4 h-4 shrink-0 ${planData.features.prioritySupport ? 'text-emerald-400' : 'text-zinc-700'}`} />
              Priority 24/7 Support
            </div>
          </div>
        )}

        <Button
          onClick={handleConfirmPayment}
          disabled={isProcessing || !isReady}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-lg font-medium transition-all disabled:opacity-60"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Processing...
            </span>
          ) : !isReady ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading session...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Confirm & Pay
            </span>
          )}
        </Button>

        <div className="flex items-center justify-between mt-4">
          <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Change Plan
          </Link>
          <p className="text-xs text-zinc-500">
            Demo payment — no real card charged.
          </p>
        </div>
      </div>
    </div>
  )
}
