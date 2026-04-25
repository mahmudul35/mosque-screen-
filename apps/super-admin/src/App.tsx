import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { LoginPage } from "./pages/login"
import { RegisterPage } from "./pages/register"
import { DashboardLayout } from "./components/layout/dashboard-layout"
import { DashboardPage } from "./pages/dashboard"
import { MosquesPage } from "./pages/mosques"
import { MosqueDetailPage } from "./pages/mosque-detail"

import { ProtectedRoute } from "./components/layout/protected-route"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="mosques" element={<MosquesPage />} />
            <Route path="mosques/:id" element={<MosqueDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App

