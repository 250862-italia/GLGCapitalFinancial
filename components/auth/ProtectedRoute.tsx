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
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 ProtectedRoute: Checking authentication...');
        
        // Get CSRF token first
        const csrfResponse = await fetch('/api/csrf', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!csrfResponse.ok) {
          console.log('❌ ProtectedRoute: Failed to get CSRF token');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const csrfData = await csrfResponse.json();
        console.log('✅ ProtectedRoute: CSRF token obtained');

        // Check auth with CSRF token
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfData.token
          },
          credentials: 'include'
        });

        console.log('📥 ProtectedRoute: Auth check response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📥 ProtectedRoute: Auth check data:', data);
          
          if (data.authenticated && data.user) {
            console.log('✅ ProtectedRoute: User authenticated successfully');
            setIsAuthenticated(true);
            setRetryCount(0); // Reset retry count on success
          } else {
            console.log('❌ ProtectedRoute: User not authenticated');
            setIsAuthenticated(false);
          }
        } else {
          console.log('❌ ProtectedRoute: Auth check failed with status:', response.status);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ ProtectedRoute: Auth check error:', error);
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
      console.log('🔄 ProtectedRoute: Redirecting to login...');
      // Add a small delay to prevent immediate redirect loops
      const timer = setTimeout(() => {
        router.push('/login');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  // Add retry mechanism for failed auth checks
  useEffect(() => {
    if (!isLoading && !isAuthenticated && retryCount < 2) {
      console.log(`🔄 ProtectedRoute: Retrying auth check (attempt ${retryCount + 1})`);
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
        // Retry the auth check
        const retryAuth = async () => {
          try {
            const csrfResponse = await fetch('/api/csrf', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include'
            });

            if (csrfResponse.ok) {
              const csrfData = await csrfResponse.json();
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
                if (data.authenticated && data.user) {
                  console.log('✅ ProtectedRoute: Auth retry successful');
                  setIsAuthenticated(true);
                  setRetryCount(0);
                  return;
                }
              }
            }
            
            console.log('❌ ProtectedRoute: Auth retry failed');
            setIsAuthenticated(false);
          } catch (error) {
            console.error('❌ ProtectedRoute: Auth retry error:', error);
            setIsAuthenticated(false);
          } finally {
            setIsLoading(false);
          }
        };
        
        retryAuth();
      }, 1000); // Wait 1 second before retry
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, retryCount]);

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
          <p style={{color: "#6b7280", margin: 0}}>
            {retryCount > 0 ? `Verifying authentication... (attempt ${retryCount + 1})` : 'Loading...'}
          </p>
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
