"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Banknote, 
  FileText, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  Globe, 
  Building, 
  MapPin, 
  CreditCard,
  Edit,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

interface ClientProfile {
  id: string;
  "userId": string;
  email: string;
  "firstName": string;
  "lastName": string;
  phone: string;
  company?: string;
  position?: string;
  "dateOfBirth"?: string;
  nationality?: string;
  "photoUrl"?: string;
  iban?: string;
  bic?: string;
  "accountHolder"?: string;
  "usdtWallet"?: string;
  status: string;
  kycStatus: string;
  country?: string;
  city?: string;
  address?: string;
  "createdAt": string;
  "updatedAt": string;
}

interface KYCData {
  id: string;
  "clientId": string;
  "documentType": string;
  "documentNumber": string;
  "documentImageUrl": string;
  status: string;
  notes?: string;
  "verifiedAt"?: string;
  "createdAt": string;
  "updatedAt": string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [kycData, setKycData] = useState<KYCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ClientProfile>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get client profile
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('"userId"', user.id)
        .single();

      if (clientError) {
        console.error('Error loading client profile:', clientError);
        setError('Failed to load profile data');
        return;
      }

      if (!clientData) {
        setError('No profile found. Please complete your registration.');
        return;
      }

      setProfile(clientData);
      setEditForm(clientData);

      // Get KYC data
      const { data: kycRecords, error: kycError } = await supabase
        .from('kyc_records')
        .select('*')
        .eq('"clientId"', clientData.id)
        .order('"createdAt"', { ascending: false });

      if (kycError) {
        console.error('Error loading KYC data:', kycError);
      } else {
        setKycData(kycRecords || []);
      }

    } catch (error) {
      console.error('Profile loading error:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;
    
    setSaving(true);
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          updates: editForm
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      
      if (result.success) {
        // Reload profile data
        await loadProfile();
        setEditing(false);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
      
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile || {});
    setEditing(false);
  };

  const getKycStatus = () => {
    if (kycData.length === 0) return { status: 'not_started', text: 'Not Started', color: '#6b7280' };
    
    const latestKyc = kycData[0];
    switch (latestKyc.status) {
      case 'approved': return { status: 'approved', text: 'Approved', color: '#059669' };
      case 'rejected': return { status: 'rejected', text: 'Rejected', color: '#dc2626' };
      case 'in_review': return { status: 'in_review', text: 'Under Review', color: '#f59e0b' };
      default: return { status: 'pending', text: 'Pending', color: '#f59e0b' };
    }
  };

  const getDocumentStatus = (documentType: string) => {
    const doc = kycData.find(d => d.documentType === documentType);
    return doc ? { uploaded: true, status: doc.status } : { uploaded: false, status: 'not_uploaded' };
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const result = await response.json();
      
      if (result.success) {
        // Reload profile data to show new photo
        await loadProfile();
      } else {
        throw new Error(result.error || 'Failed to upload photo');
      }
      
    } catch (error) {
      console.error('Photo upload error:', error);
      setError('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
        <p style={{ color: '#64748b', fontSize: 18 }}>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#dc2626" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24, color: '#0a2540' }}>Profile Error</h1>
        <p style={{ color: '#dc2626', fontSize: 18, marginBottom: '2rem' }}>{error}</p>
        <button
          onClick={() => router.push('/kyc')}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '0.75rem 1.5rem',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Complete KYC Process
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <User size={48} color="#6b7280" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24, color: '#0a2540' }}>Profile Not Found</h1>
        <p style={{ color: '#dc2626', fontSize: 18, marginBottom: '2rem' }}>No profile data found. Please complete your KYC process.</p>
        <button
          onClick={() => router.push('/kyc')}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '0.75rem 1.5rem',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Start KYC Process
        </button>
      </div>
    );
  }

  const kycStatus = getKycStatus();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 1rem', background: 'linear-gradient(135deg, #f8fafc 0%, #fef6e4 100%)', borderRadius: 24, boxShadow: '0 8px 32px rgba(10,37,64,0.10)' }}>
      {/* Header con avatar e nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 36, borderBottom: '2px solid #f3f4f6', paddingBottom: 32 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #0a2540 100%)', borderRadius: '50%', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(245,158,11,0.10)' }}>
            {profile.photoUrl ? (
              <img 
                src={profile.photoUrl} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <User size={48} color="#fff" />
            )}
          </div>
          {uploadingPhoto && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Loader2 size={24} color="white" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          <label style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            background: '#3b82f6',
            color: 'white',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 12,
            boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
          }}>
            <Edit size={16} />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
              disabled={uploadingPhoto}
            />
          </label>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', margin: 0 }}>
            {profile.firstName} {profile.lastName}
          </h1>
          <div style={{ color: '#64748b', fontSize: 18, marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Mail size={18} style={{ marginRight: 4 }} /> {profile.email}
            {profile.phone && (
              <>
                <Phone size={18} style={{ margin: '0 0 0 18px' }} /> {profile.phone}
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ 
              background: kycStatus.color, 
              color: 'white', 
              padding: '0.25rem 0.75rem', 
              borderRadius: 12, 
              fontSize: 12, 
              fontWeight: 600 
            }}>
              KYC: {kycStatus.text}
            </span>
            <span style={{ 
              background: profile.status === 'active' ? '#059669' : '#f59e0b', 
              color: 'white', 
              padding: '0.25rem 0.75rem', 
              borderRadius: 12, 
              fontSize: 12, 
              fontWeight: 600 
            }}>
              Status: {profile.status}
            </span>
          </div>
        </div>
        <div>
          {editing ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.5rem 1rem',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                Save
              </button>
              <button
                onClick={handleCancel}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.5rem 1rem',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '0.5rem 1rem',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Edit size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <ProfileSection icon={<User size={22} color="#f59e0b" />} title="Personal Information">
        <ProfileGrid>
          <ProfileField 
            label="First Name" 
            value={editing ? editForm.firstName : profile.firstName}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, firstName: value }))}
          />
          <ProfileField 
            label="Last Name" 
            value={editing ? editForm.lastName : profile.lastName}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, lastName: value }))}
          />
          <ProfileField 
            label="Date of Birth" 
            value={editing ? editForm.dateOfBirth : profile.dateOfBirth}
            icon={<Calendar size={16} />}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, dateOfBirth: value }))}
          />
          <ProfileField 
            label="Nationality" 
            value={editing ? editForm.nationality : profile.nationality}
            icon={<Globe size={16} />}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, nationality: value }))}
          />
          <ProfileField 
            label="Phone" 
            value={editing ? editForm.phone : profile.phone}
            icon={<Phone size={16} />}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, phone: value }))}
          />
          <ProfileField 
            label="Email" 
            value={profile.email}
            icon={<Mail size={16} />}
            editing={false}
          />
        </ProfileGrid>
      </ProfileSection>

      {/* Address Information */}
      <ProfileSection icon={<MapPin size={22} color="#3b82f6" />} title="Address Information">
        <ProfileGrid>
          <ProfileField 
            label="Address" 
            value={editing ? editForm.address : profile.address}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, address: value }))}
          />
          <ProfileField 
            label="City" 
            value={editing ? editForm.city : profile.city}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, city: value }))}
          />
          <ProfileField 
            label="Country" 
            value={editing ? editForm.country : profile.country}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, country: value }))}
          />
        </ProfileGrid>
      </ProfileSection>

      {/* Banking Information */}
      <ProfileSection icon={<CreditCard size={22} color="#059669" />} title="Banking Information">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Manage your banking details for investments</span>
          <a 
            href="/profile/banking" 
            style={{
              background: '#059669',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Edit Banking Info
          </a>
        </div>
        <ProfileGrid>
          <ProfileField 
            label="IBAN" 
            value={editing ? editForm.iban : profile.iban}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, iban: value }))}
          />
          <ProfileField 
            label="BIC/SWIFT" 
            value={editing ? editForm.bic : profile.bic}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, bic: value }))}
          />
          <ProfileField 
            label="Account Holder" 
            value={editing ? editForm.accountHolder : profile.accountHolder}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, accountHolder: value }))}
          />
          <ProfileField 
            label="USDT Wallet" 
            value={editing ? editForm.usdtWallet : profile.usdtWallet}
            editing={editing}
            onChange={(value) => setEditForm(prev => ({ ...prev, usdtWallet: value }))}
          />
        </ProfileGrid>
      </ProfileSection>

      {/* KYC Status */}
      <ProfileSection icon={<Shield size={22} color="#3b82f6" />} title="KYC Verification Status">
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              background: kycStatus.color 
            }} />
            <span style={{ fontWeight: 600, color: '#374151' }}>
              Overall Status: {kycStatus.text}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { type: 'PERSONAL_INFO', label: 'Personal Information' },
              { type: 'PROOF_OF_ADDRESS', label: 'Proof of Address' },
              { type: 'BANK_STATEMENT', label: 'Bank Statement' }
            ].map(({ type, label }) => {
              const docStatus = getDocumentStatus(type);
              return (
                <div key={type} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb'
                }}>
                  {docStatus.uploaded ? (
                    <CheckCircle size={16} color={docStatus.status === 'approved' ? '#059669' : '#f59e0b'} />
                  ) : (
                    <AlertCircle size={16} color="#6b7280" />
                  )}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                      {label}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: docStatus.uploaded ? (docStatus.status === 'approved' ? '#059669' : '#f59e0b') : '#6b7280'
                    }}>
                      {docStatus.uploaded ? docStatus.status : 'Not uploaded'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {kycStatus.status === 'not_started' && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => router.push('/kyc')}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '0.75rem 1.5rem',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Start KYC Process
            </button>
          </div>
        )}
      </ProfileSection>
    </div>
  );
}

function ProfileSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section style={{ margin: '2.5rem 0', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(10,37,64,0.06)', padding: '2rem 1.5rem', borderLeft: '6px solid #f59e0b' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        {icon}
        <h2 style={{ color: '#0a2540', fontSize: 22, fontWeight: 800, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ProfileGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      {children}
    </div>
  );
}

function ProfileField({ 
  label, 
  value, 
  icon, 
  editing = false, 
  onChange 
}: { 
  label: string; 
  value: any; 
  icon?: React.ReactNode; 
  editing?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div style={{ marginBottom: 10, background: '#f8fafc', borderRadius: 8, padding: '0.75rem 1rem', boxShadow: '0 1px 3px rgba(10,37,64,0.04)', transition: 'box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: 10 }}>
      {icon && <span>{icon}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>{label}</div>
        {editing && onChange ? (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              padding: '0.5rem',
              fontSize: 16,
              fontWeight: 500,
              color: '#1a3556',
              background: 'white'
            }}
          />
        ) : (
          <div style={{ color: '#1a3556', fontSize: 16, fontWeight: 500 }}>
            {value || <span style={{ color: '#d1d5db' }}>-</span>}
          </div>
        )}
      </div>
    </div>
  );
}
