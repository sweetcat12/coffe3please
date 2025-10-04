import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminForgotPassword from './AdminForgotPassword';
import AdminDashboard from './AdminDashboard';
import Toast from '../components/Toast';

function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminUser');
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
    setLoading(false);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  const handleLoginSuccess = (adminData) => {
    setAdmin(adminData);
    showToast('✅ Login successful! Welcome back.', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    setAdmin(null);
    showToast('👋 Logged out successfully!', 'info');
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Show Forgot Password screen
  if (showForgotPassword) {
    return (
      <>
        <AdminForgotPassword 
          onBack={handleBackToLogin}
          showToast={showToast}
        />
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}
      </>
    );
  }

  // Show Dashboard or Login
  return (
    <>
      {admin ? (
        <AdminDashboard admin={admin} onLogout={handleLogout} showToast={showToast} />
      ) : (
        <AdminLogin 
          onLoginSuccess={handleLoginSuccess} 
          showToast={showToast}
          onForgotPassword={handleForgotPassword}
        />
      )}
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </>
  );
}

export default AdminApp;