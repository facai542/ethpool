import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface StakingCardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'warning' | 'loading'
  children: ReactNode
  isLoading?: boolean
}

export function StakingCardButton({ 
  variant = 'primary', 
  children, 
  isLoading = false, 
  className = '', 
  ...props 
}: StakingCardButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 border-none outline-none'
  
  const variants = {
    primary: 'bg-yellow-500 text-black hover:bg-yellow-600',
    secondary: 'bg-orange-500 text-white hover:bg-orange-600',
    warning: 'bg-red-500 text-white hover:bg-red-600',
    loading: 'bg-blue-500 text-white hover:bg-blue-600'
  }
  
  const buttonStyles = `${baseStyles} ${variants[variant]} ${className}`
  
  return (
    <button 
      className={buttonStyles}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
} 