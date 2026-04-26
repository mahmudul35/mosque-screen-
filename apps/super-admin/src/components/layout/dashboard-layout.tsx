import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { useAuth } from "../../contexts/auth"
import { sendEmailVerification } from "firebase/auth"
import { auth } from "../../lib/firebase"
import { AlertTriangle, Loader2, Mail, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function DashboardLayout() {
  const { emailVerified, user } = useAuth()
  const [resending, setResending] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const handleResend = async () => {
    if (!auth.currentUser) return
    setResending(true)
    try {
      await sendEmailVerification(auth.currentUser)
      toast.success("Verification email sent! Check your inbox.")
    } catch {
      toast.error("Failed to send email. Please try again later.")
    } finally {
      setResending(false)
    }
  }

  const showBanner = user && !emailVerified && !dismissed

  return (
    <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary selection:text-primary-foreground">
      {/* Background radial gradient to give a subtle premium feel */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="relative z-10 hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md">
          <div className="font-bold text-lg text-primary tracking-tight">Mosque SaaS</div>
        </header>

        {/* Email Verification Banner */}
        {showBanner && (
          <div className="mx-4 md:mx-6 lg:mx-8 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
            <Mail className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Verify your email address</p>
              <p className="text-xs text-muted-foreground">We sent a verification link to {user.email}. Check your inbox.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleResend} disabled={resending} className="h-8 text-xs">
                {resending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Resend
              </Button>
              <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground text-xs px-1">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
