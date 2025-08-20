import React from 'react';

interface GLGLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function GLGLogo({ className = '', size = 'md', showText = true }: GLGLogoProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo grafico in oro metallizzato */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Elemento grafico dinamico con pennellate energetiche */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="25%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#F4E4BC" />
              <stop offset="75%" stopColor="#B8860B" />
              <stop offset="100%" stopColor="#DAA520" />
            </linearGradient>
            <filter id="metallic">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
              <feSpecularLighting result="specOut" in="SourceGraphic" specularConstant="1.5" specularExponent="20" lightingColor="#FFFFFF">
                <fePointLight x="50" y="75" z="200" />
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceGraphic" operator="in" />
            </filter>
          </defs>
          
          {/* Pennellate energetiche che si muovono verso l'alto */}
          <path
            d="M15 85 Q25 75 35 65 Q45 55 55 45 Q65 35 75 25 Q80 20 85 15"
            stroke="url(#goldGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#metallic)"
            className="animate-pulse"
          />
          
          <path
            d="M20 80 Q30 70 40 60 Q50 50 60 40 Q70 30 80 20"
            stroke="url(#goldGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#metallic)"
            opacity="0.8"
          />
          
          <path
            d="M25 75 Q35 65 45 55 Q55 45 65 35 Q75 25 85 15"
            stroke="url(#goldGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#metallic)"
            opacity="0.6"
          />
          
          {/* Elementi decorativi e texture */}
          <circle cx="85" cy="15" r="3" fill="url(#goldGradient)" opacity="0.9" />
          <circle cx="80" cy="20" r="2" fill="url(#goldGradient)" opacity="0.7" />
          <circle cx="75" cy="25" r="2.5" fill="url(#goldGradient)" opacity="0.8" />
        </svg>
      </div>
      
      {/* Testo del logo */}
      {showText && (
        <div className={`mt-2 text-center ${textSizes[size]}`}>
          <div className="font-bold text-gray-800 tracking-wider">
            GLG CAPITAL GROUP LLC
          </div>
        </div>
      )}
    </div>
  );
}
