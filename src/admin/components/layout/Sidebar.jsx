// src/admin/components/layout/Sidebar.jsx
import { useState } from 'react';

const Sidebar = ({ activeTab, setActiveTab, admin, onLogout, pendingUsersCount = 0 }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { 
      id: 'users', 
      label: 'Users', 
      icon: '👥',
      badge: pendingUsersCount
    },
    { id: 'products', label: 'Products', icon: '☕' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'account', label: 'Account', icon: '⚙️' }
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  return (
    <>
      <div style={{
        width: '280px',
        height: '100vh',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
            ☕ CoffeePlease
          </h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>Admin Dashboard</p>
        </div>

        {/* Admin Info */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              {admin?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>
                {admin?.username || 'Admin'}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
                {admin?.role || 'Administrator'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: 'white',
                border: 'none',
                borderLeft: activeTab === tab.id ? '4px solid white' : '4px solid transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.2s',
                textAlign: 'left',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
              <span style={{ flex: 1 }}>{tab.label}</span>
              {/* Badge for pending items */}
              {tab.badge > 0 && (
                <span style={{
                  backgroundColor: '#EF4444',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  minWidth: '24px',
                  textAlign: 'center',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleLogoutClick}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>

        {/* Add pulse animation */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
        `}</style>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                animation: 'bounce 1s ease-in-out'
              }}>
                🚪
              </div>
              <h2 style={{ 
                margin: 0, 
                marginBottom: '0.5rem', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#1F2937'
              }}>
                Logout Confirmation
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#6B7280',
                fontSize: '0.95rem'
              }}>
                Are you sure you want to logout from the admin dashboard?
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              justifyContent: 'center' 
            }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
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
                onClick={confirmLogout}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)';
                }}
              >
                Yes, Logout
              </button>
            </div>

            <style>{`
              @keyframes bounce {
                0%, 100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-10px);
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;