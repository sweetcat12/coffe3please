import { useEffect, useState } from 'react';

const WelcomeSplash = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Animation phases
    const timer1 = setTimeout(() => setAnimationPhase(1), 500);
    const timer2 = setTimeout(() => setAnimationPhase(2), 1500);
    const timer3 = setTimeout(() => setAnimationPhase(3), 2500);
    
    // Auto-close after 4 seconds
    const autoClose = setTimeout(() => {
      handleClose();
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(autoClose);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: isVisible ? 'none' : 'fadeOut 0.5s ease-out',
        backdropFilter: 'blur(10px)'
      }}
      onClick={handleClose}
    >
      <style>
        {`
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.5) rotate(-10deg);
            }
            to {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }
          @keyframes glow {
            0%, 100% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5); }
            50% { text-shadow: 0 0 30px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 215, 0, 0.7); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          textAlign: 'center',
          position: 'relative',
          padding: '3rem',
          maxWidth: '800px'
        }}
      >
        {/* Sparkle Effects */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              backgroundColor: '#FFD700',
              borderRadius: '50%',
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 3) * 20}%`,
              animation: `sparkle 2s ease-in-out ${i * 0.3}s infinite`,
              boxShadow: '0 0 10px #FFD700'
            }}
          />
        ))}

        {/* Main Icon */}
        {animationPhase >= 0 && (
          <div
            style={{
              fontSize: '6rem',
              marginBottom: '1.5rem',
              animation: 'scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), bounce 2s ease-in-out 1s infinite',
              filter: 'drop-shadow(0 10px 30px rgba(255, 215, 0, 0.5))'
            }}
          >
            🛂
          </div>
        )}

        {/* Main Title */}
        {animationPhase >= 1 && (
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem',
              animation: 'slideUp 0.8s ease-out, glow 2s ease-in-out infinite',
              letterSpacing: '-2px',
              lineHeight: 1.2
            }}
          >
            Coffee Passport
          </h1>
        )}

        {/* Subtitle */}
        {animationPhase >= 2 && (
          <p
            style={{
              fontSize: 'clamp(1.2rem, 3vw, 2rem)',
              color: 'white',
              marginBottom: '2rem',
              fontWeight: 600,
              animation: 'slideUp 0.8s ease-out 0.2s both',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
            }}
          >
            Track Your Coffee Journey
          </p>
        )}

        {/* Feature Pills */}
        {animationPhase >= 3 && (
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '2rem'
            }}
          >
            {[
              { icon: '⭐', text: 'Earn Badges' },
              { icon: '📊', text: 'Track Progress' },
              { icon: '🏆', text: 'Climb Ranks' }
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))',
                  border: '2px solid rgba(255, 215, 0, 0.5)',
                  borderRadius: '50px',
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  animation: `slideUp 0.8s ease-out ${0.4 + i * 0.2}s both, pulse 2s ease-in-out ${1 + i * 0.3}s infinite`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                }}
              >
                <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        )}

        {/* Skip Button */}
        {animationPhase >= 3 && (
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              animation: 'slideUp 0.8s ease-out 1s both',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)';
              e.currentTarget.style.borderColor = '#FFD700';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Get Started ✨
          </button>
        )}

        {/* Tap to continue hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '-3rem',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.9rem',
            animation: 'fadeIn 1s ease-out 3s both'
          }}
        >
          Click anywhere to continue
        </div>
      </div>
    </div>
  );
};

export default WelcomeSplash;