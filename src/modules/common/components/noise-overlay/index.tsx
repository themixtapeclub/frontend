// src/modules/common/components/noise-overlay/index.tsx
export default function NoiseOverlay({ 
  className = "",
  zIndex = 1 
}: { 
  className?: string
  zIndex?: number 
}) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: "url('https://storage.googleapis.com/themixtapeshop/2022/12/noise.jpg')",
        backgroundRepeat: "repeat",
        opacity: 0.08,
        zIndex,
      }}
    />
  )
}
