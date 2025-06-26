import Link from "next/link"
import { ArrowRight, TrendingUp, Shield, Users, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <nav className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-white">GLG Capital</div>
              <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-blue-500 rounded"></div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/investments" className="text-gray-300 hover:text-white transition-colors">
                Investments
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/dashboard" className="bg-teal-500 hover:bg-teal-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Promo Banner */}
      <div className="bg-teal-500 text-black text-center py-3">
        <p className="font-semibold">
          Per i nuovi clienti: <span className="font-bold">12.5% rendimento annuo</span> sui primi investimenti*
        </p>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="text-teal-400 font-semibold mb-4 text-lg">
              Investi con GLG Capital
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Siamo qui per il tuo{" "}
              <span className="text-teal-400">futuro</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Inizia a investire e prendi in mano il tuo futuro finanziario: <span className="text-white font-bold">12.5% annuo*</span> di rendimento, 
              gestione professionale e piani di accumulo a partire da 100 €.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/dashboard" className="bg-teal-500 hover:bg-teal-600 text-black px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-flex items-center justify-center">
                Inizia a Investire
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/about" className="border border-gray-600 text-white hover:bg-gray-800 px-8 py-4 rounded-lg font-semibold text-lg transition-colors text-center">
                Scopri di più
              </Link>
            </div>
            
            <p className="text-sm text-gray-400">
              Investire comporta dei <Link href="#" className="underline hover:text-gray-300">rischi</Link>.
            </p>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <TrendingUp className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Portfolio Growth</h3>
                <p className="text-gray-400">Professional Investment Management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-400 mb-2">€2.5B+</div>
              <div className="text-gray-400">Assets Under Management</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-400 mb-2">500+</div>
              <div className="text-gray-400">Global Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-400 mb-2">15+</div>
              <div className="text-gray-400">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-400 mb-2">98%</div>
              <div className="text-gray-400">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="bg-white p-6 rounded-2xl">
            <div className="w-32 h-32 bg-black rounded-lg flex items-center justify-center">
              <div className="text-white text-xs font-mono">
                QR CODE<br/>
                GLG CAPITAL<br/>
                APP
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex text-teal-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-2xl">★</span>
              ))}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Unisciti a + di 500 clienti istituzionali:{" "}
              <span className="text-teal-400">scarica l'app</span>
            </h2>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">GLG Capital Group LLC</div>
              <p className="text-gray-400">Professional investment management and financial advisory services.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Wealth Management</li>
                <li>Corporate Finance</li>
                <li>Asset Management</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+1 (555) 123-4567</li>
                <li>info@glgcapital.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GLG Capital Group LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
