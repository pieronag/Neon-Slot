import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  disabled?: boolean
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  fullWidth?: boolean
}

const styles: Record<string, string> = {
  primary: 'bg-white text-black font-medium hover:bg-neutral-200',
  secondary: 'bg-white/[0.04] text-white/60 border border-white/[0.06] hover:text-white hover:bg-white/[0.06]',
  ghost: 'bg-transparent text-white/40 border-transparent hover:text-white',
}

const sizes: Record<string, string> = {
  sm: 'h-9 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-sm rounded-xl gap-2.5',
  icon: 'h-11 w-11 rounded-xl',
}

export function Button({
  children, variant = 'primary', size = 'md',
  disabled = false, className = '', fullWidth = false, ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        relative font-medium tracking-tight cursor-pointer select-none
        inline-flex items-center justify-center whitespace-nowrap transition-all duration-150
        ${sizes[size]}
        ${disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : styles[variant]}
        ${fullWidth ? 'w-full' : ''} ${className}
      `}
      disabled={disabled}
      {...props}
    >
      <span className="relative inline-flex items-center gap-inherit">{children}</span>
    </motion.button>
  )
}
