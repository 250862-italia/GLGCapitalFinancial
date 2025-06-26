export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl font-bold mb-4">GLG Capital Group</h1>
          <p className="text-xl opacity-90">Piattaforma di Investimenti Professionale</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center text-white">
            <h3 className="text-lg font-semibold mb-2">Portfolio Totale</h3>
            <p className="text-4xl font-bold text-green-400">€2,450,000</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center text-white">
            <h3 className="text-lg font-semibold mb-2">Rendimento Annuo</h3>
            <p className="text-4xl font-bold text-blue-400">+12.5%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center text-white">
            <h3 className="text-lg font-semibold mb-2">Investimenti Attivi</h3>
            <p className="text-4xl font-bold text-purple-400">24</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Stato Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-white">
              <span className="text-green-400 mr-3">✅</span>
              <span>Database Supabase: Connesso</span>
            </div>
            <div className="flex items-center text-white">
              <span className="text-green-400 mr-3">✅</span>
              <span>Sistema Autenticazione: Attivo</span>
            </div>
            <div className="flex items-center text-white">
              <span className="text-green-400 mr-3">✅</span>
              <span>Dashboard: Online</span>
            </div>
            <div className="flex items-center text-white">
              <span className="text-green-400 mr-3">✅</span>
              <span>Deploy: Completato</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="space-x-4">
            <a
              href="/login"
              className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Accedi
            </a>
            <a
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
