// AccountTab.jsx
const AccountTab = ({ admin, admins, onAddAdmin, onEditProfile, onDeleteAdmin }) => {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
          Account Management
        </h1>
        <button 
          onClick={onAddAdmin} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem', 
            cursor: 'pointer', 
            fontWeight: '600' 
          }}
        >
          + Add Admin
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '1rem', 
        marginBottom: '2rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Your Profile
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem', 
          marginBottom: '1rem' 
        }}>
          <div>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Username</p>
            <p style={{ fontWeight: '600' }}>{admin.username}</p>
          </div>
          <div>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Email</p>
            <p style={{ fontWeight: '600' }}>{admin.email}</p>
          </div>
          <div>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Phone</p>
            <p style={{ fontWeight: '600' }}>{admin.phone || 'N/A'}</p>
          </div>
          <div>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Role</p>
            <p style={{ fontWeight: '600', textTransform: 'capitalize' }}>
              {admin.role}
            </p>
          </div>
        </div>
        <button 
          onClick={onEditProfile} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#EFF6FF', 
            color: '#3B82F6', 
            border: 'none', 
            borderRadius: '0.5rem', 
            cursor: 'pointer', 
            fontWeight: '600' 
          }}
        >
          Edit Profile
        </button>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '1rem', 
        overflow: 'hidden' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F3F4F6' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Username</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a._id} style={{ borderTop: '1px solid #E5E7EB' }}>
                <td style={{ padding: '1rem' }}>{a.username}</td>
                <td style={{ padding: '1rem' }}>{a.email}</td>
                <td style={{ padding: '1rem' }}>{a.phone || 'N/A'}</td>
                <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                  {a.role}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => onDeleteAdmin(a._id)} 
                    disabled={a._id === admin.id} 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: a._id === admin.id ? '#F3F4F6' : '#FEE2E2', 
                      color: a._id === admin.id ? '#9CA3AF' : '#DC2626', 
                      border: 'none', 
                      borderRadius: '0.5rem', 
                      cursor: a._id === admin.id ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountTab;