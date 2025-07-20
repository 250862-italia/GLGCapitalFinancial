"use client";
export const dynamic = "force-dynamic";
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
import { fetchJSONWithCSRF } from '@/lib/csrf-client';
import { useAuth } from '@/hooks/use-auth';

interface ClientProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company?: string;
  position?: string;
  date_of_birth?: string;
  nationality?: string;
  profile_photo?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  iban?: string;
  bic?: string;
  account_holder?: string;
  usdt_wallet?: string;
  // Financial Information fields
  annual_income?: number;
  net_worth?: number;
  investment_experience?: string;
  risk_tolerance?: string;
  investment_goals?: any;
  preferred_investment_types?: any;
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
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ClientProfile>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    // If user is admin, don't try to load client profile
    if (user.role === 'admin' || user.role === 'superadmin') {
      console.log('User is admin, skipping client profile load');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get client profile via API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetchJSONWithCSRF(`/api/profile/${user.id}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const clientData = await response.json();
        setProfile(clientData);
      } else if (response.status === 404) {
        // Profile not found, create it automatically
        console.log('No client profile found for user:', user.id, '- Creating profile automatically');
        
        try {
          const createResponse = await fetchJSONWithCSRF('/api/profile/create', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id 
      }),
          });

          if (createResponse.ok) {
            const result = await createResponse.json();
            console.log('Profile created successfully:', result);
            
            // Fetch the newly created profile
            const newResponse = await fetchJSONWithCSRF(`/api/profile/${user.id}`);
            if (newResponse.ok) {
              const newClientData = await newResponse.json();
              setProfile(newClientData);
            } else {
              // If we can't fetch the created profile, use the result data
              if (result.data) {
                setProfile(result.data);
              } else {
                throw new Error('Profile created but could not be retrieved');
              }
            }
          } else {
            const errorData = await createResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create profile');
          }
        } catch (createError) {
          console.error('Error creating profile:', createError);
          setError(`Failed to create profile: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to load profile`);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Type guard per error
      const err = error as Error;
      // Provide more specific error messages
      if (err.name === 'AbortError') {
        setError('Request timeout - please check your internet connection and try again');
      } else if (err.message.includes('fetch failed')) {
        setError('Network error - please check your internet connection and try again');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server - please try again later');
      } else {
        setError(`Failed to load profile: ${err.message}`);
      }
      
      // Create a fallback profile for offline mode
      const fallbackProfile: ClientProfile = {
        id: `fallback-${user.id}`,
        user_id: user.id,
        email: user.email || '',
        first_name: user.name?.split(' ')[0] || '',
        last_name: user.name?.split(' ').slice(1).join(' ') || '',
        phone: '',
        company: '',
        position: '',
        date_of_birth: '',
        nationality: '',
        profile_photo: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
        iban: '',
        bic: '',
        account_holder: '',
        usdt_wallet: '',
        // Financial Information fields
        annual_income: 0,
        net_worth: 0,
        investment_experience: 'beginner',
        risk_tolerance: 'medium',
        investment_goals: {},
        preferred_investment_types: [],
        monthly_investment_budget: 0,
        emergency_fund: 0,
        debt_amount: 0,
        credit_score: 0,
        employment_status: '',
        employer_name: '',
        job_title: '',
        years_employed: 0,
        source_of_funds: '',
        tax_residency: '',
        tax_id: '',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const startEditingField = (fieldName: string, currentValue: any) => {
    setEditingField(fieldName);
    setEditForm(prev => ({ ...prev, [fieldName]: currentValue }));
  };

  const cancelEditingField = () => {
    setEditingField(null);
    setEditForm({});
  };

  const saveField = async (fieldName: string) => {
    if (!profile || !user) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetchJSONWithCSRF(`/api/profile/update`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          [fieldName]: editForm[fieldName]
        })
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, [fieldName]: editForm[fieldName] } : null);
        setEditingField(null);
        setEditForm({});
        setSuccessMessage(`${fieldName.replace(/_/g, ' ')} aggiornato con successo!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update field');
      }
    } catch (error) {
      console.error('Error updating field:', error);
      setError(`Errore nell'aggiornamento: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('user_id', user.id);

      const response = await fetchJSONWithCSRF('/api/profile/upload-photo', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, profile_photo: result.photo_url } : null);
        setSuccessMessage('Foto profilo aggiornata con successo!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(`Errore nel caricamento della foto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const formatDateForDisplay = (dateString: string | null | undefined) => {
    if (!dateString) return 'Non specificato';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT');
    } catch {
      return 'Data non valida';
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Non specificato';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Non specificato';
    return new Intl.NumberFormat('it-IT').format(value);
  };

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} className="animate-spin mx-auto mb-4" />
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} className="animate-spin mx-auto mb-4" />
          <p>Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
            Errore nel caricamento del profilo
          </h2>
          {error && (
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{error}</p>
          )}
          <button
            onClick={loadProfile}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc', 
      padding: '2rem' 
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '6px',
              color: '#6b7280'
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            color: '#1f2937', 
            margin: 0 
          }}>
            Profilo Utente
          </h1>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{ 
            background: '#d1fae5', 
            color: '#065f46', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#b91c1c', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 2fr', 
          gap: '2rem' 
        }}>
          {/* Profile Photo Section */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '2rem', 
            border: '1px solid #e5e7eb',
            height: 'fit-content'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                position: 'relative', 
                display: 'inline-block', 
                marginBottom: '1rem' 
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: profile.profile_photo ? `url(${profile.profile_photo})` : '#e5e7eb',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '3px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  {!profile.profile_photo && (
                    <User size={48} color="#9ca3af" />
                  )}
                </div>
                <label style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid white'
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
              {uploadingPhoto && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  <Loader2 size={16} className="animate-spin" />
                  Caricamento...
                </div>
              )}
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 600, 
                color: '#1f2937', 
                margin: '0.5rem 0' 
              }}>
                {profile.first_name} {profile.last_name}
              </h2>
              <p style={{ 
                color: '#6b7280', 
                margin: 0 
              }}>
                {profile.email}
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem' 
          }}>
            {/* Personal Information */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1.5rem' 
              }}>
                <User size={20} color="#3b82f6" />
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  margin: 0 
                }}>
                  Informazioni Personali
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <InlineEditableField
                  label="Nome"
                  value={profile.first_name}
                  fieldName="first_name"
                  editing={editingField === 'first_name'}
                  onStartEdit={() => startEditingField('first_name', profile.first_name)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('first_name')}
                  saving={saving}
                  icon={<User size={16} />}
                />
                <InlineEditableField
                  label="Cognome"
                  value={profile.last_name}
                  fieldName="last_name"
                  editing={editingField === 'last_name'}
                  onStartEdit={() => startEditingField('last_name', profile.last_name)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('last_name')}
                  saving={saving}
                  icon={<User size={16} />}
                />
                <InlineEditableField
                  label="Email"
                  value={profile.email}
                  fieldName="email"
                  editing={editingField === 'email'}
                  onStartEdit={() => startEditingField('email', profile.email)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('email')}
                  saving={saving}
                  icon={<Mail size={16} />}
                  type="email"
                />
                <InlineEditableField
                  label="Telefono"
                  value={profile.phone}
                  fieldName="phone"
                  editing={editingField === 'phone'}
                  onStartEdit={() => startEditingField('phone', profile.phone)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('phone')}
                  saving={saving}
                  icon={<Phone size={16} />}
                />
                <InlineEditableField
                  label="Data di Nascita"
                  value={formatDateForDisplay(profile.date_of_birth)}
                  fieldName="date_of_birth"
                  editing={editingField === 'date_of_birth'}
                  onStartEdit={() => startEditingField('date_of_birth', formatDateForInput(profile.date_of_birth))}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('date_of_birth')}
                  saving={saving}
                  icon={<Calendar size={16} />}
                  type="date"
                />
                <InlineEditableField
                  label="Nazionalità"
                  value={profile.nationality}
                  fieldName="nationality"
                  editing={editingField === 'nationality'}
                  onStartEdit={() => startEditingField('nationality', profile.nationality)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('nationality')}
                  saving={saving}
                  icon={<Globe size={16} />}
                />
                <InlineEditableField
                  label="Azienda"
                  value={profile.company}
                  fieldName="company"
                  editing={editingField === 'company'}
                  onStartEdit={() => startEditingField('company', profile.company)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('company')}
                  saving={saving}
                  icon={<Building size={16} />}
                />
                <InlineEditableField
                  label="Posizione"
                  value={profile.position}
                  fieldName="position"
                  editing={editingField === 'position'}
                  onStartEdit={() => startEditingField('position', profile.position)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('position')}
                  saving={saving}
                  icon={<User size={16} />}
                />
              </div>
            </div>

            {/* Address Information */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1.5rem' 
              }}>
                <MapPin size={20} color="#059669" />
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  margin: 0 
                }}>
                  Indirizzo
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <InlineEditableField
                  label="Indirizzo"
                  value={profile.address}
                  fieldName="address"
                  editing={editingField === 'address'}
                  onStartEdit={() => startEditingField('address', profile.address)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('address')}
                  saving={saving}
                  icon={<MapPin size={16} />}
                />
                <InlineEditableField
                  label="Città"
                  value={profile.city}
                  fieldName="city"
                  editing={editingField === 'city'}
                  onStartEdit={() => startEditingField('city', profile.city)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('city')}
                  saving={saving}
                  icon={<MapPin size={16} />}
                />
                <InlineEditableField
                  label="Paese"
                  value={profile.country}
                  fieldName="country"
                  editing={editingField === 'country'}
                  onStartEdit={() => startEditingField('country', profile.country)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('country')}
                  saving={saving}
                  icon={<Globe size={16} />}
                />
                <InlineEditableField
                  label="CAP"
                  value={profile.postal_code}
                  fieldName="postal_code"
                  editing={editingField === 'postal_code'}
                  onStartEdit={() => startEditingField('postal_code', profile.postal_code)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('postal_code')}
                  saving={saving}
                  icon={<MapPin size={16} />}
                />
              </div>
            </div>

            {/* Banking Information */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1.5rem' 
              }}>
                <CreditCard size={20} color="#dc2626" />
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  margin: 0 
                }}>
                  Informazioni Bancarie
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <InlineEditableField
                  label="IBAN"
                  value={profile.iban}
                  fieldName="iban"
                  editing={editingField === 'iban'}
                  onStartEdit={() => startEditingField('iban', profile.iban)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('iban')}
                  saving={saving}
                  icon={<CreditCard size={16} />}
                />
                <InlineEditableField
                  label="BIC/SWIFT"
                  value={profile.bic}
                  fieldName="bic"
                  editing={editingField === 'bic'}
                  onStartEdit={() => startEditingField('bic', profile.bic)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('bic')}
                  saving={saving}
                  icon={<CreditCard size={16} />}
                />
                <InlineEditableField
                  label="Intestatario"
                  value={profile.account_holder}
                  fieldName="account_holder"
                  editing={editingField === 'account_holder'}
                  onStartEdit={() => startEditingField('account_holder', profile.account_holder)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('account_holder')}
                  saving={saving}
                  icon={<User size={16} />}
                />
                <InlineEditableField
                  label="Wallet USDT"
                  value={profile.usdt_wallet}
                  fieldName="usdt_wallet"
                  editing={editingField === 'usdt_wallet'}
                  onStartEdit={() => startEditingField('usdt_wallet', profile.usdt_wallet)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('usdt_wallet')}
                  saving={saving}
                  icon={<CreditCard size={16} />}
                />
              </div>
            </div>

            {/* Financial Information */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1.5rem' 
              }}>
                <Banknote size={20} color="#dc2626" />
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  margin: 0 
                }}>
                  Informazioni Finanziarie
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <InlineEditableField
                  label="Reddito Annuale (EUR)"
                  value={formatCurrency(profile.annual_income)}
                  fieldName="annual_income"
                  editing={editingField === 'annual_income'}
                  onStartEdit={() => startEditingField('annual_income', profile.annual_income)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('annual_income')}
                  saving={saving}
                  icon={<Banknote size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Patrimonio Netto (EUR)"
                  value={formatCurrency(profile.net_worth)}
                  fieldName="net_worth"
                  editing={editingField === 'net_worth'}
                  onStartEdit={() => startEditingField('net_worth', profile.net_worth)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('net_worth')}
                  saving={saving}
                  icon={<Banknote size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Budget Mensile Investimenti (EUR)"
                  value={formatCurrency(profile.monthly_investment_budget)}
                  fieldName="monthly_investment_budget"
                  editing={editingField === 'monthly_investment_budget'}
                  onStartEdit={() => startEditingField('monthly_investment_budget', profile.monthly_investment_budget)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('monthly_investment_budget')}
                  saving={saving}
                  icon={<Banknote size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Fondo Emergenza (EUR)"
                  value={formatCurrency(profile.emergency_fund)}
                  fieldName="emergency_fund"
                  editing={editingField === 'emergency_fund'}
                  onStartEdit={() => startEditingField('emergency_fund', profile.emergency_fund)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('emergency_fund')}
                  saving={saving}
                  icon={<Banknote size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Debito Totale (EUR)"
                  value={formatCurrency(profile.debt_amount)}
                  fieldName="debt_amount"
                  editing={editingField === 'debt_amount'}
                  onStartEdit={() => startEditingField('debt_amount', profile.debt_amount)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('debt_amount')}
                  saving={saving}
                  icon={<Banknote size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Punteggio di Credito"
                  value={formatNumber(profile.credit_score)}
                  fieldName="credit_score"
                  editing={editingField === 'credit_score'}
                  onStartEdit={() => startEditingField('credit_score', profile.credit_score)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('credit_score')}
                  saving={saving}
                  icon={<Shield size={16} />}
                  type="number"
                />
              </div>
            </div>

            {/* Employment and Investment Profile */}
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1.5rem' 
              }}>
                <Building size={20} color="#7c3aed" />
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  margin: 0 
                }}>
                  Lavoro e Profilo di Investimento
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <InlineEditableField
                  label="Stato Occupazionale"
                  value={profile.employment_status}
                  fieldName="employment_status"
                  editing={editingField === 'employment_status'}
                  onStartEdit={() => startEditingField('employment_status', profile.employment_status)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('employment_status')}
                  saving={saving}
                  icon={<Building size={16} />}
                />
                <InlineEditableField
                  label="Nome Datore di Lavoro"
                  value={profile.employer_name}
                  fieldName="employer_name"
                  editing={editingField === 'employer_name'}
                  onStartEdit={() => startEditingField('employer_name', profile.employer_name)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('employer_name')}
                  saving={saving}
                  icon={<Building size={16} />}
                />
                <InlineEditableField
                  label="Titolo di Lavoro"
                  value={profile.job_title}
                  fieldName="job_title"
                  editing={editingField === 'job_title'}
                  onStartEdit={() => startEditingField('job_title', profile.job_title)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('job_title')}
                  saving={saving}
                  icon={<User size={16} />}
                />
                <InlineEditableField
                  label="Anni di Impiego"
                  value={formatNumber(profile.years_employed)}
                  fieldName="years_employed"
                  editing={editingField === 'years_employed'}
                  onStartEdit={() => startEditingField('years_employed', profile.years_employed)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('years_employed')}
                  saving={saving}
                  icon={<Calendar size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Esperienza di Investimento"
                  value={profile.investment_experience}
                  fieldName="investment_experience"
                  editing={editingField === 'investment_experience'}
                  onStartEdit={() => startEditingField('investment_experience', profile.investment_experience)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('investment_experience')}
                  saving={saving}
                  icon={<FileText size={16} />}
                />
                <InlineEditableField
                  label="Tolleranza al Rischio"
                  value={profile.risk_tolerance}
                  fieldName="risk_tolerance"
                  editing={editingField === 'risk_tolerance'}
                  onStartEdit={() => startEditingField('risk_tolerance', profile.risk_tolerance)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('risk_tolerance')}
                  saving={saving}
                  icon={<Shield size={16} />}
                />
                <InlineEditableField
                  label="Fonte dei Fondi"
                  value={profile.source_of_funds}
                  fieldName="source_of_funds"
                  editing={editingField === 'source_of_funds'}
                  onStartEdit={() => startEditingField('source_of_funds', profile.source_of_funds)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('source_of_funds')}
                  saving={saving}
                  icon={<Banknote size={16} />}
                />
                <InlineEditableField
                  label="Residenza Fiscale"
                  value={profile.tax_residency}
                  fieldName="tax_residency"
                  editing={editingField === 'tax_residency'}
                  onStartEdit={() => startEditingField('tax_residency', profile.tax_residency)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('tax_residency')}
                  saving={saving}
                  icon={<Globe size={16} />}
                />
                <InlineEditableField
                  label="Codice Fiscale"
                  value={profile.tax_id}
                  fieldName="tax_id"
                  editing={editingField === 'tax_id'}
                  onStartEdit={() => startEditingField('tax_id', profile.tax_id)}
                  onCancel={cancelEditingField}
                  onSave={() => saveField('tax_id')}
                  saving={saving}
                  icon={<FileText size={16} />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Editable Field Component
function InlineEditableField({ 
  label, 
  value, 
  fieldName,
  editing = false, 
  onStartEdit,
  onCancel,
  onSave,
  saving = false,
  icon,
  type = "text"
}: { 
  label: string; 
  value: any; 
  fieldName: string;
  editing?: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
  icon?: React.ReactNode;
  type?: string;
}) {
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave();
    } else {
      onCancel();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const displayValue = value || 'Non specificato';

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.5rem' 
    }}>
      <label style={{ 
        fontSize: '0.875rem', 
        fontWeight: 500, 
        color: '#374151' 
      }}>
        {label}
      </label>
      
      {editing ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem' 
        }}>
          {icon && (
            <div style={{ color: '#6b7280' }}>
              {icon}
            </div>
          )}
          <input
            type={type}
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1
            }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0.75rem',
          background: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem' 
          }}>
            {icon && (
              <div style={{ color: '#6b7280' }}>
                {icon}
              </div>
            )}
            <span style={{ 
              fontSize: '0.875rem', 
              color: '#374151' 
            }}>
              {displayValue}
            </span>
          </div>
          <button
            onClick={onStartEdit}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <Edit size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
