import { useState, useEffect } from "react"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MonitorPlay, Wallet, Users, Loader2 } from "lucide-react"
import { useAuth } from "../contexts/auth"
import { Navigate, useNavigate } from "react-router-dom"

interface DashboardStats {
  totalMosques: number
  activeScreens: number
  monthlyRevenue: number
  activeSubs: number
  recentMosques: { id: string; name: string; mosqueId: string; plan: string; status: string; createdAt: string }[]
}

export function DashboardPage() {
  const { role, mosqueId, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || role !== "SUPER_ADMIN") return

    const fetchStats = async () => {
      try {
        // Fetch all mosques
        const mosquesSnap = await getDocs(collection(db, "mosques"))
        const mosques: any[] = []
        mosquesSnap.forEach(doc => mosques.push({ id: doc.id, ...doc.data() }))

        // Fetch all screens
        const screensSnap = await getDocs(collection(db, "screens"))

        // Fetch all plans for price lookup
        const plansSnap = await getDocs(collection(db, "plans"))
        const planPrices: Record<string, number> = {}
        plansSnap.forEach(doc => {
          const data = doc.data()
          planPrices[doc.id] = data.price || 0
        })

        // Calculate stats
        const totalMosques = mosques.length
        const activeScreens = screensSnap.size
        const activeSubs = mosques.filter(m => m.plan && m.plan !== "free" && m.status !== "Suspended").length
        const monthlyRevenue = mosques.reduce((sum, m) => {
          const price = planPrices[m.plan] || 0
          return m.status !== "Suspended" ? sum + price : sum
        }, 0)

        // Recent mosques (sorted by createdAt descending)
        const recentMosques = mosques
          .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
          .slice(0, 5)
          .map(m => ({
            id: m.id,
            name: m.name || "Unnamed",
            mosqueId: m.mosqueId || m.id,
            plan: m.plan || "free",
            status: m.status || "Active",
            createdAt: m.createdAt || "",
          }))

        setStats({ totalMosques, activeScreens, monthlyRevenue, activeSubs, recentMosques })
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [role, authLoading])

  if (authLoading) return null

  // Redirect Mosque Admins to their specific dashboard
  if (role === "MOSQUE_ADMIN" && mosqueId) {
    return <Navigate to={`/dashboard/mosques/${mosqueId}`} replace />
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your platform's high-level metrics and activity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:bg-card hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mosques</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMosques ?? 0}</div>
            <p className="text-xs text-muted-foreground">Registered on platform</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:bg-card hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paired Screens</CardTitle>
            <MonitorPlay className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeScreens ?? 0}</div>
            <p className="text-xs text-muted-foreground">TV displays connected</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:bg-card hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthlyRevenue?.toFixed(2) ?? "0.00"}</div>
            <p className="text-xs text-muted-foreground">From active subscriptions</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:bg-card hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubs ?? 0}</div>
            <p className="text-xs text-muted-foreground">On paid plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentMosques && stats.recentMosques.length > 0 ? (
              <div className="space-y-5">
                {stats.recentMosques.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
                    onClick={() => navigate(`/dashboard/mosques/${m.id}`)}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4 space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.mosqueId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">{m.plan}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${m.status === "active" || m.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="mx-auto h-8 w-8 mb-3 opacity-30" />
                <p>No mosques registered yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Free Tier Mosques</span>
              <span className="font-bold">
                {stats?.recentMosques ? stats.totalMosques - stats.activeSubs : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Paid Subscribers</span>
              <span className="font-bold text-emerald-500">{stats?.activeSubs ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <span className="font-bold">
                {stats && stats.totalMosques > 0
                  ? ((stats.activeSubs / stats.totalMosques) * 100).toFixed(1) + "%"
                  : "0%"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Revenue / Mosque</span>
              <span className="font-bold">
                ${stats && stats.activeSubs > 0
                  ? (stats.monthlyRevenue / stats.activeSubs).toFixed(2)
                  : "0.00"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
