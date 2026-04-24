import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary selection:text-primary-foreground">
      {/* Background radial gradient to give a subtle premium feel */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <div className="relative z-10 hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile Header (Placeholder for real implementation) */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md">
          <div className="font-bold text-lg text-primary tracking-tight">Mosque SaaS</div>
        </header>

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
