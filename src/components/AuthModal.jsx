// src/components/AuthModal.jsx
import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AuthModal = ({ mode, closeModal, onLogin, onSignup, switchMode, onForgotPassword }) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('AuthModal mounted with mode:', mode);
    setError('');
    setSuccessMessage('');
  }, [mode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (mode === 'login') {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }

      const result = await onLogin(formData.email, formData.password);
      if (!result.success) {
        setError(result.error);
      }
    } else {
      // Signup validation
      if (!formData.username || !formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (formData.username.length < 3) {
        setError('Username must be at least 3 characters');
        return;
      }

      if (formData.username.length > 20) {
        setError('Username must be less than 20 characters');
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        setError('Username can only contain letters, numbers, and underscores');
        return;
      }

      if (!/^\d{10,13}$/.test(formData.phone)) {
        setError('Enter a valid phone number (10–13 digits)');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      const result = await onSignup(formData.email, formData.password, formData.name, formData.phone, formData.username);
      if (result.success) {
        setSuccessMessage('Account created successfully! Please wait for admin approval before logging in.');
        setFormData({
          username: '',
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setError(result.error);
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div 
      className="auth-modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 99999
      }}
    >
      <div 
        className="auth-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '28rem',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <button
          onClick={closeModal}
          type="button"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            color: '#9CA3AF',
            fontSize: '2rem',
            fontWeight: 'bold',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '9999px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#4B5563';
            e.currentTarget.style.backgroundColor = '#F3F4F6';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#9CA3AF';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            color: '#1F2937',
            marginBottom: '0.5rem'
          }}>
            {mode === 'login' ? 'Please Login' : 'Join Us!'}
          </h2>
          <p style={{ color: '#6B7280' }}>
            {mode === 'login' 
              ? 'Sign in to rate and review your favorite items' 
              : 'Create an account to get started'}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#D1FAE5',
            border: '1px solid #6EE7B7',
            color: '#065F46',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}>
            ✓ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="username" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="coffee_lover123"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontSize: '1rem'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F59E0B';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  marginTop: '0.25rem'
                }}>
                  This will be displayed on the leaderboard
                </p>
              </div>

              <div>
                <label htmlFor="name" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontSize: '1rem'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F59E0B';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label htmlFor="phone" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="09123456789"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontSize: '1rem'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F59E0B';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                outline: 'none',
                transition: 'all 0.2s',
                fontSize: '1rem'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F59E0B';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                outline: 'none',
                transition: 'all 0.2s',
                fontSize: '1rem'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F59E0B';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontSize: '1rem'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F59E0B';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#D97706',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#B45309';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#D97706';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onForgotPassword}
              style={{
                color: '#D97706',
                fontSize: '0.875rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#B45309';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#D97706';
              }}
            >
              Forgot password?
            </button>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#6B7280' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              style={{
                color: '#D97706',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                padding: 0
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#B45309';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#D97706';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;