import { useState, useEffect } from 'react';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/notifications/${id}/read`, { method: 'PUT' });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        style={{ 
          position: 'relative', 
          padding: '0.75rem', 
          background: 'white',
          border: '2px solid #E5E7EB', 
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '1.5rem',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#EF4444',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <>
          <div 
            onClick={() => setShowNotifications(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          />
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '0',
            width: '380px',
            maxHeight: '500px',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
            zIndex: 1000,
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ padding: '1.25rem', borderBottom: '2px solid #E5E7EB', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Notifications</h3>
              {unreadCount > 0 && (
                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div>
              {notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif._id} 
                    onClick={() => markAsRead(notif._id)}
                    style={{ 
                      padding: '1rem 1.25rem', 
                      borderBottom: '1px solid #F3F4F6',
                      backgroundColor: notif.read ? 'white' : '#EFF6FF',
                      cursor: 'pointer'
                    }}
                  >
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>{notif.title}</p>
                    <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: '1.4' }}>{notif.message}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;