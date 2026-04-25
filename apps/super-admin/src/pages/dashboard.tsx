import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MonitorPlay, Wallet, Users } from "lucide-react"
import { useAuth } from "../contexts/auth"
import { Navigate } from "react-router-dom"

export function DashboardPage() {
  const { role, mosqueId, loading } = useAuth()

  if (loading) return null
  
  // Redirect Mosque Admins to their specific dashboard
  if (role === "MOSQUE_ADMIN" && mosqueId) {
    return <Navigate to={`/dashboard/mosques/${mosqueId}`} replace />
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
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">
              +14 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:bg-card hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Screens</CardTitle>
            <MonitorPlay className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +22 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:bg-card hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€4,250</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:bg-card hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">110</div>
            <p className="text-xs text-muted-foreground">
              18 remaining on Trial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholders for Charts/Tables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-t border-dashed m-6 rounded bg-black/5 dark:bg-white/5">
            [ MRR Chart Visual ]
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    M{i}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Central Mosque {i}</p>
                    <p className="text-sm text-muted-foreground">MSQ-UK-00{i}</p>
                  </div>
                  <div className="ml-auto font-medium text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                    Active
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
