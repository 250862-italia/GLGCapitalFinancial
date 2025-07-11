"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useSafeRouter() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a mock router when not mounted
    return {
      push: (href: string) => {
        console.log('Router not mounted, would navigate to:', href);
        // Fallback to window.location if needed
        if (typeof window !== 'undefined') {
          window.location.href = href;
        }
      },
      replace: (href: string) => {
        console.log('Router not mounted, would replace with:', href);
        if (typeof window !== 'undefined') {
          window.location.replace(href);
        }
      },
      back: () => {
        console.log('Router not mounted, would go back');
        if (typeof window !== 'undefined') {
          window.history.back();
        }
      },
      forward: () => {
        console.log('Router not mounted, would go forward');
        if (typeof window !== 'undefined') {
          window.history.forward();
        }
      },
      refresh: () => {
        console.log('Router not mounted, would refresh');
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      },
      prefetch: () => {
        console.log('Router not mounted, prefetch ignored');
      }
    };
  }

  return router;
} 