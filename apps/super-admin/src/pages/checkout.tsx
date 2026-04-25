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

  // Get plan and mosqueId from query params
  // mosqueId is passed directly from register to avoid AuthContext loading race condition
  const params = new URLSearchParams(location.search)
  const plan = params.get("plan") || "free"
  const urlMosqueId = params.get("mosqueId")
  
  // Use URL param first (freshly registered), fall back to AuthContext (returning user)
  const effectiveMosqueId = urlMosqueId || authMosqueId
  const isReady = !!effectiveMosqueId && (!authLoading || !!urlMosqueId)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/register")
    }
  }, [user, authLoading, navigate])

  const handleDummyPayment = async () => {
    if (!effectiveMosqueId) {
      alert("Session error: Mosque ID not found. Please try logging in again.")
      navigate("/login")
      return
    }

    setIsProcessing(true)
    
    // Simulate Stripe network delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // Update the mosque document to activate the subscription
      await updateDoc(doc(db, "mosques", effectiveMosqueId), {
        plan: plan,
        status: "active",
        subscriptionId: "sub_dummy_" + Math.random().toString(36).substring(7)
      })

      setIsSuccess(true)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Payment failed", error)
      alert("Payment failed. Please try again.")
      setIsProcessing(false)
    }
  }

  // Only block rendering if auth is loading AND we don't have the mosqueId from URL
  if (authLoading && !urlMosqueId) return null

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
          <p className="text-zinc-400 text-sm">You are subscribing to the <strong className="text-white uppercase">{plan}</strong> plan.</p>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400">Plan</span>
            <span className="font-semibold text-white capitalize">{plan}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400">Billed</span>
            <span className="font-semibold text-white">Monthly</span>
          </div>
          <div className="border-t border-white/10 my-3 pt-3 flex justify-between items-center">
            <span className="text-zinc-300 font-medium">Total Due Today</span>
            <span className="text-xl font-bold text-emerald-400">
              {plan === "free" ? "$0.00" : plan === "basic" ? "$15.00" : "$30.00"}
            </span>
          </div>
        </div>

        <Button 
          onClick={handleDummyPayment} 
          disabled={isProcessing || !isReady}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-lg font-medium transition-all disabled:opacity-60"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing...</span>
          ) : !isReady ? (
            <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading session...</span>
          ) : (
            <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Confirm & Pay</span>
          )}
        </Button>
        <p className="text-center text-xs text-zinc-500 mt-4">
          This is a dummy payment page for demonstration purposes. No real card is charged.
        </p>
      </div>
    </div>
  )
}
