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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors duration-300">
                GLG Capital
              </div>
              <div className="text-xs text-slate-600 uppercase tracking-wider">
                Financial Group
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`nav-link text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-amber-600' 
                  : isScrolled 
                    ? 'text-slate-700 hover:text-slate-900' 
                    : 'text-white hover:text-amber-400'
              }`}
            >
              Home
            </Link>
            
            <Link 
              href="/about" 
              className={`nav-link text-sm font-medium transition-all duration-200 ${
                isActive('/about') 
                  ? 'text-amber-600' 
                  : isScrolled 
                    ? 'text-slate-700 hover:text-slate-900' 
                    : 'text-white hover:text-amber-400'
              }`}
            >
              About
            </Link>
            
            <Link 
              href="/investments" 
              className={`nav-link text-sm font-medium transition-all duration-200 ${
                isActive('/investments') 
                  ? 'text-amber-600' 
                  : isScrolled 
                    ? 'text-slate-700 hover:text-slate-900' 
                    : 'text-white hover:text-amber-400'
              }`}
            >
              Investments
            </Link>
            
            <Link 
              href="/contact" 
              className={`nav-link text-sm font-medium transition-all duration-200 ${
                isActive('/contact') 
                  ? 'text-amber-600' 
                  : isScrolled 
                    ? 'text-slate-700 hover:text-slate-900' 
                    : 'text-white hover:text-amber-400'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              href="/login" 
              className={`text-sm font-medium transition-all duration-200 ${
                isScrolled 
                  ? 'text-slate-700 hover:text-slate-900' 
                  : 'text-white hover:text-amber-400'
              }`}
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="btn-primary text-sm px-6 py-2"
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