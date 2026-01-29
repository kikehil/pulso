/**
 * Isotipo PulseTec Control - La 'P' con el pulso
 * Representa el monitoreo y control en tiempo real
 */

interface PulseTecLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulseTecLogo({ size = 'md', className = '' }: PulseTecLogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizes[size]} ${className} relative`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Fondo circular con gradiente */}
        <circle cx="24" cy="24" r="22" fill="#06B6D4" opacity="0.1" />
        
        {/* La letra P estilizada */}
        <path
          d="M16 12 L16 36 M16 12 L26 12 C30 12 32 14 32 18 C32 22 30 24 26 24 L16 24"
          stroke="#06B6D4"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Línea de pulso cardiaco */}
        <path
          d="M20 28 L22 28 L24 24 L26 32 L28 28 L30 28"
          stroke="#06B6D4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse"
        />
        
        {/* Punto de pulso animado */}
        <circle cx="30" cy="28" r="2" fill="#06B6D4" className="animate-pulse" />
      </svg>
    </div>
  );
}

/**
 * Versión simplificada solo con la P
 */
export function PulseTecIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full ${className}`}
    >
      {/* P simplificada */}
      <path
        d="M8 6 L8 18 M8 6 L14 6 C16 6 17 7 17 9 C17 11 16 12 14 12 L8 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pulso */}
      <path
        d="M10 14 L11 14 L12 12 L13 16 L14 14 L15 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


