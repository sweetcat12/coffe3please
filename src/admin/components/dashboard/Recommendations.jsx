// Recommendations.jsx
const Recommendations = ({ recommendations }) => {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Recommendations
      </h2>
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2.5rem' }}>
        {recommendations.map((rec, i) => (
          <div 
            key={i} 
            style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '1rem', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
              borderLeft: `4px solid ${
                rec.type === 'success' ? '#10B981' : 
                rec.type === 'critical' ? '#EF4444' : 
                '#F59E0B'
              }` 
            }}
          >
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{rec.icon}</span>
              <div>
                <h3 style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '0.5rem', 
                  fontSize: '1.1rem' 
                }}>
                  {rec.title}
                </h3>
                <p style={{ color: '#4B5563', marginBottom: '0.75rem' }}>
                  {rec.message}
                </p>
                <div style={{ 
                  padding: '0.75rem', 
                  backgroundColor: '#F9FAFB', 
                  borderRadius: '0.5rem', 
                  borderLeft: '3px solid #667eea' 
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#374151' }}>
                    <strong>Action:</strong> {rec.action}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;