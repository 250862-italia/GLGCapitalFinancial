"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Download, User, Shield, Plus, Edit, Trash2, Search, Filter, Upload, Image as ImageIcon } from 'lucide-react';

interface KYCApplication {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  documents: string[];
  documentImages: { [key: string]: string }; // URL delle immagini per ogni documento
  riskLevel: 'Low' | 'Medium' | 'High';
  notes: string;
  phone?: string;
  nationality?: string;
  dateOfBirth?: string;
}

const initialKYCApplications: KYCApplication[] = [
  {
    id: '1',
    name: "Mario Rossi",
    email: "mario.rossi@email.com",
    status: "pending",
    submittedDate: "2024-03-20",
    documents: ["ID Card", "Proof of Address", "Financial Statement"],
    documentImages: {
      "ID Card": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop",
      "Proof of Address": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
      "Financial Statement": "https://images.unsplash.com/photo-1554224154-26032cdc0d0b?w=400&h=300&fit=crop"
    },
    riskLevel: "Low",
    notes: "Complete documentation provided",
    phone: "+39 123 456 7890",
    nationality: "Italian",
    dateOfBirth: "1985-05-15"
  },
  {
    id: '2',
    name: "Giulia Bianchi",
    email: "giulia.bianchi@email.com",
    status: "approved",
    submittedDate: "2024-03-18",
    documents: ["Passport", "Bank Statement", "Income Certificate"],
    documentImages: {
      "Passport": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
      "Bank Statement": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop",
      "Income Certificate": "https://images.unsplash.com/photo-1554224154-26032cdc0d0b?w=400&h=300&fit=crop"
    },
    riskLevel: "Medium",
    notes: "Approved after verification",
    phone: "+39 987 654 3210",
    nationality: "Italian",
    dateOfBirth: "1990-08-22"
  },
  {
    id: '3',
    name: "Luca Verdi",
    email: "luca.verdi@email.com",
    status: "rejected",
    submittedDate: "2024-03-15",
    documents: ["ID Card", "Proof of Address"],
    documentImages: {
      "ID Card": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
      "Proof of Address": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop"
    },
    riskLevel: "High",
    notes: "Incomplete documentation",
    phone: "+39 555 123 4567",
    nationality: "Italian",
    dateOfBirth: "1978-12-03"
  }
];

export default function KYCManagementPage() {
  const [kycApplications, setKYCApplications] = useState<KYCApplication[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<KYCApplication>>({
    id: undefined,
    name: '',
    email: '',
    status: 'pending',
    submittedDate: new Date().toISOString().slice(0, 10),
    documents: [],
    documentImages: {},
    riskLevel: 'Low',
    notes: '',
    phone: '',
    nationality: '',
    dateOfBirth: ''
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kyc-applications');
    if (saved) {
      setKYCApplications(JSON.parse(saved));
    } else {
      setKYCApplications(initialKYCApplications);
    }
  }, []);

  // Save to localStorage whenever applications change
  useEffect(() => {
    localStorage.setItem('kyc-applications', JSON.stringify(kycApplications));
  }, [kycApplications]);

  const resetForm = () => {
    setFormData({
      id: undefined,
      name: '',
      email: '',
      status: 'pending',
      submittedDate: new Date().toISOString().slice(0, 10),
      documents: [],
      documentImages: {},
      riskLevel: 'Low',
      notes: '',
      phone: '',
      nationality: '',
      dateOfBirth: ''
    });
    setIsEdit(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (app: KYCApplication) => {
    setFormData(app);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit && formData.id) {
      const updatedApplications = kycApplications.map(app => 
        app.id === formData.id ? { ...app, ...formData } : app
      );
      setKYCApplications(updatedApplications);
    } else {
      const newApplication: KYCApplication = {
        ...formData as KYCApplication,
        id: Date.now().toString(),
        submittedDate: new Date().toISOString().slice(0, 10),
        documentImages: formData.documentImages || {}
      };
      setKYCApplications([...kycApplications, newApplication]);
    }
    setShowForm(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const documents = e.target.value.split(',').map(doc => doc.trim()).filter(doc => doc);
    setFormData(prev => ({ ...prev, documents }));
  };

  const handleImageUpload = (documentName: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setFormData(prev => ({
        ...prev,
        documentImages: {
          ...prev.documentImages,
          [documentName]: imageUrl
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const deleteApplication = (id: string) => {
    if (confirm('Are you sure you want to delete this KYC application?')) {
      setKYCApplications(kycApplications.filter(app => app.id !== id));
    }
  };

  const updateStatus = (id: string, status: 'pending' | 'approved' | 'rejected') => {
    setKYCApplications(kycApplications.map(app => 
      app.id === id ? { ...app, status } : app
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const filteredApplications = kycApplications
    .filter(app => activeTab === 'all' || app.status === activeTab)
    .filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = [
    { label: "Total Applications", value: kycApplications.length, icon: User, color: '#3b82f6' },
    { label: "Pending Review", value: kycApplications.filter(k => k.status === 'pending').length, icon: Clock, color: '#f59e0b' },
    { label: "Approved", value: kycApplications.filter(k => k.status === 'approved').length, icon: CheckCircle, color: '#10b981' },
    { label: "Rejected", value: kycApplications.filter(k => k.status === 'rejected').length, icon: XCircle, color: '#ef4444' },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>KYC Management</h1>
          <p style={{ color: 'var(--foreground)', fontSize: 18, opacity: 0.8 }}>Client verification and compliance management</p>
        </div>
        <button
          onClick={openAddForm}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            border: 'none',
            background: 'var(--primary)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={20} />
          Add New Application
        </button>
      </div>
      
      {/* STATS */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {stats.map((stat, index) => (
            <div key={index} style={{ 
              background: 'var(--secondary)', 
              padding: '1.5rem', 
              borderRadius: 12, 
              border: '2px solid #e0e3eb',
              textAlign: 'center'
            }}>
              <stat.icon size={32} style={{ color: stat.color, margin: '0 auto 0.5rem auto' }} />
              <div style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ color: 'var(--foreground)', fontSize: 14, opacity: 0.8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  borderRadius: 8,
                  border: '2px solid #e0e3eb',
                  fontSize: 16,
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { id: 'all', name: 'All Applications', count: kycApplications.length },
            { id: 'pending', name: 'Pending', count: kycApplications.filter(k => k.status === 'pending').length },
            { id: 'approved', name: 'Approved', count: kycApplications.filter(k => k.status === 'approved').length },
            { id: 'rejected', name: 'Rejected', count: kycApplications.filter(k => k.status === 'rejected').length },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveTab(filter.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 6,
                border: 'none',
                background: activeTab === filter.id ? 'var(--primary)' : 'var(--secondary)',
                color: activeTab === filter.id ? '#fff' : 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {filter.name}
              <span style={{ 
                background: activeTab === filter.id ? 'rgba(255,255,255,0.2)' : 'var(--primary)', 
                color: activeTab === filter.id ? '#fff' : 'var(--secondary)',
                padding: '0.2rem 0.5rem', 
                borderRadius: 12, 
                fontSize: 12, 
                fontWeight: 700 
              }}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* APPLICATIONS LIST */}
      <section>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredApplications.map((app) => {
            const StatusIcon = getStatusIcon(app.status);
            return (
              <div key={app.id} style={{ 
                background: 'var(--secondary)', 
                padding: '2rem', 
                borderRadius: 12, 
                border: '2px solid #e0e3eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, margin: 0 }}>{app.name}</h3>
                      <span style={{ 
                        background: getStatusColor(app.status), 
                        color: '#fff', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: 12, 
                        fontSize: 12, 
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>
                        {app.status}
                      </span>
                      <span style={{ 
                        background: app.riskLevel === 'Low' ? '#10b981' : app.riskLevel === 'Medium' ? '#f59e0b' : '#ef4444', 
                        color: '#fff', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: 12, 
                        fontSize: 12, 
                        fontWeight: 600
                      }}>
                        {app.riskLevel} Risk
                      </span>
                    </div>
                    <p style={{ color: 'var(--foreground)', margin: 0, opacity: 0.8 }}>{app.email}</p>
                    {app.phone && <p style={{ color: 'var(--foreground)', margin: '0.25rem 0 0 0', fontSize: 14 }}>Phone: {app.phone}</p>}
                    <p style={{ color: 'var(--foreground)', margin: '0.25rem 0 0 0', fontSize: 14 }}>Submitted: {app.submittedDate}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => openEditForm(app)}
                      style={{ 
                        padding: '0.5rem', 
                        borderRadius: 6, 
                        border: '1px solid #e0e3eb', 
                        background: '#fff', 
                        cursor: 'pointer',
                        color: 'var(--primary)'
                      }}
                      title="Edit Application"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => deleteApplication(app.id)}
                      style={{ 
                        padding: '0.5rem', 
                        borderRadius: 6, 
                        border: '1px solid #e0e3eb', 
                        background: '#fff', 
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                      title="Delete Application"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button style={{ 
                      padding: '0.5rem', 
                      borderRadius: 6, 
                      border: '1px solid #e0e3eb', 
                      background: '#fff', 
                      cursor: 'pointer',
                      color: 'var(--primary)'
                    }}
                    title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button style={{ 
                      padding: '0.5rem', 
                      borderRadius: 6, 
                      border: '1px solid #e0e3eb', 
                      background: '#fff', 
                      cursor: 'pointer',
                      color: 'var(--primary)'
                    }}
                    title="Download Documents"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                {/* DOCUMENTS WITH IMAGES */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--primary)', fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>Documents & Images</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {app.documents.map((doc, index) => (
                      <div key={index} style={{ 
                        background: '#fff', 
                        padding: '1rem', 
                        borderRadius: 8, 
                        border: '1px solid #e0e3eb'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <ImageIcon size={16} color="#6b7280" />
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>{doc}</span>
                        </div>
                        {app.documentImages[doc] && (
                          <div style={{ position: 'relative' }}>
                            <img
                              src={app.documentImages[doc]}
                              alt={doc}
                              style={{
                                width: '100%',
                                height: '120px',
                                objectFit: 'cover',
                                borderRadius: 6,
                                cursor: 'pointer',
                                border: '1px solid #e0e3eb'
                              }}
                              onClick={() => setSelectedImage(app.documentImages[doc])}
                            />
                            <button
                              onClick={() => setSelectedImage(app.documentImages[doc])}
                              style={{
                                position: 'absolute',
                                top: '0.25rem',
                                right: '0.25rem',
                                background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                padding: '0.25rem',
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        )}
                        {!app.documentImages[doc] && (
                          <div style={{
                            width: '100%',
                            height: '120px',
                            background: '#f3f4f6',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6b7280',
                            fontSize: 12
                          }}>
                            No image uploaded
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--primary)', fontSize: 16, fontWeight: 600, marginBottom: '0.5rem' }}>Notes</h4>
                    <p style={{ color: 'var(--foreground)', fontSize: 14, margin: 0 }}>{app.notes}</p>
                  </div>
                </div>

                {/* QUICK ACTIONS */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e3eb' }}>
                  <h4 style={{ color: 'var(--primary)', fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(app.id, 'approved')}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 6,
                            border: 'none',
                            background: '#10b981',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: 14
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, 'rejected')}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 6,
                            border: 'none',
                            background: '#ef4444',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: 14
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {app.status !== 'pending' && (
                      <button
                        onClick={() => updateStatus(app.id, 'pending')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 6,
                          border: 'none',
                          background: '#f59e0b',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: 14
                        }}
                      >
                        Mark as Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredApplications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--foreground)', opacity: 0.6 }}>
            <Shield size={48} style={{ margin: '0 auto 1rem auto' }} />
            <h3>No KYC applications found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </section>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={selectedImage}
              alt="Document"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-2rem',
                right: 0,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '2rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '2rem',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>
              {isEdit ? 'Edit KYC Application' : 'Add New KYC Application'}
            </h2>
            
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 6,
                      border: '2px solid #e0e3eb',
                      fontSize: 16
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 6,
                      border: '2px solid #e0e3eb',
                      fontSize: 16
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 6,
                      border: '2px solid #e0e3eb',
                      fontSize: 16
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 6,
                      border: '2px solid #e0e3eb',
                      fontSize: 16
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 6,
                      border: '2px solid #e0e3eb',
                      fontSize: 16
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Risk Level</label>
                  <select
                    name="riskLevel"
                    value={formData.riskLevel}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 6,
                      border: '2px solid #e0e3eb',
                      fontSize: 16
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Documents (comma-separated)</label>
                <input
                  type="text"
                  name="documents"
                  value={formData.documents?.join(', ')}
                  onChange={handleDocumentChange}
                  placeholder="ID Card, Passport, Proof of Address..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 6,
                    border: '2px solid #e0e3eb',
                    fontSize: 16
                  }}
                />
              </div>

              {/* DOCUMENT IMAGES UPLOAD */}
              {formData.documents && formData.documents.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Document Images</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {formData.documents.map((doc, index) => (
                      <div key={index} style={{ 
                        background: '#f9fafb', 
                        padding: '1rem', 
                        borderRadius: 8, 
                        border: '1px solid #e0e3eb'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <ImageIcon size={16} color="#6b7280" />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{doc}</span>
                        </div>
                        {formData.documentImages?.[doc] ? (
                          <div style={{ position: 'relative' }}>
                            <img
                              src={formData.documentImages[doc]}
                              alt={doc}
                              style={{
                                width: '100%',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: 6,
                                border: '1px solid #e0e3eb'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                documentImages: {
                                  ...prev.documentImages,
                                  [doc]: ''
                                }
                              }))}
                              style={{
                                position: 'absolute',
                                top: '0.25rem',
                                right: '0.25rem',
                                background: 'rgba(239,68,68,0.9)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                padding: '0.25rem',
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100px',
                            border: '2px dashed #d1d5db',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative'
                          }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(doc, file);
                              }}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer'
                              }}
                            />
                            <div style={{ textAlign: 'center', color: '#6b7280' }}>
                              <Upload size={24} style={{ margin: '0 auto 0.5rem auto' }} />
                              <div style={{ fontSize: 12 }}>Upload Image</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 6,
                    border: '2px solid #e0e3eb',
                    fontSize: 16,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 6,
                    border: '2px solid #e0e3eb',
                    background: '#fff',
                    color: 'var(--foreground)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 6,
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isEdit ? 'Update Application' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 