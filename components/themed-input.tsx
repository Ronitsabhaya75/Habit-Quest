import { InputHTMLAttributes, forwardRef } from "react"

interface ThemedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

export const ThemedInput = forwardRef<HTMLInputElement, ThemedInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[#B8FFF9]">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            className={`w-full bg-[rgba(21,38,66,0.6)] border ${
              error
                ? "border-red-500/30 focus:border-red-500/70"
                : "border-[rgba(0,255,198,0.3)] focus:border-[rgba(0,255,198,0.7)]"
            } rounded-lg px-4 py-2.5 text-[#B8FFF9] placeholder:text-[#B8FFF9]/50 focus:outline-none focus:ring-2 ${
              error
                ? "focus:ring-red-500/20"
                : "focus:ring-[rgba(0,255,198,0.2)]"
            } backdrop-blur-sm transition-all duration-200 ${className}`}
            ref={ref}
            {...props}
          />
          
          {/* Glow effect on focus */}
          <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity pointer-events-none group-focus-within:opacity-100 bg-[rgba(0,255,198,0.05)] blur-sm"></div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
) 