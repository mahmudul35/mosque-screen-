import React, { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

export type UserRole = "SUPER_ADMIN" | "MOSQUE_ADMIN"

interface AuthData {
  user: User | null
  role: UserRole | null
  mosqueId: string | null
  loading: boolean
}

const AuthContext = createContext<AuthData>({
  user: null,
  role: null,
  mosqueId: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [mosqueId, setMosqueId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Fetch user document from Firestore to get role and linked mosque
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setRole(data.role as UserRole)
            setMosqueId(data.mosqueId || null)
          } else {
            // Default fallback if no user doc exists
            setRole("MOSQUE_ADMIN")
            setMosqueId(null)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setRole("MOSQUE_ADMIN")
        }
      } else {
        setUser(null)
        setRole(null)
        setMosqueId(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, mosqueId, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
