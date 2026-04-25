import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { LoginPage } from "./pages/login"
import { RegisterPage } from "./pages/register"
import { DashboardLayout } from "./components/layout/dashboard-layout"
import { DashboardPage } from "./pages/dashboard"
import { MosquesPage } from "./pages/mosques"
import { MosqueDetailPage } from "./pages/mosque-detail"
import { ScreensPage } from "./pages/screens"
import { PlansPage } from "./pages/plans"
import { CheckoutPage } from "./pages/checkout"

import { ProtectedRoute } from "./components/layout/protected-route"

import { LandingPage } from "./pages/landing"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="mosques" element={<MosquesPage />} />
            <Route path="mosques/:id" element={<MosqueDetailPage />} />
            <Route path="screens" element={<ScreensPage />} />
            <Route path="plans" element={<PlansPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App

