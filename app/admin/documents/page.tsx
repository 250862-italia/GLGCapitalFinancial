'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Document {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  size: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/documents');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Mappa i dati dal database al formato dell'interfaccia
          const mappedDocuments = result.data.documents.map((doc: any) => ({
            id: doc.id,
            clientId: doc.client_id,
            clientName: doc.clients ? `${doc.clients.first_name} ${doc.clients.last_name}` : 'Cliente Sconosciuto',
            clientEmail: doc.clients ? doc.clients.email : 'Email Sconosciuta',
            name: doc.name,
            type: doc.file_type,
            size: formatFileSize(doc.file_size),
            uploadedAt: new Date(doc.uploaded_at).toLocaleDateString('it-IT'),
            status: doc.status,
            notes: doc.notes || ''
          }));
          setDocuments(mappedDocuments);
        } else {
          console.error('Errore API:', result.message);
        }
      } else {
        console.error('Errore HTTP:', response.status);
      }
    } catch (error) {
      console.error('Errore nel caricamento documenti:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approvato';
      case 'pending': return 'In Attesa';
      case 'rejected': return 'Rifiutato';
      default: return 'Sconosciuto';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'image': return '🖼️';
      default: return '📎';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesSearch = doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateDocumentStatus = async (docId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Aggiorna lo stato locale
          setDocuments(prev => prev.map(doc => 
            doc.id === docId ? { ...doc, status: newStatus as any } : doc
          ));
          // Ricarica i documenti per sincronizzazione
          fetchDocuments();
        } else {
          console.error('Errore nell\'aggiornamento:', result.message);
        }
      } else {
        console.error('Errore HTTP nell\'aggiornamento:', response.status);
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📁 Gestione Documenti Clienti</h1>
              <p className="text-gray-600 mt-1">Visualizza e gestisci tutti i documenti caricati dai clienti</p>
            </div>
            <Link 
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Torna alla Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <div className="text-2xl">📊</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Totale Documenti</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <div className="text-2xl">⏳</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Attesa</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <div className="text-2xl">✅</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approvati</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <div className="text-2xl">❌</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rifiutati</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <label htmlFor="search" className="sr-only">Cerca documenti</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="text-gray-400">🔍</div>
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Cerca per cliente, nome documento o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                Filtra per Status:
              </label>
              <select
                id="status-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tutti</option>
                <option value="pending">In Attesa</option>
                <option value="approved">Approvati</option>
                <option value="rejected">Rifiutati</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">📋 Documenti ({filteredDocuments.length})</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-2xl mt-1">{getTypeIcon(doc.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {getStatusText(doc.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Cliente:</span> {doc.clientName}
                          <br />
                          <span className="text-xs text-gray-500">{doc.clientEmail}</span>
                        </div>
                        <div>
                          <span className="font-medium">Dimensione:</span> {doc.size}
                          <br />
                          <span className="text-xs text-gray-500">Caricato il {doc.uploadedAt}</span>
                        </div>
                        <div>
                          <span className="font-medium">Note:</span>
                          <br />
                          <span className="text-xs text-gray-500">{doc.notes || 'Nessuna nota'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <select
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                      value={doc.status}
                      onChange={(e) => updateDocumentStatus(doc.id, e.target.value)}
                    >
                      <option value="pending">In Attesa</option>
                      <option value="approved">Approva</option>
                      <option value="rejected">Rifiuta</option>
                    </select>
                    
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1">
                      Scarica
                    </button>
                    
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-2 py-1">
                      Visualizza
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredDocuments.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun documento trovato</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Prova a modificare i filtri di ricerca' 
                  : 'I clienti non hanno ancora caricato documenti'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
