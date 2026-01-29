import React from 'react';

interface PulsoLogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'full' | 'icon-only' | 'compact';
}

export function PulsoLogo({ 
  className = '', 
  showText = true,
  variant = 'full' 
}: PulsoLogoProps) {
  
  // Variante: Solo ícono
  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Letra P con forma de pulso cardiaco */}
          <g>
            {/* Base de la P */}
            <path
              d="M 40 40 L 40 160 L 60 160 L 60 110 L 100 110 C 120 110 130 100 130 80 C 130 60 120 40 100 40 Z M 60 60 L 100 60 C 108 60 110 68 110 80 C 110 92 108 90 100 90 L 60 90 Z"
              fill="#0F172A"
              className="dark:fill-slate-100"
            />
            
            {/* Línea de pulso cardiaco (animada) */}
            <path
              d="M 20 120 L 50 120 L 60 90 L 70 145 L 80 80 L 90 120 L 180 120"
              stroke="#06B6D4"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pulse-line"
            />
            
            {/* Punto animado que recorre la línea */}
            <circle 
              r="4" 
              fill="#06B6D4" 
              className="pulse-dot"
            >
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path="M 20 120 L 50 120 L 60 90 L 70 145 L 80 80 L 90 120 L 180 120"
              />
            </circle>
          </g>
        </svg>
        
        <style jsx>{`
          @keyframes pulse-wave {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .pulse-line {
            animation: pulse-wave 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }
  
  // Variante: Compacta (ícono + texto pequeño)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="w-10 h-10 relative">
          <svg 
            viewBox="0 0 200 200" 
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 40 40 L 40 160 L 60 160 L 60 110 L 100 110 C 120 110 130 100 130 80 C 130 60 120 40 100 40 Z M 60 60 L 100 60 C 108 60 110 68 110 80 C 110 92 108 90 100 90 L 60 90 Z"
              fill="#0F172A"
            />
            <path
              d="M 20 120 L 50 120 L 60 90 L 70 145 L 80 80 L 90 120 L 180 120"
              stroke="#06B6D4"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-slate-900 leading-none">Pulso</span>
          <span className="text-xs text-slate-500">Control</span>
        </div>
      </div>
    );
  }
  
  // Variante: Full (logo completo con texto)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Ícono */}
      <div className="relative w-14 h-14">
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Letra P */}
          <path
            d="M 40 40 L 40 160 L 60 160 L 60 110 L 100 110 C 120 110 130 100 130 80 C 130 60 120 40 100 40 Z M 60 60 L 100 60 C 108 60 110 68 110 80 C 110 92 108 90 100 90 L 60 90 Z"
            fill="#0F172A"
            className="dark:fill-slate-100"
          />
          
          {/* Línea de pulso */}
          <path
            d="M 20 120 L 50 120 L 60 90 L 70 145 L 80 80 L 90 120 L 180 120"
            stroke="#06B6D4"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pulse-animation"
          />
          
          {/* Punto animado */}
          <circle 
            r="5" 
            fill="#06B6D4"
            className="pulse-dot-shadow"
          >
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              path="M 20 120 L 50 120 L 60 90 L 70 145 L 80 80 L 90 120 L 180 120"
            />
          </circle>
        </svg>
      </div>
      
      {/* Texto */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none tracking-tight">
            Pulso
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            control académico.
          </span>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 1; 
            filter: drop-shadow(0 0 2px #06B6D4);
          }
          50% { 
            opacity: 0.6; 
            filter: drop-shadow(0 0 6px #06B6D4);
          }
        }
        
        .pulse-animation {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .pulse-dot-shadow {
          filter: drop-shadow(0 0 4px #06B6D4);
        }
      `}</style>
    </div>
  );
}

// Versión SVG pura para exportar
export const PulsoLogoSVG = () => (
  <svg 
    viewBox="0 0 600 200" 
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    {/* Ícono de la P con pulso */}
    <g>
      <path
        d="M 40 40 L 40 160 L 60 160 L 60 110 L 100 110 C 120 110 130 100 130 80 C 130 60 120 40 100 40 Z M 60 60 L 100 60 C 108 60 110 68 110 80 C 110 92 108 90 100 90 L 60 90 Z"
        fill="#0F172A"
      />
      <path
        d="M 20 120 L 50 120 L 60 90 L 70 145 L 80 80 L 90 120 L 180 120"
        stroke="#06B6D4"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    
    {/* Texto "Pulso" */}
    <text 
      x="200" 
      y="120" 
      fontFamily="Inter, system-ui, sans-serif" 
      fontSize="72" 
      fontWeight="bold" 
      fill="#0F172A"
    >
      Pulso
    </text>
    
    {/* Texto "control académico." */}
    <text 
      x="200" 
      y="155" 
      fontFamily="Inter, system-ui, sans-serif" 
      fontSize="28" 
      fill="#64748B"
    >
      control académico.
    </text>
  </svg>
);


