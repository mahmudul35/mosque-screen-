import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Building2, CreditCard, Settings, Megaphone, MonitorPlay, LogOut } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "../../lib/firebase"
import { useAuth } from "../../contexts/auth"

import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

const superAdminItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Mosques", href: "/mosques", icon: Building2 },
  { name: "Screens", href: "/screens", icon: MonitorPlay },
  { name: "Subscriptions", href: "/billing", icon: CreditCard },
  { name: "Global Announcements", href: "/announcements", icon: Megaphone },
  { name: "Settings", href: "/settings", icon: Settings },
]

const mosqueAdminItems = [
  { name: "My Mosque", href: "/", icon: LayoutDashboard },
  { name: "Screens", href: "/screens", icon: MonitorPlay },
  { name: "Billing", href: "/billing", icon: CreditCard },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, user, mosqueId } = useAuth()

  const sidebarItems = role === "SUPER_ADMIN" ? superAdminItems : mosqueAdminItems

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/login")
  }

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
          // If mosque admin, rewrite the "My Mosque" link to go to their specific detail page
          const actualHref = role === "MOSQUE_ADMIN" && item.name === "My Mosque" && mosqueId 
            ? `/mosques/${mosqueId}` 
            : item.href

          const isActive = location.pathname === actualHref || (item.name === "My Mosque" && location.pathname === "/")
          
          return (
            <Link
              key={item.name}
              to={actualHref}
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

      <div className="border-t p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium uppercase">
              {role === "SUPER_ADMIN" ? "SA" : "MA"}
            </div>
            <div className="flex flex-col text-sm max-w-[120px]">
              <span className="font-semibold leading-tight truncate">{user?.email || "Admin"}</span>
              <span className="text-xs text-muted-foreground truncate">{role === "SUPER_ADMIN" ? "Super Admin" : "Mosque Admin"}</span>
            </div>
          </div>
          <ModeToggle />
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  )
}
