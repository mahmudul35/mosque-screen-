import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

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
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
