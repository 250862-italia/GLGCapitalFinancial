"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/use-auth";

export default function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
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

  return <>{children}</>;
}
