"use client";

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [mounted, setMounted] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  const selectedLanguage = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    setIsOpen(false);
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', languageCode);
    }
  };

  // Load preferred language from localStorage on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred-language');
      if (saved && languages.find(lang => lang.code === saved)) {
        setCurrentLanguage(saved);
      }
    }
  }, []);

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
          color: '#374151',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Globe size={16} />
        <span>{selectedLanguage.flag}</span>
        <span>{selectedLanguage.name}</span>
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
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          zIndex: 1000,
          minWidth: '150px',
          overflow: 'hidden'
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
                background: language.code === currentLanguage ? '#f3f4f6' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
                textAlign: 'left',
                transition: 'background-color 0.2s ease',
                borderBottom: language.code !== languages[languages.length - 1].code ? '1px solid #f3f4f6' : 'none'
              }}
              onMouseEnter={(e) => {
                if (language.code !== currentLanguage) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (language.code !== currentLanguage) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
              {language.code === currentLanguage && (
                <span style={{ marginLeft: 'auto', color: '#3b82f6', fontSize: '12px' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 