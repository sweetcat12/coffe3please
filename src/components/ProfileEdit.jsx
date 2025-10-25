import { useState, useEffect } from 'react';

const ProfileEdit = ({ currentUser, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE}/api/auth/user/${currentUser.id}`);
      if (result.success) {
        setFormData({
          username: result.user.username || '',
          name: result.user.name || '',
          email: result.user.email || '',
          phone: result.user.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load profile data');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate username
    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('Username must be between 3-20 characters');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    // Validate phone
    if (!/^\d{10,13}$/.test(formData.phone)) {
      setError('Enter a valid phone number (10–13 digits)');
      setLoading(false);
      return;
    }

    // Password validation if user wants to change password
    if (showPasswordSection) {
      if (!formData.currentPassword) {
        setError('Please enter your current password');
        setLoading(false);
        return;
      }

      if (formData.newPassword) {
        if (formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters');
          setLoading(false);
          return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
      }
    }

    try {
      const updateData = {
        username: formData.username,
        name: formData.name,
        phone: formData.phone
      };

      if (showPasswordSection && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(`${API_BASE}/api/auth/update-profile/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to update profile');
        setLoading(false);
        return;
      }

      setSuccess('Profile updated successfully!');
      
      // Update local storage with new data
      const updatedUser = {
        ...currentUser,
        username: result.user.username,
        name: result.user.name,
        email: result.user.email
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Call parent callback
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedUser);
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Update profile error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
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
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '32rem',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <button
          onClick={onClose}
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
            Edit Profile
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Update your account information
          </p>
        </div>

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

        {success && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#15803D',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="username" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
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
              Displayed on the leaderboard
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
              disabled
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                outline: 'none',
                fontSize: '1rem',
                backgroundColor: '#F3F4F6',
                color: '#6B7280',
                cursor: 'not-allowed'
              }}
            />
            <p style={{
              fontSize: '0.75rem',
              color: '#6B7280',
              marginTop: '0.25rem'
            }}>
              Email cannot be changed
            </p>
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

          {/* Change Password Toggle */}
          <div style={{
            borderTop: '1px solid #E5E7EB',
            paddingTop: '1rem',
            marginTop: '0.5rem'
          }}>
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              style={{
                color: '#D97706',
                fontSize: '0.875rem',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              {showPasswordSection ? '− Cancel Password Change' : '+ Change Password'}
            </button>
          </div>

          {showPasswordSection && (
            <>
              <div>
                <label htmlFor="currentPassword" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
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

              <div>
                <label htmlFor="newPassword" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
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

              <div>
                <label htmlFor="confirmNewPassword" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.25rem'
                }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
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
            </>
          )}

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#E5E7EB';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: loading ? '#9CA3AF' : '#D97706',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#B45309';
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#D97706';
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;