import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth"
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../lib/firebase"
import { MonitorPlay, Plus, Loader2, Trash2, AlertCircle, Lock, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Screen {
  id: string
  name: string
  status: "online" | "offline"
  lastActive: string
  mosqueId: string
}

export function ScreensPage() {
  const { mosqueId, role, planLimits } = useAuth()
  const [screens, setScreens] = useState<Screen[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pin, setPin] = useState("")
  const [screenName, setScreenName] = useState("")
  const [isPairing, setIsPairing] = useState(false)
  const [error, setError] = useState("")

  // Fetch screens real-time
  useEffect(() => {
    if (!mosqueId && role !== "SUPER_ADMIN") return
    
    // If super admin, fetch all screens. If mosque admin, fetch only theirs.
    const screensRef = collection(db, "screens")
    const q = role === "SUPER_ADMIN" 
      ? query(screensRef) 
      : query(screensRef, where("mosqueId", "==", mosqueId))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Screen[] = []
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Screen)
      })
      setScreens(data)
      setLoading(false)
    }, (err) => {
      console.error("Failed to fetch screens:", err)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [mosqueId, role])

  const handlePairScreen = async () => {
    if (!pin || pin.length !== 6) {
      setError("Please enter a valid 6-digit PIN")
      return
    }
    if (!screenName) {
      setError("Please give this screen a name (e.g. Main Hall)")
      return
    }
    if (!mosqueId) {
      setError("You must be assigned to a Mosque to pair a screen.")
      return
    }
    // Enforce plan screen limit
    const maxScreens = planLimits?.maxScreens ?? 1
    if (screens.length >= maxScreens) {
      setError(`Screen limit reached for your plan (${maxScreens} max). Please upgrade to add more screens.`)
      return
    }

    setIsPairing(true)
    setError("")

    try {
      // 1. Look up the PIN in pairing_codes
      const codesRef = collection(db, "pairing_codes")
      const q = query(codesRef, where("pin", "==", pin), where("status", "==", "pending"))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        throw new Error("Invalid or expired PIN. Please check the TV screen.")
      }

      const pairingDoc = querySnapshot.docs[0]

      // 2. Add screen to screens collection
      await addDoc(collection(db, "screens"), {
        mosqueId: mosqueId,
        name: screenName,
        status: "online",
        lastActive: new Date().toISOString(),
        createdAt: serverTimestamp()
      })

      // 3. Update the pairing document so the TV knows it's paired
      await updateDoc(doc(db, "pairing_codes", pairingDoc.id), {
        status: "paired",
        mosqueId: mosqueId,
        pairedAt: serverTimestamp()
      })

      setIsModalOpen(false)
      setPin("")
      setScreenName("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsPairing(false)
    }
  }

  const handleUnpair = async (screenId: string) => {
    if (confirm("Are you sure you want to unpair this screen? It will stop showing your mosque's data.")) {
      await deleteDoc(doc(db, "screens", screenId))
    }
  }

  const maxScreens = planLimits?.maxScreens ?? 1
  const isAtLimit = role === "MOSQUE_ADMIN" && screens.length >= maxScreens

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TV Screens</h1>
          <p className="text-muted-foreground mt-1">
            Manage and pair smart TVs · 
            <span className="text-primary font-medium">{screens.length}/{maxScreens === 9999 ? '∞' : maxScreens} screens used</span>
          </p>
        </div>
        
        {role === "MOSQUE_ADMIN" && (
          isAtLimit ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="font-medium text-amber-500">Screen limit reached</p>
                <p className="text-muted-foreground text-xs">Upgrade your plan to add more screens</p>
              </div>
              <a href="/" className="ml-2 text-xs text-primary hover:underline flex items-center gap-1">
                Upgrade <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          ) : (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Screen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Pair a TV Screen</DialogTitle>
                <DialogDescription>
                  Open the TV Display app on your smart TV to get the 6-digit PIN.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="p-3 bg-destructive/15 border border-destructive/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="pin" className="text-sm font-medium">6-Digit PIN from TV</label>
                  <Input 
                    id="pin" 
                    placeholder="e.g. 487231" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-xl tracking-[0.25em] font-mono text-center h-12"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Screen Name</label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Main Hall, Women's Section" 
                    value={screenName}
                    onChange={(e) => setScreenName(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handlePairScreen} disabled={isPairing || pin.length !== 6 || !screenName}>
                  {isPairing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Pair Screen"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : screens.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-xl bg-card/30">
          <MonitorPlay className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No Screens Paired</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-4">
            You haven't connected any TV screens yet. Open the app on your TV to get a code and pair it here.
          </p>
          {role === "MOSQUE_ADMIN" && (
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>Pair your first screen</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {screens.map(screen => (
            <Card key={screen.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MonitorPlay className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{screen.name}</CardTitle>
                      <CardDescription className="text-xs">ID: {screen.id.slice(0, 8)}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  <span className="font-medium">Online</span>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-4 border-t">
                  <span className="text-xs text-muted-foreground">Connected TV</span>
                  <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleUnpair(screen.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Unpair
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
