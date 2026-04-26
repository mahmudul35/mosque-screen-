import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'

import { ThemeProvider } from "./components/theme-provider"
import { Provider } from "react-redux"
import { store } from "./store"
import { AuthProvider } from "./contexts/auth"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="mosque-saas-theme">
          <App />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
