'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MessageCircle, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface SupportTicket {
  id: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  response?: string;
}

export default function ClientSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'general',
    priority: 'medium',
    subject: 'Richiesta di supporto',
    message: 'Buongiorno, ho bisogno di assistenza con...'
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Recupera i dati del cliente dal localStorage
      const clientUser = localStorage.getItem('clientUser');
      if (!clientUser) return;

      const user = JSON.parse(clientUser);
      
      // Recupera i ticket di supporto del cliente
      const response = await fetch(`/api/client/support?clientEmail=${user.email}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTickets(result.data.tickets);
        }
      }
    } catch (error) {
      console.error('Errore nel fetch dei ticket:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Recupera i dati del cliente dal localStorage
      const clientUser = localStorage.getItem('clientUser');
      if (!clientUser) {
        setError('Utente non autenticato');
        setLoading(false);
        return;
      }

      const user = JSON.parse(clientUser);
      
      // Invia il ticket di supporto
      const response = await fetch('/api/client/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          client_email: user.email,
          client_name: user.name || `${user.firstName} ${user.lastName}` || 'Cliente'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSubmitSuccess(true);
          setFormData({
            category: 'general',
            priority: 'medium',
            subject: 'Richiesta di supporto',
            message: 'Buongiorno, ho bisogno di assistenza con...'
          });
          // Ricarica i ticket
          fetchTickets();
        } else {
          setError(result.message || 'Errore nell\'invio del ticket');
        }
      } else {
        setError('Errore nell\'invio del ticket');
      }
    } catch (error) {
      console.error('Errore durante l\'invio:', error);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket Inviato!</h1>
          <p className="text-gray-600 mb-6">
            Il tuo ticket di supporto è stato inviato con successo. Il nostro team ti risponderà entro 24 ore.
          </p>
          <button 
            onClick={() => setSubmitSuccess(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Invia Nuovo Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/client/dashboard"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Torna alla Dashboard
              </Link>
              <div className="h-px w-8 bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🆘 Supporto Clienti</h1>
                <p className="text-gray-600 mt-1">Contatta il nostro team di supporto per assistenza</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form di Supporto */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">📝 Invia Ticket di Supporto</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="general">Generale</option>
                    <option value="technical">Problemi Tecnici</option>
                    <option value="investment">Investimenti</option>
                    <option value="documents">Documenti</option>
                    <option value="billing">Fatturazione</option>
                    <option value="security">Sicurezza</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priorità *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Oggetto *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Descrivi brevemente il problema"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Messaggio *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Descrivi in dettaglio il tuo problema o richiesta..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-red-800">{error}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    loading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? 'Invio in corso...' : 'Invia Ticket di Supporto'}
                </button>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-500">
                    * Campi obbligatori
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Invia Ticket
                  </button>
                </div>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">❓ Domande Frequenti</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Come posso modificare il mio profilo di rischio?</h3>
                  <p className="text-gray-600 text-sm">Contatta il nostro team di supporto per richiedere una modifica del profilo di rischio. Ti guideremo attraverso il processo.</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Quanto tempo impiega l'approvazione dei documenti?</h3>
                  <p className="text-gray-600 text-sm">I documenti vengono revisionati entro 24-48 ore lavorative. Riceverai una notifica via email una volta completata la revisione.</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Posso prelevare i miei investimenti in qualsiasi momento?</h3>
                  <p className="text-gray-600 text-sm">La possibilità di prelievo dipende dal tipo di investimento. Alcuni hanno periodi di lock-in, altri permettono prelievi parziali.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contatti Diretti */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Contatti Diretti</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@glgcapital.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Telefono</p>
                    <p className="text-sm text-gray-600">+39 02 1234 5678</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Orari</p>
                    <p className="text-sm text-gray-600">Lun-Ven: 9:00-18:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 I Miei Ticket</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-900">Ticket #1234</span>
                  </div>
                  <span className="text-xs text-green-600">Risolto</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-gray-900">Ticket #1235</span>
                  </div>
                  <span className="text-xs text-yellow-600">In Lavorazione</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-900">Ticket #1236</span>
                  </div>
                  <span className="text-xs text-blue-600">In Attesa</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Azioni Rapide</h3>
              <div className="space-y-3">
                <Link 
                  href="/client/documents"
                  className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-5 w-5 text-blue-600 mr-3">📁</div>
                    <div>
                      <div className="font-medium text-gray-900">Carica Documenti</div>
                      <div className="text-sm text-gray-700">Aggiorna i tuoi documenti</div>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  href="/client/profile"
                  className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-5 w-5 text-green-600 mr-3">👤</div>
                    <div>
                      <div className="font-medium text-gray-900">Modifica Profilo</div>
                      <div className="text-sm text-gray-700">Aggiorna le tue informazioni</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Informazioni sul Supporto</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• I ticket vengono gestiti in ordine di priorità</p>
                <p>• Per emergenze, chiama direttamente il numero di supporto</p>
                <p>• Mantieni sempre aggiornate le tue informazioni di contatto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
