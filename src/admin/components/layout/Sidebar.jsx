// Sidebar.jsx
const Sidebar = ({ activeTab, setActiveTab, admin, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'products', label: 'Products', icon: '☕' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'account', label: 'Account Management', icon: '⚙️' }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div style={{ 
      width: '280px', 
      background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)', 
      color: 'white', 
      display: 'flex', 
      flexDirection: 'column', 
      boxShadow: '4px 0 24px rgba(0,0,0,0.12)' 
    }}>
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            CoffeePlease
          </h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Admin Panel</p>
      </div>
      
      <nav style={{ 
        flex: 1, 
        padding: '1.5rem 1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem' 
      }}>
        {navItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)} 
            style={{ 
              padding: '0.875rem 1rem', 
              backgroundColor: activeTab === item.id ? 'rgba(102, 126, 234, 0.2)' : 'transparent', 
              color: activeTab === item.id ? '#A5B4FC' : '#D1D5DB', 
              border: activeTab === item.id ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent', 
              borderRadius: '0.75rem', 
              cursor: 'pointer', 
              textAlign: 'left', 
              fontSize: '0.95rem', 
              fontWeight: activeTab === item.id ? '600' : '500', 
              transition: 'all 0.2s', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem' 
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ 
        padding: '1.5rem', 
        borderTop: '1px solid rgba(255,255,255,0.1)', 
        background: 'rgba(0,0,0,0.2)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.25rem', 
            fontWeight: 'bold' 
          }}>
            {admin.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.125rem' }}>
              {admin.username}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{admin.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem', 
            cursor: 'pointer', 
            fontWeight: '600', 
            fontSize: '0.875rem' 
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;