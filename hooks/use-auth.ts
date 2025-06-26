"use client"
import { useState } from "react"
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    // Demo login - in produzione useresti Supabase
    if (email === "admin@glgcapital.com" && password === "password123") {
      setUser({ email, role: "superadmin" })
      setLoading(false)
      return { success: true }
    } else {
      setError("Credenziali non valide")
      setLoading(false)
      return { success: false, error: "Credenziali non valide" }
    }
  }

  const signOut = () => {
    setUser(null)
    setError(null)
  }

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }
}
