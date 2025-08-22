'use client';

export default function FadeInWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fade-in-wrapper"
      style={{
        opacity: 0,
        animation: 'fadeIn 0.5s ease-in-out 0.1s forwards'
      }}
    >
      {children}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
