"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Save, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

interface BankingInfo {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: string;
  accountHolder: string;
  iban?: string;
  bic?: string;
}

export default function BankingPage() {
  const router = useRouter();
  const [bankingInfo, setBankingInfo] = useState<BankingInfo>({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "",
    accountHolder: "",
    iban: "",
    bic: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Load existing banking info from localStorage
    const stored = localStorage.getItem("bankingInfo");
    if (stored) {
      setBankingInfo(JSON.parse(stored));
    }
  }, []);

  const handleInputChange = (field: keyof BankingInfo, value: string) => {
    setBankingInfo(prev => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!bankingInfo.bankName || !bankingInfo.accountNumber || !bankingInfo.accountHolder) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem("bankingInfo", JSON.stringify(bankingInfo));
      
      // Also save to bankDetails for dashboard compatibility
      const bankDetails = {
        iban: bankingInfo.iban || "",
        accountHolder: bankingInfo.accountHolder,
        bankName: bankingInfo.bankName,
        reason: "Investment payment"
      };
      localStorage.setItem("bankDetails", JSON.stringify(bankDetails));

      setSuccess("Banking information saved successfully!");
      
      // Redirect back to profile after 2 seconds
      setTimeout(() => {
        router.push("/profile");
      }, 2000);

    } catch (err) {
      setError("Failed to save banking information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #fef6e4 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        background: 'white',
        borderRadius: 16,
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(10,37,64,0.10)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2rem' }}>
          <button
            onClick={() => router.push("/profile")}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <ArrowLeft size={20} />
            Back to Profile
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #0a2540 100%)',
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <CreditCard size={40} color="#fff" />
          </div>
          <h1 style={{
            color: 'var(--primary)',
            fontSize: 28,
            fontWeight: 700,
            marginBottom: '0.5rem'
          }}>
            Banking Information
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: 16,
            margin: 0
          }}>
            Add your banking details to enable investments
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={20} color="#ef4444" />
            <span style={{ color: '#dc2626', fontSize: 14 }}>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <CheckCircle size={20} color="#16a34a" />
            <span style={{ color: '#166534', fontSize: 14 }}>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Bank Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                Bank Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={bankingInfo.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your bank name"
                required
              />
            </div>

            {/* Account Holder */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                Account Holder Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={bankingInfo.accountHolder}
                onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
                placeholder="Enter account holder name"
                required
              />
            </div>

            {/* Account Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                Account Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={bankingInfo.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your account number"
                required
              />
            </div>

            {/* Routing Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                Routing Number
              </label>
              <input
                type="text"
                value={bankingInfo.routingNumber}
                onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
                placeholder="Enter routing number (optional)"
              />
            </div>

            {/* Account Type */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                Account Type
              </label>
              <select
                value={bankingInfo.accountType}
                onChange={(e) => handleInputChange('accountType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select account type</option>
                <option value="checking">Checking Account</option>
                <option value="savings">Savings Account</option>
                <option value="business">Business Account</option>
                <option value="investment">Investment Account</option>
              </select>
            </div>

            {/* IBAN */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                IBAN (International Bank Account Number)
              </label>
              <input
                type="text"
                value={bankingInfo.iban}
                onChange={(e) => handleInputChange('iban', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
                placeholder="Enter IBAN (optional)"
              />
            </div>

            {/* BIC/SWIFT */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                BIC/SWIFT Code
              </label>
              <input
                type="text"
                value={bankingInfo.bic}
                onChange={(e) => handleInputChange('bic', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
                placeholder="Enter BIC/SWIFT code (optional)"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: isLoading ? '#e5e7eb' : '#059669',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: 8,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: 16,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Save size={20} />
              {isLoading ? 'Saving...' : 'Save Banking Information'}
            </button>
          </div>
        </form>

        {/* US Wire Transfer Information */}
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: 8,
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400e', marginBottom: '1rem' }}>
            <CreditCard size={20} />
            <strong style={{ fontSize: 18 }}>US Wire Transfer Information</strong>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{
              background: 'white',
              border: '1px solid #f59e0b',
              borderRadius: 6,
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#92400e' }}>Transfer Type:</span>
                <span style={{ color: '#92400e' }}>Bonifici statunitensi · fino a tre giorni lavorativi</span>
              </div>
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #f59e0b',
              borderRadius: 6,
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#92400e' }}>Beneficiario:</span>
                <span style={{ color: '#92400e' }}>GLG capital group LLC</span>
              </div>
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #f59e0b',
              borderRadius: 6,
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#92400e' }}>Valuta accettata:</span>
                <span style={{ color: '#92400e' }}>USD</span>
              </div>
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #f59e0b',
              borderRadius: 6,
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#92400e' }}>Numero di conto:</span>
                <span style={{ color: '#92400e', fontFamily: 'monospace', fontSize: 16 }}>218086576410</span>
              </div>
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #f59e0b',
              borderRadius: 6,
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#92400e' }}>Numero di instradamento ACH:</span>
                <span style={{ color: '#92400e', fontFamily: 'monospace', fontSize: 16 }}>101019644</span>
              </div>
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #f59e0b',
              borderRadius: 6,
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#92400e' }}>Numero di instradamento bancario:</span>
                <span style={{ color: '#92400e', fontFamily: 'monospace', fontSize: 16 }}>101019644</span>
              </div>
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #f59e0b',
              borderRadius: 6,
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#92400e' }}>Indirizzo del beneficiario:</span>
                </div>
                <span style={{ color: '#92400e', fontSize: 14 }}>1309 Coffeen Ave, Ste H, Sheridan, WY, 82801-5714, United States</span>
              </div>
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #f59e0b',
              borderRadius: 6,
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#92400e' }}>Banca e indirizzo:</span>
                </div>
                <span style={{ color: '#92400e', fontSize: 14 }}>Lead Bank</span>
                <span style={{ color: '#92400e', fontSize: 14 }}>1801 Main Street, Kansas City, MO, 64108, United States</span>
              </div>
            </div>
          </div>

          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
              <AlertCircle size={16} />
              <strong>Important:</strong>
            </div>
            <p style={{ color: '#dc2626', fontSize: 14, margin: '0.5rem 0 0 0' }}>
              Please ensure you include your account reference number when making wire transfers. Contact support if you need assistance with the transfer process.
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 8,
          padding: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0369a1' }}>
            <AlertCircle size={16} />
            <strong>Security Notice:</strong>
          </div>
          <p style={{ color: '#0369a1', fontSize: 14, margin: '0.5rem 0 0 0' }}>
            Your banking information is stored securely and encrypted. We use this information only for processing your investment transactions.
          </p>
        </div>
      </div>
    </div>
  );
} 