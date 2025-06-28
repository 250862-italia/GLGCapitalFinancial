export default function EquityPledgePage() {
  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem', background: '#fff' }}>
      
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', marginBottom: '4rem', padding: '3rem 0' }}>
        <h1 style={{ 
          color: '#0a2540', 
          fontSize: '3.5rem', 
          fontWeight: 900, 
          marginBottom: '1.5rem',
          lineHeight: 1.2
        }}>
          How to Implement an "Equity Pledge" System
        </h1>
        <p style={{ 
          color: '#1a3556', 
          fontSize: '1.4rem', 
          lineHeight: 1.6,
          maxWidth: 800,
          margin: '0 auto 2rem'
        }}>
          A comprehensive guide to replicating the GLG Equity Pledge model—raising capital from investors at a fixed, guaranteed return secured by a pledge of your company's shares.
        </p>
        <div style={{
          background: '#f8fafc',
          border: '2px solid #e2e8f0',
          borderRadius: 12,
          padding: '2rem',
          margin: '2rem auto',
          maxWidth: 900
        }}>
          <h3 style={{ color: '#0a2540', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
            What is an Equity Pledge System?
          </h3>
          <p style={{ color: '#1a3556', lineHeight: 1.6 }}>
            An equity pledge system allows companies to raise capital by offering investors a fixed, guaranteed return secured by pledging company shares as collateral. This innovative financing model provides transparency, flexibility, and robust collateralization through share pledges.
          </p>
        </div>
      </section>

      {/* OVERVIEW SECTION */}
      <section style={{ marginBottom: '4rem', padding: '3rem', background: '#f8fafc', borderRadius: 16 }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          System Overview
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: '#0a2540', 
              color: 'white', 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              1
            </div>
            <h4 style={{ color: '#0a2540', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Corporate Structure
            </h4>
            <p style={{ color: '#1a3556', fontSize: '1rem' }}>
              Establish appropriate corporate vehicle with dedicated shares for investors
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: '#0a2540', 
              color: 'white', 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              2
            </div>
            <h4 style={{ color: '#0a2540', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Legal Framework
            </h4>
            <p style={{ color: '#1a3556', fontSize: '1rem' }}>
              Prepare comprehensive legal documentation and secure regulatory approvals
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: '#0a2540', 
              color: 'white', 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              3
            </div>
            <h4 style={{ color: '#0a2540', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Digital Platform
            </h4>
            <p style={{ color: '#1a3556', fontSize: '1rem' }}>
              Build subscription platform with KYC/AML compliance and payment processing
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: '#0a2540', 
              color: 'white', 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              4
            </div>
            <h4 style={{ color: '#0a2540', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Management
            </h4>
            <p style={{ color: '#1a3556', fontSize: '1rem' }}>
              Monitor investments, provide reporting, and handle repayments with pledge release
            </p>
          </div>
        </div>
      </section>

      {/* DETAILED STEPS SECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Implementation Steps
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Step 1 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                background: '#0a2540', 
                color: 'white', 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                margin: 0
              }}>
                Create the Appropriate Corporate Vehicle
              </h3>
            </div>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem',
              fontSize: '1.1rem'
            }}>
              <li>Establish a separate entity or branch (e.g. "MyCompany Italy Branch") whose articles expressly allow issuing dedicated shares to investors</li>
              <li>Define share capital, nominal value per share, and transfer restrictions clearly in the bylaws</li>
              <li>Ensure the corporate structure supports the equity pledge mechanism</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                background: '#0a2540', 
                color: 'white', 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                margin: 0
              }}>
                Prepare Your Legal Documentation
              </h3>
            </div>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem',
              fontSize: '1.1rem'
            }}>
              <li><strong>Term Sheet:</strong> outlines economics (term, yield, fees, repayment terms)</li>
              <li><strong>Subscription & Pledge Agreement:</strong> covers payment mechanics and pledge of shares as security</li>
              <li><strong>Appendices:</strong> Subscription Form, Bank Details, Pledge Enforcement Procedures</li>
              <li>Engage a corporate law firm or notary to draft and review these documents for compliance and enforceability</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                background: '#0a2540', 
                color: 'white', 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                margin: 0
              }}>
                Secure Regulatory Approvals and Compliance
              </h3>
            </div>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem',
              fontSize: '1.1rem'
            }}>
              <li><strong>KYC/AML:</strong> implement a compliant onboarding workflow (ID checks, beneficial-owner screening, anti-money laundering screening)</li>
              <li>If you anticipate large-scale or public solicitations, verify whether any securities-law notifications or opinions are required</li>
              <li>Otherwise treat it as a private placement</li>
            </ul>
          </div>

          {/* Step 4 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                background: '#0a2540', 
                color: 'white', 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                4
              </div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                margin: 0
              }}>
                Build Your Subscription Platform
              </h3>
            </div>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem',
              fontSize: '1.1rem'
            }}>
              <li>Develop a web portal or digital form where investors complete the Subscription Form and upload documents</li>
              <li>Integrate an e-signature solution for executing the Subscription & Pledge Agreement</li>
              <li>Provide a "Pay Now" button that issues an instruction with IBAN and payment reference automatically</li>
            </ul>
          </div>

          {/* Step 5 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                background: '#0a2540', 
                color: 'white', 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                5
              </div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                margin: 0
              }}>
                Process Funds and Establish the Pledge
              </h3>
            </div>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem',
              fontSize: '1.1rem'
            }}>
              <li>Confirm receipt of investor wire transfers into a segregated escrow account</li>
              <li>Register or deposit the pledged shares with a custodian or record the pledge in your shareholders' register in accordance with local law</li>
            </ul>
          </div>

          {/* Step 6 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                background: '#0a2540', 
                color: 'white', 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                6
              </div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                margin: 0
              }}>
                Manage Investments and Reporting
              </h3>
            </div>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem',
              fontSize: '1.1rem'
            }}>
              <li>Track monthly contributions, interest accrual, and upcoming maturities</li>
              <li>Distribute clear, periodic investor reports (e.g., quarterly) showing principal and interest earned</li>
              <li>Maintain separate accounting for the pledged-share vehicle to ensure transparency</li>
            </ul>
          </div>

          {/* Step 7 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                background: '#0a2540', 
                color: 'white', 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                7
              </div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                margin: 0
              }}>
                Repay and Release the Pledge
              </h3>
            </div>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem',
              fontSize: '1.1rem'
            }}>
              <li>At maturity, calculate net returns (e.g., 12% gross less 0.7% management fee) and execute wire transfers back to each investor's designated bank account</li>
              <li>Automatically release the pledge and return full ownership of shares to the issuer once obligations are settled</li>
            </ul>
          </div>

          {/* Step 8 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                background: '#0a2540', 
                color: 'white', 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                8
              </div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                margin: 0
              }}>
                Provide Early-Exit Options
              </h3>
            </div>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem',
              fontSize: '1.1rem'
            }}>
              <li>Offer investors a predefined early-exit mechanism—typically at a slight yield penalty—detailed in the Term Sheet and Subscription Agreement</li>
              <li>Allow investors who wish to redeem before maturity to exit with appropriate terms</li>
            </ul>
          </div>

        </div>
      </section>

      {/* SUMMARY WORKFLOW SECTION */}
      <section style={{ marginBottom: '4rem', padding: '3rem', background: '#f8fafc', borderRadius: 16 }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Summary Workflow
        </h2>
        
        <div style={{ 
          background: '#fff', 
          padding: '2rem', 
          borderRadius: 12, 
          boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <ol style={{ 
            color: '#1a3556', 
            lineHeight: 1.8,
            paddingLeft: '1.5rem',
            fontSize: '1.2rem'
          }}>
            <li><strong>Incorporate or designate</strong> the special branch/entity</li>
            <li><strong>Draft your Term Sheet</strong> and Subscription & Pledge Agreement</li>
            <li><strong>Implement KYC/AML</strong> and your digital subscription portal</li>
            <li><strong>Collect funds</strong> and lock shares under pledge</li>
            <li><strong>Monitor performance</strong> and report regularly</li>
            <li><strong>Repay principal + interest</strong> at maturity and remove the pledge</li>
          </ol>
          
          <div style={{ 
            background: '#0a2540', 
            color: 'white', 
            padding: '2rem', 
            borderRadius: 12,
            marginTop: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
              Key Benefits
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              By following this blueprint, your company can secure transparent, flexible funding, offer investors a competitive fixed return, and ensure robust collateralization through a share pledge.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section style={{ 
        background: '#0a2540', 
        color: 'white', 
        padding: '3rem', 
        borderRadius: 16,
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem' 
        }}>
          Need Professional Assistance?
        </h2>
        <p style={{ 
          fontSize: '1.2rem', 
          lineHeight: 1.6, 
          marginBottom: '2rem',
          maxWidth: 800,
          margin: '0 auto 2rem'
        }}>
          GLG Capital Group LLC specializes in implementing equity pledge systems and can provide expert guidance throughout the entire process.
        </p>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '2rem', 
          borderRadius: 12,
          maxWidth: 600,
          margin: '0 auto'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            marginBottom: '1rem' 
          }}>
            Contact Us
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            1309 Coffeen Avenue STE 1200<br />
            Sheridan, Wyoming 82801
          </p>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            <a href="mailto:corefound@glgcapitalgroupllc.com" style={{ color: '#60a5fa' }}>
              corefound@glgcapitalgroupllc.com
            </a>
          </p>
          <p style={{ fontSize: '1.1rem' }}>
            Phone: +1 307 263 0876
          </p>
        </div>
      </section>

    </main>
  );
}
