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
  Calendar,
  Phone,
  MapPin,
  Building,
  DollarSign,
  CreditCard,
  Briefcase,
  Target,
  Shield,
  TrendingUp
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
  phone?: string;
  date_of_birth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  status?: string;
  kyc_documents: KYCDocument[];
  created_at: string;
  updated_at?: string;
  // Banking Information
  iban?: string;
  bic?: string;
  account_holder?: string;
  usdt_wallet?: string;
  // Financial Information
  annual_income?: number;
  net_worth?: number;
  investment_experience?: string;
  risk_tolerance?: string;
  investment_goals?: string;
  preferred_investment_types?: string;
  monthly_investment_budget?: number;
  emergency_fund?: number;
  debt_amount?: number;
  credit_score?: number;
  employment_status?: string;
  employer_name?: string;
  job_title?: string;
  years_employed?: number;
  source_of_funds?: string;
  tax_residency?: string;
  tax_id?: string;
  // Investment Profile
  total_invested?: number;
  risk_profile?: string;
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

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                {/* Personal Information Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-medium">{client.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">DOB:</span>
                      <span className="text-sm font-medium">{formatDate(client.date_of_birth)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Nationality:</span>
                      <span className="text-sm font-medium">{client.nationality || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Country:</span>
                      <span className="text-sm font-medium">{client.country || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={`${
                        client.status === 'active' ? 'bg-green-100 text-green-800' :
                        client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        client.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Banking Information Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Banking Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">IBAN:</span>
                      <span className="text-sm font-medium font-mono">{client.iban || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">BIC:</span>
                      <span className="text-sm font-medium font-mono">{client.bic || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Account Holder:</span>
                      <span className="text-sm font-medium">{client.account_holder || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">USDT Wallet:</span>
                      <span className="text-sm font-medium font-mono">{client.usdt_wallet || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Annual Income:</span>
                      <span className="text-sm font-medium">{formatCurrency(client.annual_income)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Net Worth:</span>
                      <span className="text-sm font-medium">{formatCurrency(client.net_worth)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Monthly Budget:</span>
                      <span className="text-sm font-medium">{formatCurrency(client.monthly_investment_budget)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Emergency Fund:</span>
                      <span className="text-sm font-medium">{formatCurrency(client.emergency_fund)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Debt Amount:</span>
                      <span className="text-sm font-medium">{formatCurrency(client.debt_amount)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Credit Score:</span>
                      <span className="text-sm font-medium">{client.credit_score || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Employment Information Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Employment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="text-sm font-medium">{client.employment_status || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Employer:</span>
                      <span className="text-sm font-medium">{client.employer_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Job Title:</span>
                      <span className="text-sm font-medium">{client.job_title || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Years Employed:</span>
                      <span className="text-sm font-medium">{client.years_employed || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Source of Funds:</span>
                      <span className="text-sm font-medium">{client.source_of_funds || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Investment Profile Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Investment Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Experience:</span>
                      <span className="text-sm font-medium">{client.investment_experience || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Risk Tolerance:</span>
                      <span className="text-sm font-medium">{client.risk_tolerance || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Risk Profile:</span>
                      <span className="text-sm font-medium">{client.risk_profile || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Total Invested:</span>
                      <span className="text-sm font-medium">{formatCurrency(client.total_invested)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Investment Goals:</span>
                      <span className="text-sm font-medium">{client.investment_goals || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Preferred Types:</span>
                      <span className="text-sm font-medium">{client.preferred_investment_types || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Tax Information Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Tax Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Tax Residency:</span>
                      <span className="text-sm font-medium">{client.tax_residency || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Tax ID:</span>
                      <span className="text-sm font-medium font-mono">{client.tax_id || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* KYC Documents Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    KYC Documents
                  </h3>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 