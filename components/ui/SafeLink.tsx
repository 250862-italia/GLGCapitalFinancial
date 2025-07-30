import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  disabled?: boolean;
}

export const SafeLink: React.FC<SafeLinkProps> = ({
  href,
  children,
  className = '',
  onClick,
  target,
  rel,
  disabled = false
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (onClick) {
      onClick();
    }

    // Log per debug
    console.log(`🔗 SafeLink clicked: ${href}`);
  };

  // Se è un link esterno, usa un tag <a> normale
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return (
      <a
        href={href}
        className={className}
        onClick={handleClick}
        target={target}
        rel={rel || 'noopener noreferrer'}
        style={{ pointerEvents: disabled ? 'none' : 'auto' }}
      >
        {children}
      </a>
    );
  }

  // Se è un link interno, usa Next.js Link
  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      target={target}
      rel={rel}
      style={{ pointerEvents: disabled ? 'none' : 'auto' }}
    >
      {children}
    </Link>
  );
};

// Hook per gestire la navigazione in modo sicuro
export const useSafeNavigation = () => {
  const router = useRouter();

  const navigate = React.useCallback((href: string) => {
    try {
      console.log(`🧭 Navigating to: ${href}`);
      router.push(href);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback: window.location
      window.location.href = href;
    }
  }, [router]);

  const navigateBack = React.useCallback(() => {
    try {
      router.back();
    } catch (error) {
      console.error('❌ Navigation back error:', error);
      window.history.back();
    }
  }, [router]);

  const navigateForward = React.useCallback(() => {
    try {
      router.forward();
    } catch (error) {
      console.error('❌ Navigation forward error:', error);
      window.history.forward();
    }
  }, [router]);

  return { navigate, navigateBack, navigateForward };
};

// Componente per gestire la navigazione programmatica
export const SafeNavigation: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ href, children, className = '', disabled = false }) => {
  const { navigate } = useSafeNavigation();

  const handleClick = () => {
    if (!disabled) {
      navigate(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={className}
      style={{ pointerEvents: disabled ? 'none' : 'auto' }}
    >
      {children}
    </button>
  );
}; 