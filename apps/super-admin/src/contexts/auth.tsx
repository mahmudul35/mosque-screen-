import React, { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

export type UserRole = "SUPER_ADMIN" | "MOSQUE_ADMIN"

export interface PlanLimits {
  planId: string
  planName: string
  maxScreens: number
  features: {
    premiumThemes: boolean
    customAnnouncements: boolean
    prioritySupport: boolean
    [key: string]: boolean
  }
}

interface AuthData {
  user: User | null
  role: UserRole | null
  mosqueId: string | null
  planLimits: PlanLimits | null
  emailVerified: boolean
  loading: boolean
}

const DEFAULT_FREE_LIMITS: PlanLimits = {
  planId: "free",
  planName: "Free",
  maxScreens: 1,
  features: { premiumThemes: false, customAnnouncements: false, prioritySupport: false }
}

const AuthContext = createContext<AuthData>({
  user: null,
  role: null,
  mosqueId: null,
  planLimits: null,
  emailVerified: false,
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [mosqueId, setMosqueId] = useState<string | null>(null)
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null)
  const [emailVerified, setEmailVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setEmailVerified(firebaseUser.emailVerified)
        try {
          // 1. Fetch user document to get role and mosqueId
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const userRole = userData.role as UserRole
            const userMosqueId = userData.mosqueId || null

            setRole(userRole)
            setMosqueId(userMosqueId)

            // 2. If mosque admin, fetch mosque to get current plan, then fetch plan limits
            if (userRole === "MOSQUE_ADMIN" && userMosqueId) {
              const mosqueDoc = await getDoc(doc(db, "mosques", userMosqueId))
              if (mosqueDoc.exists()) {
                const mosqueData = mosqueDoc.data()
                const currentPlanId = mosqueData.plan || "free"

                // 3. Fetch the plan document for limits
                const planDoc = await getDoc(doc(db, "plans", currentPlanId))
                if (planDoc.exists()) {
                  const planData = planDoc.data()
                  setPlanLimits({
                    planId: currentPlanId,
                    planName: planData.name,
                    maxScreens: planData.maxScreens,
                    features: planData.features
                  })
                } else {
                  setPlanLimits(DEFAULT_FREE_LIMITS)
                }
              }
            } else if (userRole === "SUPER_ADMIN") {
              // Super admins have unlimited access
              setPlanLimits({
                planId: "super",
                planName: "Super Admin",
                maxScreens: 9999,
                features: { premiumThemes: true, customAnnouncements: true, prioritySupport: true }
              })
            }
          } else {
            setRole("MOSQUE_ADMIN")
            setMosqueId(null)
            setPlanLimits(DEFAULT_FREE_LIMITS)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setRole("MOSQUE_ADMIN")
          setPlanLimits(DEFAULT_FREE_LIMITS)
        }
      } else {
        setUser(null)
        setRole(null)
        setMosqueId(null)
        setPlanLimits(null)
        setEmailVerified(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Refresh emailVerified when user returns to the tab (after clicking verification link)
  useEffect(() => {
    const handleFocus = async () => {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await auth.currentUser.reload()
        setEmailVerified(auth.currentUser.emailVerified)
      }
    }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, mosqueId, planLimits, emailVerified, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
