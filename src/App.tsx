import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { useAuthStore } from './store/authStore'
import { GamePage } from './pages/GamePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProfilePage } from './pages/ProfilePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#050505]"><Loader className="w-6 h-6 text-white/30 animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { user } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/registro" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/*" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
    </Routes>
  )
}
