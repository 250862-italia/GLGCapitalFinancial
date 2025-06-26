export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to <span className="text-amber-500">GLG Capital Financial</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Your trusted partner for investment management and financial growth
          </p>
          <button className="bg-amber-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-amber-600">
            Get Started
          </button>
        </div>
      </section>
    </div>
  )
}

      {/* Stats Section */}
      <section className="py-16 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-amber-500">€2.5B+</h3>
              <p>Assets Under Management</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-amber-500">500+</h3>
              <p>Institutional Clients</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-amber-500">15+</h3>
              <p>Years Experience</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-amber-500">98%</h3>
              <p>Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Investment Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-amber-500">Private Wealth Management</h3>
              <p>Tailored investment strategies for high-net-worth individuals and families.</p>
            </div>
            <div className="bg-slate-800 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-amber-500">Corporate Finance</h3>
              <p>M&A advisory, IPO services, and strategic financial consulting.</p>
            </div>
            <div className="bg-slate-800 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-amber-500">Asset Management</h3>
              <p>Diversified portfolio management across global markets and asset classes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
