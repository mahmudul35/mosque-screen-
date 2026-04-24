import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { LoginPage } from "./pages/login"
import { DashboardLayout } from "./components/layout/dashboard-layout"
import { DashboardPage } from "./pages/dashboard"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          {/* Add more routes here like /mosques, /billing, etc. */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App

