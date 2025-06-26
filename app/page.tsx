"use client"

import Link from "next/link"
import { ArrowRight, TrendingUp, Shield, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">GLG Capital Group</div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-white/80 hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link>
              <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            GLG{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Capital
            </span>
          </h1>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-12">
            Piattaforma di Investimenti Professionale per la Gestione del Patrimonio
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl text-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3"
            >
              <span>Accedi alla Dashboard</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
            <Link
              href="/about"
              className="bg-white/10 backdrop-blur-md text-white px-12 py-4 rounded-xl text-xl font-bold hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              Scopri di più
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 text-center border border-white/20">
            <div className="text-5xl font-bold text-green-400 mb-4">€2.5B+</div>
            <h3 className="text-xl font-semibold text-white mb-2">Assets Under Management</h3>
            <p className="text-white/60">Patrimonio gestito per i nostri clienti</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 text-center border border-white/20">
            <div className="text-5xl font-bold text-blue-400 mb-4">+15.2%</div>
            <h3 className="text-xl font-semibold text-white mb-2">Rendimento Medio Annuo</h3>
            <p className="text-white/60">Performance storica degli ultimi 5 anni</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 text-center border border-white/20">
            <div className="text-5xl font-bold text-purple-400 mb-4">500+</div>
            <h3 className="text-xl font-semibold text-white mb-2">Clienti Attivi</h3>
            <p className="text-white/60">Investitori che si fidano di noi</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-10 border border-white/20">
            <TrendingUp className="h-16 w-16 text-blue-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Investimenti Intelligenti</h3>
            <p className="text-white/80">Strategie di investimento basate su analisi avanzate e intelligenza artificiale</p>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-10 border border-white/20">
            <Shield className="h-16 w-16 text-green-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Sicurezza Garantita</h3>
            <p className="text-white/80">Protezione avanzata dei dati e conformità alle normative finanziarie internazionali</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-3xl p-10 border border-white/20">
            <Users className="h-16 w-16 text-purple-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Consulenza Personalizzata</h3>
            <p className="text-white/80">Team di esperti dedicati per strategie di investimento su misura</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-16">
          <h2 className="text-5xl font-bold text-white mb-6">Inizia il tuo Percorso di Investimento</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Unisciti a centinaia di investitori che hanno scelto GLG Capital per far crescere il loro patrimonio
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-blue-600 px-12 py-4 rounded-xl text-xl font-bold hover:bg-gray-100 transition-colors shadow-2xl"
          >
            Inizia Ora
          </Link>
        </div>
      </div>
    </div>
  )
}
