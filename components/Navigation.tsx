'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      transition: 'all 0.3s ease',
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
      backdropFilter: isScrolled ? 'blur(12px)' : 'none',
      boxShadow: isScrolled ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
      borderBottom: isScrolled ? '1px solid #e2e8f0' : 'none'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>G</span>
            </div>
            <div style={{ display: 'none', '@media (min-width: 640px)': { display: 'block' } }}>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: isScrolled ? '#1e293b' : 'white',
                transition: 'color 0.3s ease'
              }}>
                GLG Capital
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: isScrolled ? '#64748b' : 'rgba(255, 255, 255, 0.8)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Financial Group
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div style={{ display: 'none', '@media (min-width: 1024px)': { display: 'flex', alignItems: 'center', gap: '2rem' } }}>
            <Link 
              href="/" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isActive('/') 
                  ? '#d97706' 
                  : isScrolled 
                    ? '#374151' 
                    : 'white',
                textDecoration: 'none'
              }}
            >
              Home
            </Link>
            
            <Link 
              href="/about" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isActive('/about') 
                  ? '#d97706' 
                  : isScrolled 
                    ? '#374151' 
                    : 'white',
                textDecoration: 'none'
              }}
            >
              About
            </Link>
            
            <Link 
              href="/investments" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isActive('/investments') 
                  ? '#d97706' 
                  : isScrolled 
                    ? '#374151' 
                    : 'white',
                textDecoration: 'none'
              }}
            >
              Investments
            </Link>
            
            <Link 
              href="/contact" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isActive('/contact') 
                  ? '#d97706' 
                  : isScrolled 
                    ? '#374151' 
                    : 'white',
                textDecoration: 'none'
              }}
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div style={{ display: 'none', '@media (min-width: 1024px)': { display: 'flex', alignItems: 'center', gap: '1rem' } }}>
            <Link 
              href="/login" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isScrolled ? '#374151' : 'white',
                textDecoration: 'none'
              }}
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.5rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
              isScrolled 
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' 
                : 'text-white hover:text-amber-400 hover:bg-white/10'
            }`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${
              isScrolled ? 'bg-white' : 'bg-slate-900/95 backdrop-blur-md'
            } rounded-lg mt-2 shadow-xl border border-slate-200`}>
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive('/')
                    ? 'text-amber-600 bg-amber-50'
                    : isScrolled
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      : 'text-white hover:text-amber-400 hover:bg-white/10'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              
              <Link
                href="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive('/about')
                    ? 'text-amber-600 bg-amber-50'
                    : isScrolled
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      : 'text-white hover:text-amber-400 hover:bg-white/10'
                }`}
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              
              <Link
                href="/investments"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive('/investments')
                    ? 'text-amber-600 bg-amber-50'
                    : isScrolled
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      : 'text-white hover:text-amber-400 hover:bg-white/10'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Investments
              </Link>
              
              <Link
                href="/contact"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive('/contact')
                    ? 'text-amber-600 bg-amber-50'
                    : isScrolled
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      : 'text-white hover:text-amber-400 hover:bg-white/10'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-4 pb-2 border-t border-slate-200">
                <Link
                  href="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isScrolled
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      : 'text-white hover:text-amber-400 hover:bg-white/10'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 mt-2 rounded-md text-base font-medium bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 