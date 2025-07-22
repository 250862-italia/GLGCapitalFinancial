"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get CSRF token first
        const csrfResponse = await fetch('/api/csrf', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!csrfResponse.ok) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const csrfData = await csrfResponse.json();

        // Check auth with CSRF token
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfData.token
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Controlla l'auth solo una volta al mount
    checkAuth();
  }, []); // Dipendenze vuote per eseguire solo al mount

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{
          background: "white", 
          borderRadius: 16, 
          padding: "2rem", 
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", 
          textAlign: "center"
        }}>
          <div style={{
            width: 40, 
            height: 40, 
            border: "4px solid #f3f4f6", 
            borderTop: "4px solid #667eea", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite", 
            margin: "0 auto 1rem"
          }} />
          <p style={{color: "#6b7280", margin: 0}}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
