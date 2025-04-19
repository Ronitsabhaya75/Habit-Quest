import { ButtonHTMLAttributes } from "react"

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  glowEffect?: boolean
  children: React.ReactNode
  className?: string
}

export function ThemedButton({
  variant = "primary",
  size = "md",
  glowEffect = false,
  children,
  className = "",
  ...props
}: ThemedButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#00ffc8] to-[#00a6ff] text-[#0d1520] hover:brightness-110",
    secondary: "bg-[rgba(0,166,255,0.2)] text-[#B8FFF9] border border-[rgba(0,166,255,0.3)] hover:bg-[rgba(0,166,255,0.3)]",
    outline: "bg-transparent border border-[rgba(0,255,198,0.3)] text-[#B8FFF9] hover:bg-[rgba(0,255,198,0.1)]",
    ghost: "bg-transparent text-[#B8FFF9] hover:bg-[rgba(255,255,255,0.05)]"
  }

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3"
  }

  const glowClasses = glowEffect 
    ? "after:content-[''] after:absolute after:inset-0 after:rounded-lg after:opacity-0 after:transition-opacity hover:after:opacity-100 after:shadow-[0_0_15px_3px_rgba(0,255,198,0.6)] after:z-[-1]" 
    : ""

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
} 