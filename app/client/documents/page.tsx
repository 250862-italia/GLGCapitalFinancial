'use client';

import Link from 'next/link';
import { Upload, FileText, Image, File, CheckCircle, XCircle, Clock, ArrowLeft, Download, Eye } from 'lucide-react';

export default function ClientDocuments() {
  const documents = [
    {
      id: '1',
      name: 'Documento_Identita.pdf',
      type: 'pdf' as const,
      size: '2.5 MB',
      uploadedAt: '15 Gennaio 2024',
      status: 'approved' as const
    },
    {
      id: '2',
      name: 'Certificato_Residenza.pdf',
      type: 'pdf' as const,
      size: '1.8 MB',
      uploadedAt: '14 Gennaio 2024',
      status: 'pending' as const
    },
    {
      id: '3',
      name: 'Busta_Paga_Gennaio.pdf',
      type: 'pdf' as const,
      size: '3.2 MB',
      uploadedAt: '13 Gennaio 2024',
      status: 'approved' as const
    },
    {
      id: '4',
      name: 'Foto_Tessera.jpg',
      type: 'image' as const,
      size: '450 KB',
      uploadedAt: '12 Gennaio 2024',
      status: 'rejected' as const
    },
    {
      id: '5',
      name: 'Contratto_Investimento.pdf',
      type: 'pdf' as const,
      size: '5.1 MB',
      uploadedAt: '10 Gennaio 2024',
      status: 'approved' as const
    }
  ];

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
      case 'pending': return 'In Revisione';
      case 'rejected': return 'Rifiutato';
      default: return 'Sconosciuto';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />;
      case 'doc': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'image': return <Image className="h-5 w-5 text-green-600" />;
      default: return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'doc': return 'Documento';
      case 'image': return 'Immagine';
      default: return 'Altro';
    }
  };

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
                <h1 className="text-2xl font-bold text-gray-900">📁 I Miei Documenti</h1>
                <p className="text-gray-600 mt-1">Gestisci e monitora i tuoi documenti</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {documents.filter(d => d.status === 'approved').length} di {documents.length} approvati
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Carica Nuovo Documento</h3>
            <p className="text-gray-600 mb-4">
              Trascina qui i file o clicca per selezionare. Supportiamo PDF, DOC e immagini.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Upload className="h-4 w-4 mr-2" />
              Seleziona File
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Dimensione massima: 10MB. I documenti verranno revisionati entro 24-48 ore.
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">📋 Documenti ({documents.length})</h2>
            <p className="text-sm text-gray-600 mt-1">
              Tutti i tuoi documenti caricati e il loro stato di approvazione
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {documents.map((document) => (
              <div key={document.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getTypeIcon(document.type)}</div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">{document.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {getStatusIcon(document.status)}
                          <span className="ml-1">{getStatusText(document.status)}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getTypeText(document.type)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Dimensione: {document.size}</span>
                        <span>•</span>
                        <span>Caricato: {document.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Legenda Stati</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Approvato - Documento verificato e accettato</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">In Revisione - In attesa di verifica</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Rifiutato - Richiede correzioni</span>
            </div>
          </div>
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
                <p>• I documenti vengono revisionati entro 24-48 ore lavorative</p>
                <p>• Mantieni sempre aggiornati i documenti scaduti</p>
                <p>• Contatta il supporto per problemi con l'upload</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
