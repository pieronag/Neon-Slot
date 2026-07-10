import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, UserPlus, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { ParticleBackground } from '../components/ui/ParticleBackground'

function InputField({ label, type, value, onChange, placeholder, isText, icon }: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string; isText?: boolean; icon: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 flex items-center">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-white/20 transition-colors placeholder:text-white/15"
          placeholder={placeholder}
          required={!isText}
          minLength={type === 'password' ? 6 : undefined}
        />
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const { register, error, loading } = useAuthStore()
  const nav = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await register(email, password, name || 'Jugador'); nav('/') }
    catch {}
  }

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden" style={{ background: '#050505' }}>
      <ParticleBackground />

      <div className="flex-1 flex items-center justify-center relative z-10 px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm rounded-xl p-6"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)', border: '0.5px solid rgba(255,255,255,0.06)' }}
        >
          <div className="mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
              <UserPlus className="w-5 h-5 text-white/60" />
            </div>
            <h1 className="text-base font-semibold text-white">Crear cuenta</h1>
            <p className="text-sm text-white/40 mt-1">Regístrate para empezar a jugar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Nombre" type="text" value={name} onChange={setName} placeholder="Tu nombre" isText icon={<User className="w-4 h-4" />} />
            <InputField label="Correo electrónico" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" icon={<Mail className="w-4 h-4" />} />
            <InputField label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" icon={<Lock className="w-4 h-4" />} />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-red-400 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-2.5 overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors disabled:opacity-40"
            >
              {loading ? 'Creando…' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/[0.04] text-center">
            <span className="text-sm text-white/30">¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-sm text-white font-medium hover:underline">Iniciar sesión</Link>
          </div>
        </motion.div>
      </div>

      <p className="text-center pb-4 text-[11px] text-white/15 relative z-10">ORION MACHINE &middot; Casino Premium 2026</p>
    </div>
  )
}
