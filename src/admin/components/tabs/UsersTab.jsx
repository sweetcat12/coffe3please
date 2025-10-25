// src/admin/tabs/UsersTab.jsx
import { useState } from 'react';

const UsersTab = ({ users, onAddUser, onEditUser, onDeleteUser, onApproveUser, onRejectUser, adminId }) => {
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter users based on status
  const filteredUsers = users.filter(user => {
    if (filterStatus === 'all') return true;
    return user.accountStatus === filterStatus;
  });

  const pendingCount = users.filter(u => u.accountStatus === 'pending').length;
  const approvedCount = users.filter(u => u.accountStatus === 'approved').length;
  const rejectedCount = users.filter(u => u.accountStatus === 'rejected').length;

  const handleReject = (userId) => {
    setRejectUserId(userId);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (rejectUserId) {
      onRejectUser(rejectUserId, rejectionReason || 'Your account registration did not meet our requirements.');
      setShowRejectModal(false);
      setRejectUserId(null);
      setRejectionReason('');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#FEF3C7', color: '#92400E', text: 'Pending' },
      approved: { bg: '#D1FAE5', color: '#065F46', text: 'Approved' },
      rejected: { bg: '#FEE2E2', color: '#991B1B', text: 'Rejected' }
    };
    
    const style = styles[status] || styles.pending;
    
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
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
            fontWeight: '600',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          + Add User
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'all', label: `All (${users.length})` },
          { key: 'pending', label: `Pending (${pendingCount})`, color: '#F59E0B' },
          { key: 'approved', label: `Approved (${approvedCount})`, color: '#10B981' },
          { key: 'rejected', label: `Rejected (${rejectedCount})`, color: '#EF4444' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: filterStatus === tab.key ? (tab.color || '#667eea') : '#F3F4F6',
              color: filterStatus === tab.key ? 'white' : '#6B7280',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '1rem', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F3F4F6' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Username</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Joined</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u._id} style={{ borderTop: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '1rem' }}>
                    {getStatusBadge(u.accountStatus)}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{u.username}</td>
                  <td style={{ padding: '1rem' }}>{u.name}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '1rem' }}>{u.phone || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Show approve/reject buttons for pending users */}
                      {u.accountStatus === 'pending' && (
                        <>
                          <button 
                            onClick={() => onApproveUser(u._id, adminId)} 
                            style={{ 
                              padding: '0.5rem 1rem', 
                              backgroundColor: '#D1FAE5', 
                              color: '#065F46', 
                              border: 'none', 
                              borderRadius: '0.5rem', 
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.875rem'
                            }}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            onClick={() => handleReject(u._id)} 
                            style={{ 
                              padding: '0.5rem 1rem', 
                              backgroundColor: '#FEE2E2', 
                              color: '#991B1B', 
                              border: 'none', 
                              borderRadius: '0.5rem', 
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.875rem'
                            }}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      
                      {/* Show edit for approved users */}
                      {u.accountStatus === 'approved' && (
                        <button 
                          onClick={() => onEditUser(u)} 
                          style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#EFF6FF', 
                            color: '#3B82F6', 
                            border: 'none', 
                            borderRadius: '0.5rem', 
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}
                        >
                          Edit
                        </button>
                      )}
                      
                      {/* Show approve again for rejected users */}
                      {u.accountStatus === 'rejected' && (
                        <button 
                          onClick={() => onApproveUser(u._id, adminId)} 
                          style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#D1FAE5', 
                            color: '#065F46', 
                            border: 'none', 
                            borderRadius: '0.5rem', 
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}
                        >
                          ✓ Approve
                        </button>
                      )}
                      
                      {/* Delete button for all */}
                      <button 
                        onClick={() => onDeleteUser(u._id)} 
                        style={{ 
                          padding: '0.5rem 1rem', 
                          backgroundColor: '#FEE2E2', 
                          color: '#DC2626', 
                          border: 'none', 
                          borderRadius: '0.5rem', 
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    
                    {/* Show rejection reason if rejected */}
                    {u.accountStatus === 'rejected' && u.rejectionReason && (
                      <div style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.75rem', 
                        color: '#991B1B',
                        fontStyle: 'italic'
                      }}>
                        Reason: {u.rejectionReason}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
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
          onClick={() => setShowRejectModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Reject User Account
            </h2>
            <p style={{ marginBottom: '1rem', color: '#6B7280' }}>
              Please provide a reason for rejecting this user's account:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Invalid information provided, duplicate account, etc."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Reject User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;