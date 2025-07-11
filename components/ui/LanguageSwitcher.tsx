"use client";

import { useSafeRouter } from '@/lib/safe-router';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const router = useSafeRouter();
  const pathname = usePathname();
  const [isI18nReady, setIsI18nReady] = useState(false);
  
  // Wrapper sicuro per useTranslation
  let i18n: any = null;
  try {
    const translation = useTranslation();
    i18n = translation.i18n;
    if (i18n && !isI18nReady) {
      setIsI18nReady(true);
    }
  } catch (error) {
    console.log('i18n not ready yet');
  }

  const changeLanguage = (lng: string) => {
    // Per l'App Router, usiamo un approccio diverso
    // Reindirizziamo alla stessa pagina con il nuovo locale
    const currentPath = pathname || '/';
    router.push(currentPath);
    
    // Cambia la lingua nell'i18n se disponibile
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(lng);
    }
  };

  // Se i18n non è pronto, mostra una versione semplificata
  if (!isI18nReady) {
    return (
      <div style={{ position: 'fixed', top: 16, right: 24, zIndex: 1000, display: 'flex', gap: 8 }}>
        <button
          onClick={() => changeLanguage('en')}
          style={{
            background: '#6366f1',
            color: '#fff',
            border: '1px solid #6366f1',
            borderRadius: 6,
            padding: '4px 12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage('it')}
          style={{
            background: '#fff',
            color: '#6366f1',
            border: '1px solid #6366f1',
            borderRadius: 6,
            padding: '4px 12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          IT
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 16, right: 24, zIndex: 1000, display: 'flex', gap: 8 }}>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          background: i18n.language === 'en' ? '#6366f1' : '#fff',
          color: i18n.language === 'en' ? '#fff' : '#6366f1',
          border: '1px solid #6366f1',
          borderRadius: 6,
          padding: '4px 12px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('it')}
        style={{
          background: i18n.language === 'it' ? '#6366f1' : '#fff',
          color: i18n.language === 'it' ? '#fff' : '#6366f1',
          border: '1px solid #6366f1',
          borderRadius: 6,
          padding: '4px 12px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        IT
      </button>
    </div>
  );
} 