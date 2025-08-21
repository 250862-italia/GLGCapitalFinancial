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
      {/* Logo temporaneamente rimosso per test */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center bg-blue-600 rounded-full`}>
        <span className="text-white font-bold text-2xl">GLG</span>
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
