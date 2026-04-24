import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Building2, CreditCard, Settings, Megaphone, MonitorPlay } from "lucide-react"

import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

const sidebarItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Mosques", href: "/mosques", icon: Building2 },
  { name: "Screens", href: "/screens", icon: MonitorPlay },
  { name: "Subscriptions", href: "/billing", icon: CreditCard },
  { name: "Global Announcements", href: "/announcements", icon: Megaphone },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-screen flex-col border-r bg-background w-64 md:w-72 lg:w-80">
      <div className="flex h-16 items-center flex-shrink-0 px-6 border-b">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="text-primary" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          Mosque SaaS
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-6 flex flex-col gap-2 px-4">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-primary",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="border-t p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
            SA
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-semibold leading-tight">Super Admin</span>
            <span className="text-xs text-muted-foreground">Admin Role</span>
          </div>
        </div>
        <ModeToggle />
      </div>
    </div>
  )
}
