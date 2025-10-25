import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function AdminForgotPassword({ onBack, showToast }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email) {
      showToast('❌ Please enter your email address', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (data.success) {
        showToast('✅ OTP sent to your email!', 'success');
        setStep(2);
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      showToast('❌ Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.otp) {
      showToast('❌ Please enter the OTP code', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp 
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('✅ OTP verified!', 'success');
        setStep(3);
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      showToast('❌ Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.newPassword || !formData.confirmPassword) {
      showToast('❌ Please fill in all fields', 'error');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast('❌ Password must be at least 6 characters', 'error');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('❌ Passwords do not match', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('✅ Password reset successfully!', 'success');
        setTimeout(() => onBack(), 1500);
      } else {
        showToast(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Reset Password Error:', error);
      showToast('❌ Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: '#1F2937',
          textAlign: 'center'
        }}>
          Reset Password
        </h1>
        <p style={{
          color: '#6B7280',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          {step === 1 && "Enter your email to receive a reset code"}
          {step === 2 && "Enter the 6-digit code sent to your email"}
          {step === 3 && "Create your new password"}
        </p>

        {/* Progress Indicator */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '1.5rem',
          gap: '0.5rem'
        }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: step >= s ? '#667eea' : '#E5E7EB',
                borderRadius: '2px',
                transition: 'background-color 0.3s'
              }}
            />
          ))}
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#667eea',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>

            <button
              type="button"
              onClick={onBack}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: '#6B7280',
                fontWeight: '600',
                padding: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline'
              }}
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Verification Code
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="123456"
                maxLength="6"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '1.5rem',
                  letterSpacing: '0.5rem',
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}
              />
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#6B7280', 
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                Check your email for the 6-digit code
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  color: '#6B7280',
                  fontWeight: '600',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #D1D5DB',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
                  backgroundColor: '#667eea',
                  color: 'white',
                  fontWeight: '600',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: '#667eea',
                fontWeight: '600',
                padding: '0.5rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline'
              }}
            >
              Resend Code
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
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
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#667eea',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminForgotPassword;