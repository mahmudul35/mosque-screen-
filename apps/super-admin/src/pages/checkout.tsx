import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { CheckCircle2, Loader2, ShieldCheck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CheckoutPage() {
  const { mosqueId: authMosqueId, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Read plan and mosqueId from URL query params.
  // mosqueId is passed directly from register.tsx to avoid AuthContext race condition.
  const searchParams = new URLSearchParams(location.search)
  const plan = searchParams.get("plan") || "free"
  const urlMosqueId = searchParams.get("mosqueId") || null

  // Use URL param first (just registered), fall back to AuthContext (returning user)
  const effectiveMosqueId = urlMosqueId ?? authMosqueId

  // Ready = we have a mosqueId from any source
  // If urlMosqueId exists, we don't need to wait for authLoading
  const isReady = !!effectiveMosqueId && (!!urlMosqueId || !authLoading)

  // Redirect to register if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/register")
    }
  }, [user, authLoading, navigate])

  const handleConfirmPayment = async () => {
    if (!effectiveMosqueId) {
      alert("Session error: could not find your Mosque ID. Please log in again.")
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
        subscriptionId: "sub_dummy_" + Math.random().toString(36).substring(7),
      })

      setIsSuccess(true)
      setTimeout(() => navigate("/dashboard"), 2000)
    } catch (err) {
      console.error("Checkout update failed:", err)
      alert("Payment processing failed. Please try again.")
      setIsProcessing(false)
    }
  }

  // Show spinner only if auth is loading and no urlMosqueId to fall back on
  if (authLoading && !urlMosqueId) {
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

  const planPrice = plan === "free" ? "$0.00" : plan === "basic" ? "$15.00" : "$30.00"

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Subscription</h1>
          <p className="text-zinc-400 text-sm">
            You are subscribing to the <strong className="text-white uppercase">{plan}</strong> plan.
          </p>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400">Plan</span>
            <span className="font-semibold text-white capitalize">{plan}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400">Billing Cycle</span>
            <span className="font-semibold text-white">Monthly</span>
          </div>
          <div className="border-t border-white/10 my-3 pt-3 flex justify-between items-center">
            <span className="text-zinc-300 font-medium">Total Due Today</span>
            <span className="text-xl font-bold text-emerald-400">{planPrice}</span>
          </div>
        </div>

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

        <p className="text-center text-xs text-zinc-500 mt-4">
          This is a demo payment page. No real card is charged.
        </p>
      </div>
    </div>
  )
}
