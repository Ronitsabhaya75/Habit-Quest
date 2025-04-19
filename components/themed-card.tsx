interface ThemedCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  glowEffect?: boolean
}

export function ThemedCard({
  title,
  children,
  className = "",
  glowEffect = false,
}: ThemedCardProps) {
  return (
    <div 
      className={`relative bg-[rgba(11,26,44,0.8)] backdrop-blur-md rounded-xl border border-[rgba(0,255,198,0.3)] shadow-lg overflow-hidden ${
        glowEffect ? 'shadow-[0_0_15px_rgba(0,255,198,0.15)]' : ''
      } ${className}`}
    >
      {/* Card shimmer effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform skew-x-[-25deg] animate-shimmer"></div>
      </div>
      
      {title && (
        <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.1)]">
          <h3 className="text-lg font-semibold text-[#B8FFF9]">{title}</h3>
        </div>
      )}
      
      <div className="p-5">{children}</div>
    </div>
  )
} 