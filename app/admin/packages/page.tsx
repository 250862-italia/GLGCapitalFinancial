"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from 'react';
import { getPackagesWithFallback } from '@/lib/supabase-fallback';

interface Package {
  id: string;
  name: string;
  description: string;
  min_investment: number;
  max_investment: number;
  duration_months: number;
  expected_return: number;
  status: string;
  type?: string;
  risk_level?: string;
  created_at?: string;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(emptyForm());
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  function emptyForm() {
    return {
      id: null,
      name: '',
      description: '',
      min_investment: '',
      max_investment: '',
      duration_months: '',
      expected_return: '',
      status: 'active',
      type: 'balanced',
      risk_level: 'medium'
    };
  }

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting fetchPackages...');
      
      // Usa la nuova funzione per recuperare pacchetti reali da Supabase
      const realPackages = await getPackagesWithFallback();
      console.log('✅ Packages fetched successfully:', realPackages.length);
      
      setPackages(realPackages);
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError('Errore nel caricamento dei pacchetti');
    }
    
    setLoading(false);
  }

  function openAdd() {
    setForm(emptyForm());
    setIsEdit(false);
    setShowModal(true);
  }

  function openEdit(pkg: Package) {
    setForm({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      min_investment: pkg.min_investment.toString(),
      max_investment: pkg.max_investment.toString(),
      duration_months: pkg.duration_months.toString(),
      expected_return: pkg.expected_return.toString(),
      status: pkg.status,
      type: pkg.type || 'balanced',
      risk_level: pkg.risk_level || 'medium'
    });
    setIsEdit(true);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm(emptyForm());
  }

  async function handleSave(e: any) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const packageData = {
        ...form,
        min_investment: parseFloat(form.min_investment),
        max_investment: parseFloat(form.max_investment),
        duration_months: parseInt(form.duration_months),
        expected_return: parseFloat(form.expected_return)
      };

      const url = isEdit ? `/api/admin/packages/${form.id}` : '/api/admin/packages';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-access'
        },
        body: JSON.stringify(packageData)
      });

      if (response.ok) {
        console.log('✅ Package saved successfully');
        closeModal();
        fetchPackages(); // Ricarica i pacchetti reali
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save package');
      }
    } catch (err: any) {
      console.error('❌ Save error:', err);
      setError(err.message || 'Failed to save package');
    }
    
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questo pacchetto?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': 'admin-access'
        }
      });

      if (response.ok) {
        console.log('✅ Package deleted successfully');
        fetchPackages(); // Ricarica i pacchetti reali
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete package');
      }
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      setError(err.message || 'Failed to delete package');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento pacchetti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestione Pacchetti</h1>
          <p className="text-gray-600">Gestisci i pacchetti di investimento disponibili</p>
          <p className="text-sm text-blue-600 mt-1">
            {packages.length > 0 ? `Caricati ${packages.length} pacchetti dal database` : 'Nessun pacchetto trovato'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Errore</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={openAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            + Nuovo Pacchetto
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  pkg.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {pkg.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{pkg.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Investimento Min:</span>
                  <span className="text-sm font-medium">€{pkg.min_investment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Investimento Max:</span>
                  <span className="text-sm font-medium">€{pkg.max_investment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Durata:</span>
                  <span className="text-sm font-medium">{pkg.duration_months} mesi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Rendimento Atteso:</span>
                  <span className="text-sm font-medium text-green-600">{pkg.expected_return}%</span>
                </div>
                {pkg.type && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tipo:</span>
                    <span className="text-sm font-medium capitalize">{pkg.type}</span>
                  </div>
                )}
                {pkg.risk_level && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Rischio:</span>
                    <span className="text-sm font-medium capitalize">{pkg.risk_level}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => openEdit(pkg)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-md text-sm transition-colors duration-200"
                >
                  Modifica
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-md text-sm transition-colors duration-200"
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {packages.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun pacchetto</h3>
            <p className="mt-1 text-sm text-gray-500">Inizia creando il tuo primo pacchetto di investimento.</p>
            <div className="mt-6">
              <button
                onClick={openAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                + Nuovo Pacchetto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {isEdit ? 'Modifica Pacchetto' : 'Nuovo Pacchetto'}
              </h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investimento Min (€)</label>
                    <input
                      type="number"
                      value={form.min_investment}
                      onChange={(e) => setForm({...form, min_investment: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investimento Max (€)</label>
                    <input
                      type="number"
                      value={form.max_investment}
                      onChange={(e) => setForm({...form, max_investment: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durata (mesi)</label>
                    <input
                      type="number"
                      value={form.duration_months}
                      onChange={(e) => setForm({...form, duration_months: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rendimento Atteso (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.expected_return}
                      onChange={(e) => setForm({...form, expected_return: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({...form, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="conservative">Conservativo</option>
                      <option value="balanced">Bilanciato</option>
                      <option value="aggressive">Aggressivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Livello Rischio</label>
                    <select
                      value={form.risk_level}
                      onChange={(e) => setForm({...form, risk_level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Basso</option>
                      <option value="medium">Medio</option>
                      <option value="high">Alto</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Attivo</option>
                    <option value="inactive">Inattivo</option>
                    <option value="draft">Bozza</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    {saving ? 'Salvando...' : (isEdit ? 'Aggiorna' : 'Crea')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 