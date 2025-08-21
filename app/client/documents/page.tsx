'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  size: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function ClientDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchClientDocuments();
  }, []);

  const fetchClientDocuments = async () => {
    try {
      setLoading(true);
      
      // Recupera i dati del cliente dal localStorage
      const clientUser = localStorage.getItem('clientUser');
      if (!clientUser) {
        console.error('Utente cliente non autenticato');
        setLoading(false);
        return;
      }

      const user = JSON.parse(clientUser);
      
      // Chiama l'API per recuperare i documenti del cliente
      const response = await fetch(`/api/client/documents?clientEmail=${encodeURIComponent(user.email)}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Mappa i dati dal database al formato dell'interfaccia
          const mappedDocuments = result.data.documents.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.file_type,
            size: formatFileSize(doc.file_size),
            uploadedAt: new Date(doc.uploaded_at).toLocaleDateString('it-IT'),
            status: doc.status
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

  const handleFileUpload = async () => {
    try {
      setUploading(true);
      
      // Recupera i dati del cliente dal localStorage
      const clientUser = localStorage.getItem('clientUser');
      if (!clientUser) {
        alert('Utente cliente non autenticato');
        setUploading(false);
        return;
      }

      const user = JSON.parse(clientUser);
      
      // TODO: Implementare selezione file reale e upload
      // Per ora simuliamo un upload
      const mockDocument = {
        client_id: user.id || 'temp-id',
        name: 'Documento_Test.pdf',
        file_type: 'pdf',
        file_size: 1024 * 1024, // 1MB
        file_path: '/uploads/test-document.pdf',
        notes: 'Documento di test caricato'
      };

      const response = await fetch('/api/client/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockDocument)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Documento caricato con successo!');
          // Ricarica i documenti
          fetchClientDocuments();
        } else {
          alert('Errore nel caricamento: ' + result.message);
        }
      } else {
        alert('Errore HTTP nel caricamento');
      }
    } catch (error) {
      console.error('Errore nell\'upload:', error);
      alert('Errore nel caricamento del documento');
    } finally {
      setUploading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📁 I Miei Documenti</h1>
              <p className="text-gray-600 mt-1">Gestisci i tuoi documenti e certificati</p>
            </div>
            <Link 
              href="/client/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Torna alla Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📤 Carica Nuovo Documento</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📎</div>
            <p className="text-gray-600 mb-4">
              Trascina qui i tuoi documenti o clicca per selezionarli
            </p>
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleFileUpload}
            >
              {uploading ? 'Caricamento...' : 'Seleziona File'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Formati supportati: PDF, DOC, DOCX, JPG, PNG (max 10MB)
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">📋 Documenti Caricati</h2>
            <p className="text-sm text-gray-600 mt-1">
              {documents.length} documento{documents.length !== 1 ? 'i' : ''} trovato{documents.length !== 1 ? 'i' : ''}
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getTypeIcon(doc.type)}</div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>Caricato il {doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {getStatusText(doc.status)}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Scarica
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {documents.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun documento caricato</h3>
              <p className="text-gray-600">Inizia caricando il tuo primo documento per iniziare a investire</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="text-2xl">ℹ️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Informazioni sui Documenti</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• I documenti vengono verificati entro 24-48 ore</p>
                <p>• Mantieni sempre aggiornati i tuoi documenti di identità</p>
                <p>• I documenti approvati ti permettono di accedere a tutti i servizi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
