"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  X, 
  AlertCircle, 
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { fetchFormDataWithCSRF } from '@/lib/csrf-client';

interface KYCDocument {
  id: string;
  type: string;
  filename: string;
  url: string;
  uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface KYCDocumentUploadProps {
  userId: string;
  onDocumentsUpdate?: (documents: KYCDocument[]) => void;
}

const DOCUMENT_TYPES = [
  { value: 'identity_document', label: 'Documento d\'Identità (Carta d\'Identità/Passaporto)' },
  { value: 'proof_of_address', label: 'Proof of Address (Bolletta/Contratto)' },
  { value: 'bank_statement', label: 'Estratto Conto Bancario' },
  { value: 'income_proof', label: 'Prova di Reddito (Busta Paga/Certificato)' },
  { value: 'tax_document', label: 'Documento Fiscale (CUD/Modello 730)' },
  { value: 'source_of_funds', label: 'Prova della Provenienza dei Fondi' },
  { value: 'other', label: 'Altro Documento' }
];

export default function KYCDocumentUpload({ userId, onDocumentsUpdate }: KYCDocumentUploadProps) {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing documents on component mount
  useEffect(() => {
    loadExistingDocuments();
  }, [userId]);

  const loadExistingDocuments = async () => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.kyc_documents) {
          setDocuments(data.kyc_documents);
        }
      }
    } catch (error) {
      console.error('Error loading KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedType) {
      setError('Seleziona prima il tipo di documento');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato file non supportato. Usa PDF, JPG o PNG.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File troppo grande. Dimensione massima: 10MB');
      return;
    }

    await uploadDocument(file, selectedType);
  };

  const uploadDocument = async (file: File, documentType: string) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documentType);
      formData.append('user_id', userId);

      const response = await fetchFormDataWithCSRF('/api/profile/upload-kyc-document', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        const newDocument: KYCDocument = {
          id: result.document_id,
          type: documentType,
          filename: file.name,
          url: result.document_url,
          uploaded_at: new Date().toISOString(),
          status: 'pending'
        };

        setDocuments(prev => [...prev, newDocument]);
        setSuccess(`Documento ${getDocumentTypeLabel(documentType)} caricato con successo`);
        setSelectedType('');
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Notify parent component
        if (onDocumentsUpdate) {
          onDocumentsUpdate([...documents, newDocument]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Errore durante il caricamento del documento');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error instanceof Error ? error.message : 'Errore durante il caricamento');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetchJSONWithCSRF(`/api/profile/delete-kyc-document`, {
        method: 'DELETE',
        body: JSON.stringify({
          document_id: documentId,
          user_id: userId
        })
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        setSuccess('Documento eliminato con successo');
        
        if (onDocumentsUpdate) {
          onDocumentsUpdate(documents.filter(doc => doc.id !== documentId));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Errore durante l\'eliminazione');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(error instanceof Error ? error.message : 'Errore durante l\'eliminazione');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(dt => dt.value === type)?.label || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <X className="w-4 h-4 text-red-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Caricamento documenti...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-blue-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">Documenti KYC</h3>
      </div>

      {/* Upload Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Carica Nuovo Documento</h4>
        
        <div className="space-y-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleziona tipo di documento</option>
            {DOCUMENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading || !selectedType}
            />
            
            {uploading && (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Formati supportati: PDF, JPG, PNG. Dimensione massima: 10MB
        </p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Documenti Caricati</h4>
        
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nessun documento caricato</p>
            <p className="text-sm">Carica i documenti richiesti per completare la verifica KYC</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(doc.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getDocumentTypeLabel(doc.type)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.filename} • {new Date(doc.uploaded_at).toLocaleDateString('it-IT')}
                    </p>
                    {doc.notes && (
                      <p className="text-xs text-gray-600 mt-1">{doc.notes}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status === 'approved' && 'Approvato'}
                    {doc.status === 'rejected' && 'Rifiutato'}
                    {doc.status === 'pending' && 'In Revisione'}
                  </span>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => window.open(doc.url, '_blank')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Visualizza documento"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => window.open(doc.url, '_blank')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Scarica documento"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Elimina documento"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KYC Status Summary */}
      {documents.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Stato Verifica KYC</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {documents.filter(d => d.status === 'pending').length}
              </div>
              <div className="text-blue-700">In Revisione</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.status === 'approved').length}
              </div>
              <div className="text-blue-700">Approvati</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {documents.filter(d => d.status === 'rejected').length}
              </div>
              <div className="text-blue-700">Rifiutati</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 