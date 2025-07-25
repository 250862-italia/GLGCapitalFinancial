"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import { useSafeRouter } from "@/lib/safe-router";
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
import { fetchJSONWithCSRF, fetchFormDataWithCSRF, fetchWithCSRF } from '@/lib/csrf-client';
import { useAuth } from '@/hooks/use-auth';
import KYCDocumentUpload from '@/components/kyc/KYCDocumentUpload';

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
  investment_preferences?: any; // Added missing field
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
  kyc_documents?: any[]; // Optional since it doesn't exist in database yet
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useSafeRouter();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<Record<string, any>>({});
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
  const [investments, setInvestments] = useState<any[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadInvestments();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Use fetchWithCSRF instead of fetchJSONWithCSRF to get the Response object
      const response = await fetchWithCSRF(`/api/profile/${user.id}`, {
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
          const createResponse = await fetchWithCSRF('/api/profile/create', {
            method: 'POST',
            body: JSON.stringify({ user_id: user.id })
          });

          if (createResponse.ok) {
            const result = await createResponse.json();
            console.log('Profile created successfully:', result);
            
            // Fetch the newly created profile
            const newResponse = await fetchWithCSRF(`/api/profile/${user.id}`);
            if (newResponse.ok) {
              const newClientData = await newResponse.json();
              setProfile(newClientData);
            } else {
              // If we can't fetch the created profile, use the result data
              setProfile(result);
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
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadInvestments = async () => {
    if (!user) return;
    
    setLoadingInvestments(true);
    try {
      const response = await fetchWithCSRF(`/api/investments?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setInvestments(data.investments || data || []);
      } else {
        console.error('Failed to load investments');
      }
    } catch (error) {
      console.error('Error loading investments:', error);
    }
    setLoadingInvestments(false);
  };

  const startEditingField = (fieldName: string, currentValue: any) => {
    setEditingFields(prev => new Set([...prev, fieldName]));
    setEditForm(prev => ({ ...prev, [fieldName]: currentValue }));
    setOriginalData(prev => ({ ...prev, [fieldName]: currentValue }));
  };

  const cancelEditingField = (fieldName?: string) => {
    if (fieldName) {
      setEditingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
      setEditForm(prev => {
        const newForm = { ...prev };
        delete newForm[fieldName];
        return newForm;
      });
      setOriginalData(prev => {
        const newData = { ...prev };
        delete newData[fieldName];
        return newData;
      });
    } else {
      setEditingFields(new Set());
      setEditForm({});
      setOriginalData({});
    }
    setHasChanges(false);
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    console.log('🔄 Field change:', fieldName, 'Value:', value);
    
    setEditForm(prev => ({ ...prev, [fieldName]: value }));
    
    // Check if value has changed from original
    const originalValue = originalData[fieldName];
    const hasChanged = value !== originalValue;
    
    console.log('📊 Change detection:', {
      fieldName,
      newValue: value,
      originalValue,
      hasChanged
    });
    
    if (hasChanged) {
      setHasChanges(true);
      console.log('✅ Changes detected, save button enabled');
    } else {
      // Check if any other fields have changes
      const currentEditForm = { ...editForm, [fieldName]: value };
      const otherFieldsHaveChanges = Object.keys(currentEditForm).some(key => {
        if (key === fieldName) return false;
        return currentEditForm[key] !== originalData[key];
      });
      setHasChanges(otherFieldsHaveChanges);
      console.log('📊 Other fields have changes:', otherFieldsHaveChanges);
    }
  };

  const saveAllChanges = async () => {
    if (!profile || !user || !hasChanges) return;
    
    setSaving(true);
    setError(null);
    
    try {
      console.log('💾 Starting to save changes...');
      
      // Prepare all changed fields
      const changedFields: Record<string, any> = {};
      Object.keys(editForm).forEach(fieldName => {
        const currentValue = editForm[fieldName];
        const originalValue = originalData[fieldName];
        if (currentValue !== originalValue) {
          changedFields[fieldName] = currentValue;
        }
      });

      console.log('📝 Changed fields:', changedFields);

      if (Object.keys(changedFields).length === 0) {
        console.log('ℹ️ No changes to save');
        setSaving(false);
        return;
      }

      const response = await fetchWithCSRF(`/api/profile/update`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          ...changedFields
        })
      });

      console.log('📡 Save response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Save successful:', result);
        
        // Update profile with all changed fields
        setProfile(prev => {
          const updated = prev ? { ...prev, ...changedFields } : null;
          console.log('🔄 Profile state updated:', updated);
          return updated;
        });
        
        // Reset editing state
        setEditingFields(new Set());
        setEditForm({});
        setOriginalData({});
        setHasChanges(false);
        
        setSuccessMessage('All changes saved successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Reload profile to ensure consistency
        setTimeout(() => {
          console.log('🔄 Reloading profile for consistency...');
          loadProfile();
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Save failed:', errorData);
        throw new Error(errorData.error || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setError(`Save error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const cancelAllChanges = () => {
    setEditingFields(new Set());
    setEditForm({});
    setOriginalData({});
    setHasChanges(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    setError(null);

    try {
      console.log('📸 Starting photo upload...');
      console.log('📁 File:', file.name, 'Size:', file.size, 'Type:', file.type);

      const formData = new FormData();
      formData.append('photo', file);
      formData.append('user_id', user.id);

      const response = await fetchFormDataWithCSRF('/api/profile/upload-photo', {
        method: 'POST',
        body: formData
      });

      console.log('📡 Photo upload response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Photo upload successful:', result);
        
        setProfile(prev => {
          const updated = prev ? { ...prev, profile_photo: result.photo_url } : null;
          console.log('🔄 Profile photo updated:', updated?.profile_photo);
          return updated;
        });
        
        setSuccessMessage('Profile photo updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Reload profile to ensure consistency
        setTimeout(() => {
          console.log('🔄 Reloading profile after photo upload...');
          loadProfile();
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Photo upload failed:', errorData);
        throw new Error(errorData.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(`Photo upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US');
    } catch {
      return 'Invalid date';
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Not specified';
    return new Intl.NumberFormat('en-US').format(value);
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
          <p>Loading...</p>
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
          <p>Loading profile...</p>
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
            Error loading profile
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
            Try Again
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
          justifyContent: 'space-between',
          marginBottom: '2rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem' 
          }}>
            <button
              onClick={() => {
                console.log('🔘 Back to Dashboard button clicked!');
                console.log('Router state:', { router, isReady: !!router });
                
                // Try multiple navigation methods
                try {
                  if (router && typeof router.push === 'function') {
                    console.log('Using router.push');
                    router.push('/dashboard');
                  } else {
                    console.log('Router not ready, using window.location');
                    window.location.href = '/dashboard';
                  }
                } catch (error) {
                  console.error('Router error:', error);
                  console.log('Falling back to window.location');
                  window.location.href = '/dashboard';
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#f3f4f6',
                  color: '#374151'
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              <ArrowLeft size={24} />
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>Back to Dashboard</span>
            </button>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 700, 
              color: '#1f2937', 
              margin: 0 
            }}>
              User Profile
            </h1>
          </div>

          {/* Save/Cancel Buttons */}
          {hasChanges && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem' 
            }}>
              <button
                onClick={cancelAllChanges}
                disabled={saving}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1
                }}
              >
                Cancel All
              </button>
              <button
                onClick={saveAllChanges}
                disabled={saving}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          )}
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
                  Uploading...
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
                  Personal Information
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <InlineEditableField
                  label="First Name"
                  value={profile.first_name}
                  fieldName="first_name"
                  editing={editingFields.has('first_name')}
                  onStartEdit={() => {
                    if (editingFields.has('first_name')) {
                      cancelEditingField('first_name');
                    } else {
                      startEditingField('first_name', profile.first_name);
                    }
                  }}
                  onFieldChange={handleFieldChange}
                  icon={<User size={16} />}
                />
                <InlineEditableField
                  label="Last Name"
                  value={profile.last_name}
                  fieldName="last_name"
                  editing={editingFields.has('last_name')}
                  onStartEdit={() => startEditingField('last_name', profile.last_name)}
                  onFieldChange={handleFieldChange}
                  icon={<User size={16} />}
                />
                <InlineEditableField
                  label="Email"
                  value={profile.email}
                  fieldName="email"
                  editing={editingFields.has('email')}
                  onStartEdit={() => startEditingField('email', profile.email)}
                  onFieldChange={handleFieldChange}
                  icon={<Mail size={16} />}
                  type="email"
                />
                <InlineEditableField
                  label="Phone"
                  value={profile.phone}
                  fieldName="phone"
                  editing={editingFields.has('phone')}
                  onStartEdit={() => startEditingField('phone', profile.phone)}
                  onFieldChange={handleFieldChange}
                  icon={<Phone size={16} />}
                />
                <InlineEditableField
                  label="Date of Birth"
                  value={formatDateForDisplay(profile.date_of_birth)}
                  fieldName="date_of_birth"
                  editing={editingFields.has('date_of_birth')}
                  onStartEdit={() => startEditingField('date_of_birth', formatDateForInput(profile.date_of_birth))}
                  onFieldChange={handleFieldChange}
                  icon={<Calendar size={16} />}
                  type="date"
                />
                <InlineEditableField
                  label="Nationality"
                  value={profile.nationality}
                  fieldName="nationality"
                  editing={editingFields.has('nationality')}
                  onStartEdit={() => startEditingField('nationality', profile.nationality)}
                  onFieldChange={handleFieldChange}
                  icon={<Globe size={16} />}
                  options={[
                    { value: 'italian', label: 'Italian' },
                    { value: 'american', label: 'American' },
                    { value: 'british', label: 'British' },
                    { value: 'german', label: 'German' },
                    { value: 'french', label: 'French' },
                    { value: 'spanish', label: 'Spanish' },
                    { value: 'swiss', label: 'Swiss' },
                    { value: 'dutch', label: 'Dutch' },
                    { value: 'belgian', label: 'Belgian' },
                    { value: 'austrian', label: 'Austrian' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <InlineEditableField
                  label="Company"
                  value={profile.company}
                  fieldName="company"
                  editing={editingFields.has('company')}
                  onStartEdit={() => startEditingField('company', profile.company)}
                  onFieldChange={handleFieldChange}
                  icon={<Building size={16} />}
                />
                <InlineEditableField
                  label="Position"
                  value={profile.position}
                  fieldName="position"
                  editing={editingFields.has('position')}
                  onStartEdit={() => startEditingField('position', profile.position)}
                  onFieldChange={handleFieldChange}
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
                  Address
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <InlineEditableField
                  label="Address"
                  value={profile.address}
                  fieldName="address"
                  editing={editingFields.has('address')}
                  onStartEdit={() => startEditingField('address', profile.address)}
                  onFieldChange={handleFieldChange}
                  icon={<MapPin size={16} />}
                />
                <InlineEditableField
                  label="City"
                  value={profile.city}
                  fieldName="city"
                  editing={editingFields.has('city')}
                  onStartEdit={() => startEditingField('city', profile.city)}
                  onFieldChange={handleFieldChange}
                  icon={<MapPin size={16} />}
                />
                <InlineEditableField
                  label="Country"
                  value={profile.country}
                  fieldName="country"
                  editing={editingFields.has('country')}
                  onStartEdit={() => startEditingField('country', profile.country)}
                  onFieldChange={handleFieldChange}
                  icon={<Globe size={16} />}
                  options={[
                    { value: 'italy', label: 'Italy' },
                    { value: 'united_states', label: 'United States' },
                    { value: 'united_kingdom', label: 'United Kingdom' },
                    { value: 'germany', label: 'Germany' },
                    { value: 'france', label: 'France' },
                    { value: 'spain', label: 'Spain' },
                    { value: 'switzerland', label: 'Switzerland' },
                    { value: 'netherlands', label: 'Netherlands' },
                    { value: 'belgium', label: 'Belgium' },
                    { value: 'austria', label: 'Austria' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <InlineEditableField
                  label="Postal Code"
                  value={profile.postal_code}
                  fieldName="postal_code"
                  editing={editingFields.has('postal_code')}
                  onStartEdit={() => startEditingField('postal_code', profile.postal_code)}
                  onFieldChange={handleFieldChange}
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
                  Banking Information
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
                  editing={editingFields.has('iban')}
                  onStartEdit={() => startEditingField('iban', profile.iban)}
                  onFieldChange={handleFieldChange}
                  icon={<CreditCard size={16} />}
                />
                <InlineEditableField
                  label="BIC/SWIFT"
                  value={profile.bic}
                  fieldName="bic"
                  editing={editingFields.has('bic')}
                  onStartEdit={() => startEditingField('bic', profile.bic)}
                  onFieldChange={handleFieldChange}
                  icon={<CreditCard size={16} />}
                />
                <InlineEditableField
                  label="Account Holder"
                  value={profile.account_holder}
                  fieldName="account_holder"
                  editing={editingFields.has('account_holder')}
                  onStartEdit={() => startEditingField('account_holder', profile.account_holder)}
                  onFieldChange={handleFieldChange}
                  icon={<User size={16} />}
                />
                <InlineEditableField
                  label="USDT Wallet"
                  value={profile.usdt_wallet}
                  fieldName="usdt_wallet"
                  editing={editingFields.has('usdt_wallet')}
                  onStartEdit={() => startEditingField('usdt_wallet', profile.usdt_wallet)}
                  onFieldChange={handleFieldChange}
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
                  Financial Information
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <InlineEditableField
                  label="Annual Income (USD)"
                  value={formatCurrency(profile.annual_income)}
                  fieldName="annual_income"
                  editing={editingFields.has('annual_income')}
                  onStartEdit={() => startEditingField('annual_income', profile.annual_income)}
                  onFieldChange={handleFieldChange}
                  icon={<Banknote size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Net Worth (USD)"
                  value={formatCurrency(profile.net_worth)}
                  fieldName="net_worth"
                  editing={editingFields.has('net_worth')}
                  onStartEdit={() => startEditingField('net_worth', profile.net_worth)}
                  onFieldChange={handleFieldChange}
                  icon={<Banknote size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Monthly Investment Budget (USD)"
                  value={formatCurrency(profile.monthly_investment_budget)}
                  fieldName="monthly_investment_budget"
                  editing={editingFields.has('monthly_investment_budget')}
                  onStartEdit={() => startEditingField('monthly_investment_budget', profile.monthly_investment_budget)}
                  onFieldChange={handleFieldChange}
                  icon={<Banknote size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Emergency Fund (USD)"
                  value={formatCurrency(profile.emergency_fund)}
                  fieldName="emergency_fund"
                  editing={editingFields.has('emergency_fund')}
                  onStartEdit={() => startEditingField('emergency_fund', profile.emergency_fund)}
                  onFieldChange={handleFieldChange}
                  icon={<Banknote size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Total Debt (USD)"
                  value={formatCurrency(profile.debt_amount)}
                  fieldName="debt_amount"
                  editing={editingFields.has('debt_amount')}
                  onStartEdit={() => startEditingField('debt_amount', profile.debt_amount)}
                  onFieldChange={handleFieldChange}
                  icon={<Banknote size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Credit Score"
                  value={formatNumber(profile.credit_score)}
                  fieldName="credit_score"
                  editing={editingFields.has('credit_score')}
                  onStartEdit={() => startEditingField('credit_score', profile.credit_score)}
                  onFieldChange={handleFieldChange}
                  icon={<Shield size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Investment Goals"
                  value={profile.investment_goals}
                  fieldName="investment_goals"
                  editing={editingFields.has('investment_goals')}
                  onStartEdit={() => startEditingField('investment_goals', profile.investment_goals)}
                  onFieldChange={handleFieldChange}
                  icon={<FileText size={16} />}
                  options={[
                    { value: 'retirement', label: 'Retirement' },
                    { value: 'wealth_building', label: 'Wealth Building' },
                    { value: 'income_generation', label: 'Income Generation' },
                    { value: 'tax_optimization', label: 'Tax Optimization' },
                    { value: 'diversification', label: 'Diversification' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <InlineEditableField
                  label="Preferred Investment Types"
                  value={profile.preferred_investment_types}
                  fieldName="preferred_investment_types"
                  editing={editingFields.has('preferred_investment_types')}
                  onStartEdit={() => startEditingField('preferred_investment_types', profile.preferred_investment_types)}
                  onFieldChange={handleFieldChange}
                  icon={<FileText size={16} />}
                  options={[
                    { value: 'stocks', label: 'Stocks' },
                    { value: 'bonds', label: 'Bonds' },
                    { value: 'real_estate', label: 'Real Estate' },
                    { value: 'commodities', label: 'Commodities' },
                    { value: 'cryptocurrency', label: 'Cryptocurrency' },
                    { value: 'mutual_funds', label: 'Mutual Funds' },
                    { value: 'etfs', label: 'ETFs' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <InlineEditableField
                  label="Investment Preferences"
                  value={profile.investment_preferences}
                  fieldName="investment_preferences"
                  editing={editingFields.has('investment_preferences')}
                  onStartEdit={() => startEditingField('investment_preferences', profile.investment_preferences)}
                  onFieldChange={handleFieldChange}
                  icon={<FileText size={16} />}
                  options={[
                    { value: 'conservative', label: 'Conservative' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'aggressive', label: 'Aggressive' },
                    { value: 'balanced', label: 'Balanced' },
                    { value: 'growth', label: 'Growth' },
                    { value: 'income', label: 'Income' },
                    { value: 'other', label: 'Other' }
                  ]}
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
                  Employment & Investment Profile
                </h3>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem' 
              }}>
                <InlineEditableField
                  label="Employment Status"
                  value={profile.employment_status}
                  fieldName="employment_status"
                  editing={editingFields.has('employment_status')}
                  onStartEdit={() => startEditingField('employment_status', profile.employment_status)}
                  onFieldChange={handleFieldChange}
                  icon={<Building size={16} />}
                  options={[
                    { value: 'employed', label: 'Employed' },
                    { value: 'self-employed', label: 'Self-Employed' },
                    { value: 'unemployed', label: 'Unemployed' },
                    { value: 'student', label: 'Student' },
                    { value: 'retired', label: 'Retired' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <InlineEditableField
                  label="Employer Name"
                  value={profile.employer_name}
                  fieldName="employer_name"
                  editing={editingFields.has('employer_name')}
                  onStartEdit={() => startEditingField('employer_name', profile.employer_name)}
                  onFieldChange={handleFieldChange}
                  icon={<Building size={16} />}
                />
                <InlineEditableField
                  label="Job Title"
                  value={profile.job_title}
                  fieldName="job_title"
                  editing={editingFields.has('job_title')}
                  onStartEdit={() => startEditingField('job_title', profile.job_title)}
                  onFieldChange={handleFieldChange}
                  icon={<User size={16} />}
                />
                <InlineEditableField
                  label="Years Employed"
                  value={formatNumber(profile.years_employed)}
                  fieldName="years_employed"
                  editing={editingFields.has('years_employed')}
                  onStartEdit={() => startEditingField('years_employed', profile.years_employed)}
                  onFieldChange={handleFieldChange}
                  icon={<Calendar size={16} />}
                  type="number"
                />
                <InlineEditableField
                  label="Investment Experience"
                  value={profile.investment_experience}
                  fieldName="investment_experience"
                  editing={editingFields.has('investment_experience')}
                  onStartEdit={() => startEditingField('investment_experience', profile.investment_experience)}
                  onFieldChange={handleFieldChange}
                  icon={<FileText size={16} />}
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                    { value: 'expert', label: 'Expert' }
                  ]}
                />
                <InlineEditableField
                  label="Risk Tolerance"
                  value={profile.risk_tolerance}
                  fieldName="risk_tolerance"
                  editing={editingFields.has('risk_tolerance')}
                  onStartEdit={() => startEditingField('risk_tolerance', profile.risk_tolerance)}
                  onFieldChange={handleFieldChange}
                  icon={<Shield size={16} />}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'very_high', label: 'Very High' }
                  ]}
                />
                <InlineEditableField
                  label="Source of Funds"
                  value={profile.source_of_funds}
                  fieldName="source_of_funds"
                  editing={editingFields.has('source_of_funds')}
                  onStartEdit={() => startEditingField('source_of_funds', profile.source_of_funds)}
                  onFieldChange={handleFieldChange}
                  icon={<Banknote size={16} />}
                  options={[
                    { value: 'savings', label: 'Savings' },
                    { value: 'investments', label: 'Investments' },
                    { value: 'inheritance', label: 'Inheritance' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <InlineEditableField
                  label="Tax Residency"
                  value={profile.tax_residency}
                  fieldName="tax_residency"
                  editing={editingFields.has('tax_residency')}
                  onStartEdit={() => startEditingField('tax_residency', profile.tax_residency)}
                  onFieldChange={handleFieldChange}
                  icon={<Globe size={16} />}
                  options={[
                    { value: 'italy', label: 'Italy' },
                    { value: 'united_states', label: 'United States' },
                    { value: 'united_kingdom', label: 'United Kingdom' },
                    { value: 'germany', label: 'Germany' },
                    { value: 'france', label: 'France' },
                    { value: 'spain', label: 'Spain' },
                    { value: 'switzerland', label: 'Switzerland' },
                    { value: 'netherlands', label: 'Netherlands' },
                    { value: 'belgium', label: 'Belgium' },
                    { value: 'austria', label: 'Austria' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <InlineEditableField
                  label="Tax ID"
                  value={profile.tax_id}
                  fieldName="tax_id"
                  editing={editingFields.has('tax_id')}
                  onStartEdit={() => startEditingField('tax_id', profile.tax_id)}
                  onFieldChange={handleFieldChange}
                  icon={<FileText size={16} />}
                />
              </div>
            </div>
          </div>

          {/* Investments Section */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '1.5rem', 
            border: '1px solid #e5e7eb',
            marginTop: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Banknote size={20} style={{ color: '#059669' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                I Miei Investimenti
              </h3>
            </div>
            
            {loadingInvestments ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: '#6b7280' }} />
                <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>Caricamento investimenti...</p>
              </div>
            ) : investments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <Banknote size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nessun investimento trovato</p>
                <p style={{ fontSize: '0.9rem' }}>I tuoi investimenti appariranno qui una volta creati</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {investments.map((investment) => (
                  <div key={investment.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1rem',
                    background: '#f9fafb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.25rem 0' }}>
                          {investment.package_name || `Pacchetto ${investment.package_id}`}
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
                          ID: {investment.id}
                        </p>
                      </div>
                      <span style={{
                        background: investment.status === 'active' ? '#bbf7d0' : 
                                   investment.status === 'completed' ? '#dbeafe' : '#fee2e2',
                        color: investment.status === 'active' ? '#16a34a' : 
                               investment.status === 'completed' ? '#2563eb' : '#dc2626',
                        borderRadius: '6px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {investment.status === 'active' ? 'Attivo' : 
                         investment.status === 'completed' ? 'Completato' : 
                         investment.status === 'cancelled' ? 'Cancellato' : investment.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Importo Investito</p>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          €{investment.amount?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Rendimento Totale</p>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#059669', margin: 0 }}>
                          €{investment.total_returns?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Rendimento Giornaliero</p>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#059669', margin: 0 }}>
                          €{investment.daily_returns?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Data Inizio</p>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          {investment.start_date ? new Date(investment.start_date).toLocaleDateString('it-IT') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {investment.notes && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '6px' }}>
                        <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0 }}>
                          <strong>Note:</strong> {investment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KYC Documents Section */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '1.5rem', 
            border: '1px solid #e5e7eb',
            marginTop: '1.5rem'
          }}>
            <KYCDocumentUpload 
              userId={user.id} 
              onDocumentsUpdate={(documents) => {
                setProfile(prev => prev ? { ...prev, kyc_documents: documents } : null);
              }}
            />
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
  onFieldChange,
  icon,
  type = "text",
  options = null
}: { 
  label: string; 
  value: any; 
  fieldName: string;
  editing?: boolean;
  onStartEdit: () => void;
  onFieldChange: (fieldName: string, value: any) => void;
  icon?: React.ReactNode;
  type?: string;
  options?: { value: string; label: string }[] | null;
}) {
  // Ensure value is not an empty object that could cause React rendering issues
  const safeValue = (typeof value === 'object' && value !== null && Object.keys(value).length === 0) ? null : value;
  
  const [editValue, setEditValue] = useState(() => {
    // Handle object/array values properly for the input field
    if (safeValue === null || safeValue === undefined) return '';
    if (typeof safeValue === 'object') {
      if (Array.isArray(safeValue)) {
        return safeValue.length > 0 ? safeValue.join(', ') : '';
      }
      const keys = Object.keys(safeValue);
      return keys.length > 0 ? keys.join(', ') : '';
    }
    return String(safeValue);
  });

  useEffect(() => {
    // Handle object/array values properly for the input field
    if (safeValue === null || safeValue === undefined) {
      setEditValue('');
    } else if (typeof safeValue === 'object') {
      if (Array.isArray(safeValue)) {
        setEditValue(safeValue.length > 0 ? safeValue.join(', ') : '');
      } else {
        const keys = Object.keys(safeValue);
        setEditValue(keys.length > 0 ? keys.join(', ') : '');
      }
    } else {
      setEditValue(String(safeValue));
    }
  }, [safeValue]);

  const handleChange = (newValue: any) => {
    setEditValue(newValue);
    onFieldChange(fieldName, newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Call cancelEditingField with the field name
      if (typeof onStartEdit === 'function') {
        // We need to pass the field name to cancel editing
        // For now, we'll just call onStartEdit which will toggle the field
        onStartEdit();
      }
    }
  };

  const formatDisplayValue = (val: any) => {
    try {
      if (val === null || val === undefined) return 'Not specified';
      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          return val.length > 0 ? val.join(', ') : 'None specified';
        }
        // For objects, check if it has any properties
        const keys = Object.keys(val);
        if (keys.length === 0) return 'None specified';
        // If it's an object with properties, try to stringify it safely
        try {
          return JSON.stringify(val);
        } catch {
          return keys.join(', ');
        }
      }
      // Handle empty strings
      if (val === '') return 'Not specified';
      // Handle any other falsy values
      if (!val) return 'Not specified';
      return String(val);
    } catch (error) {
      console.error('Error formatting display value:', error, val);
      return 'Error displaying value';
    }
  };

  const displayValue = formatDisplayValue(safeValue);

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
          {options ? (
            <select
              value={editValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                background: 'white'
              }}
              autoFocus
            >
              <option value="">Select an option...</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={editValue || ''}
              onChange={(e) => handleChange(e.target.value)}
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
          )}
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
