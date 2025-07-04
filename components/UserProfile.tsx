"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle,
  Edit,
  FileText,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../lib/supabase';

interface UserProfileProps {
  onKycComplete?: () => void;
}

interface KYCStatus {
  status: 'pending' | 'approved' | 'rejected' | 'in_review' | 'not_started';
  documents: {
    idDocument: boolean;
    proofOfAddress: boolean;
    bankStatement: boolean;
  };
  lastUpdated?: string;
}

export default function UserProfile({ onKycComplete }: UserProfileProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<KYCStatus>({
    status: 'not_started',
    documents: {
      idDocument: false,
      proofOfAddress: false,
      bankStatement: false
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadKycStatus();
    }
  }, [user]);

  const loadKycStatus = async () => {
    if (!user) return;
    
    try {
      // Check if KYC records exist for this user
      const { data, error } = await supabase
        .from('kyc_records')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading KYC status:', error);
        return;
      }

      if (data && data.length > 0) {
        // Determine the general status
        const latestRecord = data[0];
        const status = latestRecord.status as KYCStatus['status'];
        
        // Check which documents have been uploaded
        const documents = {
          idDocument: data.some(d => d.document_type === 'idDocument'),
          proofOfAddress: data.some(d => d.document_type === 'proofOfAddress'),
          bankStatement: data.some(d => d.document_type === 'bankStatement')
        };

        setKycStatus({
          status,
          documents,
          lastUpdated: latestRecord.updated_at
        });
      }
    } catch (error) {
      console.error('Error loading KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKycStatusIcon = () => {
    switch (kycStatus.status) {
      case 'approved':
        return <CheckCircle size={24} color="#059669" />;
      case 'rejected':
        return <XCircle size={24} color="#dc2626" />;
      case 'in_review':
        return <Clock size={24} color="#f59e0b" />;
      case 'pending':
        return <AlertCircle size={24} color="#f59e0b" />;
      default:
        return <AlertCircle size={24} color="#6b7280" />;
    }
  };

  const getKycStatusText = () => {
    switch (kycStatus.status) {
      case 'approved':
        return 'KYC Approved';
      case 'rejected':
        return 'KYC Rejected';
      case 'in_review':
        return 'KYC Under Review';
      case 'pending':
        return 'KYC Incomplete';
      default:
        return 'KYC Not Started';
    }
  };

  const getKycStatusColor = () => {
    switch (kycStatus.status) {
      case 'approved':
        return '#059669';
      case 'rejected':
        return '#dc2626';
      case 'in_review':
        return '#f59e0b';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getCompletionPercentage = () => {
    const totalDocs = 3;
    const completedDocs = Object.values(kycStatus.documents).filter(Boolean).length;
    return Math.round((completedDocs / totalDocs) * 100);
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'white', 
        borderRadius: 16, 
        padding: '2rem',
        boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
        textAlign: 'center'
      }}>
        <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: 16, 
      padding: '2rem',
      boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
              {user?.name || 'User'}
            </h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {user?.email || 'email@example.com'}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getKycStatusIcon()}
          <span style={{ 
            color: getKycStatusColor(), 
            fontWeight: 600,
            fontSize: '14px'
          }}>
            {getKycStatusText()}
          </span>
        </div>
      </div>

      {/* KYC Status Section */}
      <div style={{ 
        background: '#f8fafc', 
        borderRadius: 12, 
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
            KYC Verification Status
          </h3>
          {kycStatus.status !== 'approved' && (
            <button
              onClick={() => router.push('/kyc')}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '0.5rem 1rem',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Edit size={16} />
              {kycStatus.status === 'not_started' ? 'Start KYC' : 'Complete KYC'}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Completion: {getCompletionPercentage()}%
            </span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {Object.values(kycStatus.documents).filter(Boolean).length}/3 documents
            </span>
          </div>
          <div style={{
            width: '100%',
            height: 8,
            background: '#e5e7eb',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${getCompletionPercentage()}%`,
              height: '100%',
              background: getCompletionPercentage() === 100 ? '#059669' : '#3b82f6',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Document Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { key: 'idDocument', label: 'Identity Document', icon: FileText },
            { key: 'proofOfAddress', label: 'Proof of Address', icon: MapPin },
            { key: 'bankStatement', label: 'Bank Statement', icon: CreditCard }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'white',
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <Icon size={20} color={kycStatus.documents[key as keyof typeof kycStatus.documents] ? '#059669' : '#9ca3af'} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  {label}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: kycStatus.documents[key as keyof typeof kycStatus.documents] ? '#059669' : '#6b7280'
                }}>
                  {kycStatus.documents[key as keyof typeof kycStatus.documents] ? 'Uploaded' : 'Not uploaded'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Message */}
        {kycStatus.status === 'not_started' && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: 8,
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e' }}>
              <AlertCircle size={16} />
              <strong>Attention:</strong> To start investing, you must complete KYC verification.
            </div>
          </div>
        )}

        {kycStatus.status === 'in_review' && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bae6fd',
            borderRadius: 8,
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af' }}>
              <Clock size={16} />
              <strong>Under Review:</strong> Your documents are being verified. You will receive a notification when the process is complete.
            </div>
          </div>
        )}

        {kycStatus.status === 'rejected' && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b' }}>
              <XCircle size={16} />
              <strong>Rejected:</strong> Your KYC has been rejected. Contact support for more details.
            </div>
          </div>
        )}

        {kycStatus.status === 'approved' && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534' }}>
              <CheckCircle size={16} />
              <strong>Approved:</strong> Your KYC has been approved! You can now operate freely.
            </div>
          </div>
        )}
      </div>

      {/* User Info */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>
          Personal Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mail size={16} color="#6b7280" />
            <span style={{ color: '#374151' }}>{user?.email || 'Not specified'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={16} color="#6b7280" />
            <span style={{ color: '#374151' }}>{user?.name || 'Not specified'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={16} color="#6b7280" />
            <span style={{ color: '#374151' }}>Role: {user?.role || 'Client'}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 