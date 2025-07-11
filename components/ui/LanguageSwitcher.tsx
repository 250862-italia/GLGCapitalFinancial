"use client";

import { useState } from 'react';
import { Globe } from 'lucide-react';

// Wrapper sicuro per useTranslation
const useSafeTranslation = () => {
  try {
    // Dynamic import per evitare errori di SSR
    const { useTranslation } = require('next-i18next');
    return useTranslation();
  } catch (error) {
    // Fallback se i18next non è disponibile
    return {
      t: (key: string) => key,
      i18n: { language: 'en' }
    };
  }
};

export default function LanguageSwitcher() {
  const translation = useSafeTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  const currentLanguage = languages.find(lang => lang.code === translation.i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    try {
      translation.i18n.changeLanguage(languageCode);
    } catch (error) {
      console.log('Language change not available in this context');
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          color: '#374151'
        }}
      >
        <Globe size={16} />
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          minWidth: '150px'
        }}>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
                textAlign: 'left',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 