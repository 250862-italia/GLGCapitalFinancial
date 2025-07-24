"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Mail, 
  User, 
  Phone, 
  Building, 
  Send, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { fetchWithCSRF } from '@/lib/csrf-client';

export default function InformationalRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: user?.email || '',
    phone: '',
    country: '',
    city: '',
    additional_notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use the new CSRF-enabled fetch
      const response = await fetchWithCSRF('/api/informational-request', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: user?.email || '',
          phone: '',
          country: '',
          city: '',
          additional_notes: ''
        });
      } else {
        throw new Error(result.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Request submission error:', error);
      setError('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateEmailPreview = () => {
    return `
Informational Request Form
GLG Equity Pledge

Involved Entities:
* GLG Capital Consulting LLC (USA)
* GLG Capital Group LLC (United States)

1. Subject of the Request
I, the undersigned, as a prospective participant, hereby request detailed information regarding the "GLG Equity Pledge" program, including but not limited to:
* Operational and legal structure
* Financial terms and durations
* Share pledge mechanism
* Repayment procedures and timelines
* Key risks and safeguards

2. Applicant's Declarations
* Voluntariness: I declare that this request is made of my own free will, without any solicitation or promotional activities by GLG Capital Consulting LLC, or their agents.
* Informational Purpose: I understand that the information provided is purely informational and does not constitute a contractual offer, investment advice, or recommendation under applicable securities laws.
* Independent Evaluation: I commit to independently assess, and if needed consult professional advisors on, the suitability of any potential investment decision.

3. Data Processing Consent (EU GDPR 2016/679)
I authorize GLG Capital Consulting LLC to process my personal data solely for the purposes of:
* Providing the requested information
* Complying with legal AML requirements
My data will not be shared with third parties for any other purposes.

4. U.S. Regulatory References
By submitting this form, you acknowledge that GLG Capital Consulting LLC operates in compliance with the following key U.S. laws and regulations:
* Securities Act of 1933 & Securities Exchange Act of 1934: Governing private placements and exempt offerings under Regulation D.
* Bank Secrecy Act (BSA) & USA PATRIOT Act: Mandating customer identification (CIP), suspicious activity monitoring, and AML due diligence.
* Investment Advisers Act of 1940: Applicable to advisory activities and fiduciary standards for U.S. investors.
* California Consumer Privacy Act (CCPA): Protecting personal data and consumer privacy for California residents.

5. Submission Channels
Please send the requested information via one of the following:
* Email: corefound@glgcapitalgroupllc.com

---
APPLICANT INFORMATION:
Name: ${formData.first_name} ${formData.last_name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Country: ${formData.country || 'Not provided'}
City: ${formData.city || 'Not provided'}
Additional Notes: ${formData.additional_notes || 'None'}

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
    `;
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '3rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: 500,
          width: '100%'
        }}>
          <CheckCircle size={64} color="#059669" style={{ marginBottom: '1rem' }} />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            color: '#1f2937', 
            marginBottom: '1rem' 
          }}>
            Request Sent Successfully
          </h1>
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Your informational request has been sent to GLG Capital Consulting LLC. 
            You will receive the requested documentation via email shortly.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              router.push('/dashboard');
            }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Form Section */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <FileText size={48} style={{ marginBottom: '1rem' }} />
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 700, 
              marginBottom: '0.5rem' 
            }}>
              Informational Request Form
            </h1>
            <p style={{ 
              fontSize: '16px', 
              opacity: 0.9,
              maxWidth: 400,
              margin: '0 auto'
            }}>
              Request detailed information about the GLG Equity Pledge program
            </p>
          </div>

          {/* Form */}
          <div style={{ padding: '2rem' }}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '1rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#dc2626'
              }}>
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '16px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 600, 
                  color: '#374151' 
                }}>
                  Additional Notes
                </label>
                <textarea
                                  value={formData.additional_notes}
                onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                  rows={4}
                  placeholder="Any additional information or specific questions..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: '16px',
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  marginBottom: '1rem' 
                }}>
                  Important Notice
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}>
                  By submitting this form, you acknowledge that this request is made of your own free will 
                  and that the information provided is purely informational. This does not constitute 
                  investment advice or a contractual offer.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  style={{
                    background: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 32px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Section */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          position: 'sticky',
          top: '2rem'
        }}>
          {/* Preview Header */}
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              color: '#1f2937' 
            }}>
              Email Preview
            </h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '14px'
              }}
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          {/* Preview Content */}
          {showPreview && (
            <div style={{ 
              padding: '1.5rem',
              maxHeight: '600px',
              overflow: 'auto'
            }}>
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '1.5rem',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#374151',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace'
              }}>
                {generateEmailPreview()}
              </div>
              
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 8,
                fontSize: '14px',
                color: '#0369a1'
              }}>
                <strong>Note:</strong> This is exactly what will be sent to GLG Capital Consulting LLC. 
                Please review carefully before submitting.
              </div>
            </div>
          )}

          {!showPreview && (
            <div style={{ 
              padding: '3rem 1.5rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <Eye size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Click "Show Preview" to see exactly what will be sent</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 