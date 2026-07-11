import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { useAuthStore } from './store/authStore'
import { GameSelector } from './pages/GameSelector'
import { GamePage } from './pages/GamePage'
import { BingoPage } from './pages/BingoPage'
import { BlackjackPage } from './pages/BlackjackPage'
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
      <Route path="/" element={<ProtectedRoute><GameSelector /></ProtectedRoute>} />
      <Route path="/slots" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
      <Route path="/bingo" element={<ProtectedRoute><BingoPage /></ProtectedRoute>} />
      <Route path="/blackjack" element={<ProtectedRoute><BlackjackPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
