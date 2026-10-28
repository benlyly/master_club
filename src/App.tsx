import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import type { ReactNode } from 'react'
import SplashScreen from './pages/SplashScreen'
import AuthPage from './pages/AuthPage'
import MasterProfile from './pages/MasterProfile'
import MastersDirectory from './pages/MastersDirectory'
import Dashboard from './pages/Dashboard'
import PrintGenerator from './pages/PrintGenerator'
import Layout from './components/Layout'

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/m/:id" element={<MasterProfile />} />
      <Route path="/masters" element={<Layout><MastersDirectory /></Layout>} />
      <Route path="/card" element={<Layout><PrintGenerator /></Layout>} />
      <Route path="/me" element={<Protected><Layout><Dashboard /></Layout></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
