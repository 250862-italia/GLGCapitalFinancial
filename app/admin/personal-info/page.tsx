"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  Edit, 
  X,
  Upload,
  Trash2
} from 'lucide-react';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

interface PersonalInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  bio: string;
  profile_photo: string;
  lastUpdated: string;
}

export default function PersonalInfoPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: 'Super Administrator',
    department: 'Management',
    bio: '',
    profile_photo: '',
    lastUpdated: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem("admin_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAdminUser(user);
      
      // Carica informazioni personali dal localStorage o usa dati di default
      const storedInfo = localStorage.getItem("admin_personal_info");
      if (storedInfo) {
        setPersonalInfo(JSON.parse(storedInfo));
      } else {
        // Dati di default basati sull'utente admin
        setPersonalInfo({
          id: user.id,
          first_name: user.name?.split(' ')[0] || 'Super',
          last_name: user.name?.split(' ')[1] || 'Admin',
          email: user.email,
          phone: '',
          position: 'Super Administrator',
          department: 'Management',
          bio: 'Experienced administrator with expertise in financial management and system administration.',
          profile_photo: '',
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }, []);

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      
      // Crea preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setPersonalInfo(prev => ({
      ...prev,
      profile_photo: ''
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Simula salvataggio con delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Aggiorna con la nuova foto se caricata
      const updatedInfo = {
        ...personalInfo,
        profile_photo: photoPreview || personalInfo.profile_photo,
        lastUpdated: new Date().toISOString()
      };

      // Salva nel localStorage
      localStorage.setItem("admin_personal_info", JSON.stringify(updatedInfo));
      
      setPersonalInfo(updatedInfo);
      setIsEditing(false);
      setPhotoFile(null);
      setMessage('Informazioni personali aggiornate con successo!');
      
      // Aggiorna anche l'utente admin nel localStorage
      const updatedUser = {
        ...adminUser,
        name: `${updatedInfo.first_name} ${updatedInfo.last_name}`,
        email: updatedInfo.email
      };
      localStorage.setItem("admin_user", JSON.stringify(updatedUser));
      setAdminUser(updatedUser);

    } catch (error) {
      setMessage('Errore durante il salvataggio. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview('');
    
    // Ricarica i dati originali
    const storedInfo = localStorage.getItem("admin_personal_info");
    if (storedInfo) {
      setPersonalInfo(JSON.parse(storedInfo));
    }
  };

  if (!adminUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1a2238',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminProtectedRoute>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: 'var(--primary)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Informazioni Personali
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              Gestisci il tuo profilo amministratore
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--primary)',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Edit size={16} />
              Modifica
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: 8,
            background: message.includes('successo') ? '#f0fdf4' : '#fef2f2',
            color: message.includes('successo') ? '#16a34a' : '#dc2626',
            border: `1px solid ${message.includes('successo') ? '#bbf7d0' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          
          {/* Photo Section */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              margin: '0 auto 1rem',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '3px solid #e5e7eb'
            }}>
              {(photoPreview || personalInfo.profile_photo) ? (
                <img
                  src={photoPreview || personalInfo.profile_photo}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={80} color="#9ca3af" />
              )}
            </div>

            {isEditing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: '#3b82f6',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  <Upload size={16} />
                  Carica Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
                
                {(photoPreview || personalInfo.profile_photo) && (
                  <button
                    onClick={removePhoto}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      background: '#ef4444',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600
                    }}
                  >
                    <Trash2 size={16} />
                    Rimuovi
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form Section */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Nome
                </label>
                <input
                  type="text"
                  value={personalInfo.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: isEditing ? '#fff' : '#f9fafb',
                    color: isEditing ? 'var(--foreground)' : '#6b7280'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Cognome
                </label>
                <input
                  type="text"
                  value={personalInfo.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: isEditing ? '#fff' : '#f9fafb',
                    color: isEditing ? 'var(--foreground)' : '#6b7280'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: isEditing ? '#fff' : '#f9fafb',
                    color: isEditing ? 'var(--foreground)' : '#6b7280'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Telefono
                </label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: isEditing ? '#fff' : '#f9fafb',
                    color: isEditing ? 'var(--foreground)' : '#6b7280'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Posizione
                </label>
                <input
                  type="text"
                  value={personalInfo.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: isEditing ? '#fff' : '#f9fafb',
                    color: isEditing ? 'var(--foreground)' : '#6b7280'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Dipartimento
                </label>
                <input
                  type="text"
                  value={personalInfo.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: isEditing ? '#fff' : '#f9fafb',
                    color: isEditing ? 'var(--foreground)' : '#6b7280'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                Biografia
              </label>
              <textarea
                value={personalInfo.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  background: isEditing ? '#fff' : '#f9fafb',
                  color: isEditing ? 'var(--foreground)' : '#6b7280',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Last Updated */}
            {personalInfo.lastUpdated && (
              <div style={{ 
                padding: '0.75rem', 
                background: '#f9fafb', 
                borderRadius: 6, 
                fontSize: 14, 
                color: '#6b7280',
                marginBottom: '1rem'
              }}>
                <strong>Ultimo aggiornamento:</strong> {new Date(personalInfo.lastUpdated).toLocaleString('it-IT')}
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#10b981',
                    color: '#fff',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  <Save size={16} />
                  {isLoading ? 'Salvando...' : 'Salva Modifiche'}
                </button>
                
                <button
                  onClick={handleCancel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#6b7280',
                    color: '#fff',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                  Annulla
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
} 