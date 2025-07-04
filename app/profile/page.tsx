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
  CheckCircle,
  ArrowLeft,
  Camera
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
      let { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('"userId"', user.id)
        .single();

      if (clientError && clientError.code === 'PGRST116') {
        // Profile not found, create it automatically
        console.log('No client profile found for user:', user.id, '- Creating profile automatically');
        
        try {
          const response = await fetch('/api/profile/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Profile created successfully:', result);
            
            // Fetch the newly created profile
            const { data: newClientData, error: newClientError } = await supabase
              .from('clients')
              .select('*')
              .eq('"userId"', user.id)
              .single();

            if (newClientError) {
              console.error('Error fetching newly created profile:', newClientError);
              // Create a basic profile object to prevent errors
              clientData = {
                id: user.id,
                userId: user.id,
                email: user.email || '',
                firstName: '',
                lastName: '',
                phone: '',
                status: 'ACTIVE',
                kycStatus: 'PENDING',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              } as ClientProfile;
            } else {
              clientData = newClientData;
            }
          } else {
            console.error('Failed to create profile automatically');
            // Create a basic profile object to prevent errors
            clientData = {
              id: user.id,
              userId: user.id,
              email: user.email || '',
              firstName: '',
              lastName: '',
              phone: '',
              status: 'ACTIVE',
              kycStatus: 'PENDING',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as ClientProfile;
          }
        } catch (createError) {
          console.error('Error creating profile automatically:', createError);
          // Create a basic profile object to prevent errors
          clientData = {
            id: user.id,
            userId: user.id,
            email: user.email || '',
            firstName: '',
            lastName: '',
            phone: '',
            status: 'ACTIVE',
            kycStatus: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as ClientProfile;
        }
      } else if (clientError) {
        console.error('Error loading client profile:', clientError);
        // Create a basic profile object to prevent errors
        clientData = {
          id: user.id,
          userId: user.id,
          email: user.email || '',
          firstName: '',
          lastName: '',
          phone: '',
          status: 'ACTIVE',
          kycStatus: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as ClientProfile;
      }

      if (!clientData) {
        // Create a basic profile object to prevent errors
        clientData = {
          id: user.id,
          userId: user.id,
          email: user.email || '',
          firstName: '',
          lastName: '',
          phone: '',
          status: 'ACTIVE',
          kycStatus: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as ClientProfile;
      }

      setProfile(clientData);
      setEditForm(clientData);

      // Get KYC data (optional - don't fail if this doesn't work)
      try {
        const { data: kycRecords, error: kycError } = await supabase
          .from('kyc_records')
          .select('*')
          .eq('"clientId"', clientData.id)
          .order('"createdAt"', { ascending: false });

        if (kycError) {
          console.error('Error loading KYC data:', kycError);
          setKycData([]);
        } else {
          setKycData(kycRecords || []);
        }
      } catch (kycError) {
        console.error('Error loading KYC data:', kycError);
        setKycData([]);
      }

    } catch (error) {
      console.error('Profile loading error:', error);
      // Create a basic profile object to prevent errors
      const fallbackProfile = {
        id: user.id,
        userId: user.id,
        email: user.email || '',
        firstName: '',
        lastName: '',
        phone: '',
        status: 'ACTIVE',
        kycStatus: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as ClientProfile;
      
      setProfile(fallbackProfile);
      setEditForm(fallbackProfile);
      setKycData([]);
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

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <p style={{ color: '#64748b', fontSize: 18 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          padding: '3rem',
          boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
          textAlign: 'center',
          maxWidth: 500
        }}>
          <AlertCircle size={64} color="#dc2626" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '1rem' }}>
            Profile Error
          </h1>
          <p style={{ color: '#dc2626', marginBottom: '2rem' }}>{error}</p>
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
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          padding: '3rem',
          boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
          textAlign: 'center',
          maxWidth: 500
        }}>
          <User size={64} color="#6b7280" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '1rem' }}>
            Profile Not Found
          </h1>
          <p style={{ color: '#dc2626', marginBottom: '2rem' }}>No profile data found. Please complete your KYC process.</p>
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
      </div>
    );
  }

  const kycStatus = getKycStatus();

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="#6b7280" />
          </button>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', margin: 0 }}>
              User Profile
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Manage your personal information and KYC status
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
          overflow: 'hidden'
        }}>
          {/* Profile Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            color: 'white',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  borderRadius: '50%', 
                  width: 100, 
                  height: 100, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '3px solid rgba(255,255,255,0.3)'
                }}>
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
                  background: 'rgba(255,255,255,0.9)',
                  color: '#667eea',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  <Camera size={16} />
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
                <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, marginBottom: '0.5rem' }}>
                  {profile.firstName} {profile.lastName}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: 12, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    KYC: {kycStatus.text}
                  </span>
                  <span style={{ 
                    background: 'rgba(255,255,255,0.2)', 
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
                        background: 'rgba(255,255,255,0.9)',
                        color: '#059669',
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
                        background: 'rgba(255,255,255,0.9)',
                        color: '#6b7280',
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
                      background: 'rgba(255,255,255,0.9)',
                      color: '#667eea',
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
          </div>
          
          {/* Profile Content */}
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
              
              {/* Personal Information */}
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 12, 
                padding: '1.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <User size={20} color="#667eea" />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                    Personal Information
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                    icon={<Calendar size={14} />}
                    editing={editing}
                    onChange={(value) => setEditForm(prev => ({ ...prev, dateOfBirth: value }))}
                  />
                  <ProfileField 
                    label="Nationality" 
                    value={editing ? editForm.nationality : profile.nationality}
                    icon={<Globe size={14} />}
                    editing={editing}
                    onChange={(value) => setEditForm(prev => ({ ...prev, nationality: value }))}
                  />
                  <ProfileField 
                    label="Phone" 
                    value={editing ? editForm.phone : profile.phone}
                    icon={<Phone size={14} />}
                    editing={editing}
                    onChange={(value) => setEditForm(prev => ({ ...prev, phone: value }))}
                  />
                  <ProfileField 
                    label="Email" 
                    value={profile.email}
                    icon={<Mail size={14} />}
                    editing={false}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 12, 
                padding: '1.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <MapPin size={20} color="#059669" />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                    Address Information
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <ProfileField 
                    label="Address" 
                    value={editing ? editForm.address : profile.address}
                    editing={editing}
                    onChange={(value) => setEditForm(prev => ({ ...prev, address: value }))}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 12, 
                padding: '1.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <CreditCard size={20} color="#059669" />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                    Banking Information
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
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
                </div>
              </div>

              {/* KYC Status */}
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 12, 
                padding: '1.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Shield size={20} color="#3b82f6" />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                    KYC Verification Status
                  </h3>
                </div>
                
                <div style={{ 
                  background: 'white', 
                  borderRadius: 8, 
                  padding: '1rem',
                  border: '1px solid #e5e7eb'
                }}>
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
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
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
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: '#f9fafb',
                          borderRadius: 6,
                          border: '1px solid #f3f4f6'
                        }}>
                          {docStatus.uploaded ? (
                            <CheckCircle size={16} color={docStatus.status === 'approved' ? '#059669' : '#f59e0b'} />
                          ) : (
                            <AlertCircle size={16} color="#6b7280" />
                          )}
                          <div style={{ flex: 1 }}>
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
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
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
              </div>
            </div>
          </div>
        </div>
      </div>
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
    <div style={{ 
      background: 'white', 
      borderRadius: 8, 
      padding: '0.75rem',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ 
        color: '#6b7280', 
        fontSize: '12px', 
        fontWeight: 600, 
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        {icon && icon}
        {label}
      </div>
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
            fontSize: '14px',
            fontWeight: 500,
            color: '#1f2937',
            background: 'white'
          }}
        />
      ) : (
        <div style={{ 
          color: '#1f2937', 
          fontSize: '14px', 
          fontWeight: 500 
        }}>
          {value || <span style={{ color: '#d1d5db' }}>-</span>}
        </div>
      )}
    </div>
  );
}
