import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { LoginPage } from "./pages/login"
import { DashboardLayout } from "./components/layout/dashboard-layout"
import { DashboardPage } from "./pages/dashboard"
import { MosquesPage } from "./pages/mosques"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="mosques" element={<MosquesPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

