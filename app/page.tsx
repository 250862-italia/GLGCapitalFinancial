https://github.com/250862-italia/v0-financial-dashboard/blob/main/app/page.tsx
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
