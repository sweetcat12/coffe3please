const BadgeUnlockedModal = ({ badges, closeModal }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
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
          position: 'relative'
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
                backgroundColor: '#FEF3C7',
                border: '2px solid #FCD34D',
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
                color: '#92400E',
                marginBottom: '0.25rem'
              }}>
                {badge.name}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#78350F'
              }}>
                {badge.description}
              </div>
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