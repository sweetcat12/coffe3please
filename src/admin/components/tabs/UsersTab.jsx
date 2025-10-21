// src/admin/components/tabs/UsersTab.jsx
const UsersTab = ({ users, onAddUser, onEditUser, onDeleteUser }) => {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
          Users ({users.length})
        </h1>
        <button 
          onClick={onAddUser} 
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
          + Add User
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
              <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Joined</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderTop: '1px solid #E5E7EB' }}>
                <td style={{ padding: '1rem' }}>{u.username}</td>
                <td style={{ padding: '1rem' }}>{u.name}</td>
                <td style={{ padding: '1rem' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>{u.phone || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => onEditUser(u)} 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      marginRight: '0.5rem', 
                      backgroundColor: '#EFF6FF', 
                      color: '#3B82F6', 
                      border: 'none', 
                      borderRadius: '0.5rem', 
                      cursor: 'pointer' 
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteUser(u._id)} 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#FEE2E2', 
                      color: '#DC2626', 
                      border: 'none', 
                      borderRadius: '0.5rem', 
                      cursor: 'pointer' 
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

export default UsersTab;