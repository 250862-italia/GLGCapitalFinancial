'use client';

import { useState, useEffect } from 'react';
import { fetchWithCSRF, fetchJSONWithCSRF } from '@/lib/csrf-client';
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
  TrendingUp,
  Search,
  Filter,
  Users,
  AlertCircle,
  CheckSquare,
  XSquare,
  Clock as ClockIcon
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
  kyc_documents?: KYCDocument[];
  created_at: string;
  updated_at?: string;
  iban?: string;
  bic?: string;
  account_holder?: string;
  usdt_wallet?: string;
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
  total_invested?: number;
  risk_profile?: string;
}

export default function AdminKYCPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  useEffect(() => {
    fetchKYCDocuments();
  }, []);

  const fetchKYCDocuments = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      
      const response = await fetchWithCSRF('/api/admin/kyc', {
        headers: {
          'x-admin-token': adminToken || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        console.error('Failed to fetch KYC documents:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (clientId: string, documentId: string, status: 'approved' | 'rejected') => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      
      const response = await fetchJSONWithCSRF('/api/admin/kyc/update-status', {
        method: 'PUT',
        headers: {
          'x-admin-token': adminToken || ''
        },
        body: JSON.stringify({
          client_id: clientId,
          document_id: documentId,
          status: status
        }),
      });

      if (response.ok) {
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
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
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

  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return 'N/A';
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    total: clients.length,
    pending: clients.filter(c => c.status === 'pending').length,
    active: clients.filter(c => c.status === 'active').length,
    suspended: clients.filter(c => c.status === 'suspended').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading KYC documents...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KYC Management</h1>
              <p className="text-gray-600 mt-2">Review and manage client KYC documents and information</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-5 h-5" />
                <span>{clients.length} clients</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <CheckSquare className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Suspended</p>
                    <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                  </div>
                  <XSquare className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                All
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                className="flex items-center gap-2"
              >
                <ClockIcon className="w-4 h-4" />
                Pending
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
                className="flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                Approved
              </Button>
              <Button
                variant={filter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilter('rejected')}
                className="flex items-center gap-2"
              >
                <XSquare className="w-4 h-4" />
                Rejected
              </Button>
            </div>
          </div>
        </div>

        {/* Client Cards */}
        {filteredClients.length === 0 ? (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Clients Found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `No clients match "${searchTerm}"`
                  : 'No clients available for review.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          {client.first_name} {client.last_name}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {formatDate(client.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={`${
                        client.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                        client.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        client.status === 'suspended' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {safeRender(client.status) || 'pending'}
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                        className="flex items-center gap-2"
                      >
                        {expandedClient === client.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {expandedClient === client.id && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Personal Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Phone:</span>
                            <span className="text-sm font-medium">{safeRender(client.phone)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Date of Birth:</span>
                            <span className="text-sm font-medium">{formatDate(client.date_of_birth)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Nationality:</span>
                            <span className="text-sm font-medium">{safeRender(client.nationality)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Country:</span>
                            <span className="text-sm font-medium">{safeRender(client.country)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Financial Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Annual Income:</span>
                            <span className="text-sm font-medium">{formatCurrency(client.annual_income)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Net Worth:</span>
                            <span className="text-sm font-medium">{formatCurrency(client.net_worth)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Monthly Budget:</span>
                            <span className="text-sm font-medium">{formatCurrency(client.monthly_investment_budget)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Invested:</span>
                            <span className="text-sm font-medium">{formatCurrency(client.total_invested)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Banking Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Banking Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">IBAN:</span>
                            <span className="text-sm font-medium font-mono">{safeRender(client.iban)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">BIC:</span>
                            <span className="text-sm font-medium font-mono">{safeRender(client.bic)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Account Holder:</span>
                            <span className="text-sm font-medium">{safeRender(client.account_holder)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">USDT Wallet:</span>
                            <span className="text-sm font-medium font-mono">{safeRender(client.usdt_wallet)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Employment Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          Employment Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className="text-sm font-medium">{safeRender(client.employment_status)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Employer:</span>
                            <span className="text-sm font-medium">{safeRender(client.employer_name)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Job Title:</span>
                            <span className="text-sm font-medium">{safeRender(client.job_title)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Years Employed:</span>
                            <span className="text-sm font-medium">{safeRender(client.years_employed)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KYC Documents Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5" />
                        KYC Documents
                      </h3>
                      
                      {client.kyc_documents && client.kyc_documents.length > 0 ? (
                        <div className="space-y-3">
                          {client.kyc_documents
                            .filter(doc => filter === 'all' || doc.status === filter)
                            .map((document) => (
                            <div key={document.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {getStatusIcon(document.status)}
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {document.type}
                                    </h4>
                                    <p className="text-sm text-gray-600">{document.filename}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusBadge(document.status)}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(document.url, '_blank')}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
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
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p className="font-medium">No KYC documents uploaded</p>
                          <p className="text-sm">KYC document upload feature will be available soon</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 