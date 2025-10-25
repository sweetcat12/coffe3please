import { useState } from 'react';

const BadgeUnlockedModal = ({ badges, closeModal }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        animation: 'fadeIn 0.3s ease-in'
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { 
              transform: scale(0.8);
              opacity: 0;
            }
            to { 
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes confetti {
            0% { 
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% { 
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            animation: confetti 3s ease-in-out forwards;
          }
        `}
      </style>

      {/* Confetti Effect */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            backgroundColor: ['#F59E0B', '#DC2626', '#8B5CF6', '#10B981'][Math.floor(Math.random() * 4)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '3rem 2rem',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'scaleIn 0.5s ease-out',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          animation: 'bounce 1s ease-in-out infinite'
        }}>
          🎉
        </div>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: '0.5rem'
        }}>
          Badge{badges.length > 1 ? 's' : ''} Unlocked!
        </h2>

        <p style={{
          color: '#6B7280',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Congratulations on your achievement!
        </p>

        {/* Display Badges */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {badges.map((badge, index) => (
            <div
              key={index}
              style={{
                backgroundColor: badge.discount > 0 ? '#FEF3C7' : '#F3F4F6',
                border: badge.discount > 0 ? '2px solid #FCD34D' : '2px solid #D1D5DB',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                animation: `scaleIn 0.5s ease-out ${index * 0.2}s both`
              }}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '0.5rem'
              }}>
                {badge.icon}
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: badge.discount > 0 ? '#92400E' : '#1F2937',
                marginBottom: '0.25rem'
              }}>
                {badge.name}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: badge.discount > 0 ? '#78350F' : '#6B7280',
                marginBottom: badge.voucherCode ? '1rem' : '0'
              }}>
                {badge.description}
              </div>

              {/* Voucher Code Section */}
              {badge.voucherCode && badge.discount > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  border: '2px dashed #D97706'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#92400E',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    🎟️ Your {badge.discount}% Discount Code
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}>
                    <code style={{
                      backgroundColor: '#FEF3C7',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: '#92400E',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em'
                    }}>
                      {badge.voucherCode}
                    </code>
                    <button
                      onClick={() => copyVoucherCode(badge.voucherCode)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: copiedCode === badge.voucherCode ? '#10B981' : '#D97706',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                    >
                      {copiedCode === badge.voucherCode ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#92400E',
                    marginTop: '0.5rem',
                    fontStyle: 'italic'
                  }}>
                    Valid for 90 days • Check your passport for all vouchers
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={closeModal}
          style={{
            width: '100%',
            backgroundColor: '#D97706',
            color: 'white',
            fontWeight: '600',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#B45309';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#D97706';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
};

export default BadgeUnlockedModal;