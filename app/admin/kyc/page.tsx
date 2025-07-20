'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  User,
  Mail,
  Calendar
} from 'lucide-react';

interface KYCDocument {
  id: string;
  type: string;
  filename: string;
  url: string;
  uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  kyc_documents: KYCDocument[];
  created_at: string;
}

export default function AdminKYCPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchKYCDocuments();
  }, []);

  const fetchKYCDocuments = async () => {
    try {
      const response = await fetch('/api/admin/kyc');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        console.error('Failed to fetch KYC documents');
      }
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (clientId: string, documentId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/kyc/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          document_id: documentId,
          status: status
        }),
      });

      if (response.ok) {
        // Update local state
        setClients(prevClients => 
          prevClients.map(client => {
            if (client.id === clientId) {
              return {
                ...client,
                kyc_documents: client.kyc_documents.map(doc => 
                  doc.id === documentId ? { ...doc, status } : doc
                )
              };
            }
            return client;
          })
        );
      } else {
        console.error('Failed to update document status');
      }
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'identity_document': 'Identity Document',
      'proof_of_address': 'Proof of Address',
      'bank_statement': 'Bank Statement',
      'income_proof': 'Income Proof',
      'tax_document': 'Tax Document',
      'source_of_funds': 'Source of Funds',
      'other': 'Other Document'
    };
    return labels[type] || type;
  };

  const filteredClients = clients.filter(client => {
    if (filter === 'all') return true;
    return client.kyc_documents.some(doc => doc.status === filter);
  });

  const clientsWithKYC = filteredClients.filter(client => 
    client.kyc_documents && client.kyc_documents.length > 0
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading KYC documents...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Document Management</h1>
        <p className="text-gray-600">Review and manage client KYC documents</p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({clients.filter(c => c.kyc_documents?.length > 0).length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({clients.filter(c => c.kyc_documents?.some(d => d.status === 'pending')).length})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          Approved ({clients.filter(c => c.kyc_documents?.some(d => d.status === 'approved')).length})
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({clients.filter(c => c.kyc_documents?.some(d => d.status === 'rejected')).length})
        </Button>
      </div>

      {clientsWithKYC.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No KYC Documents Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No clients have uploaded KYC documents yet.'
                : `No documents with ${filter} status found.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {clientsWithKYC.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <CardTitle className="text-lg">
                        {client.first_name} {client.last_name}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined: {new Date(client.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {client.kyc_documents.length} document{client.kyc_documents.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client.kyc_documents
                    .filter(doc => filter === 'all' || doc.status === filter)
                    .map((document) => (
                    <div key={document.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(document.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {getDocumentTypeLabel(document.type)}
                            </h4>
                            <p className="text-sm text-gray-600">{document.filename}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(document.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Uploaded: {new Date(document.uploaded_at).toLocaleString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(document.url, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(document.url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          
                          {document.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => updateDocumentStatus(client.id, document.id, 'approved')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => updateDocumentStatus(client.id, document.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 