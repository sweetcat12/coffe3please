import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import Toast from '../components/Toast';

function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {admin ? (
        <AdminDashboard admin={admin} onLogout={handleLogout} showToast={showToast} />
      ) : (
        <AdminLogin onLoginSuccess={handleLoginSuccess} showToast={showToast} />
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