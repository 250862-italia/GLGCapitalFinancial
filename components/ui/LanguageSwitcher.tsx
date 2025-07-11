"use client";

import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'next-i18next';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    // Per l'App Router, usiamo un approccio diverso
    // Reindirizziamo alla stessa pagina con il nuovo locale
    const currentPath = pathname || '/';
    router.push(currentPath);
    
    // Cambia la lingua nell'i18n
    i18n.changeLanguage(lng);
  };

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