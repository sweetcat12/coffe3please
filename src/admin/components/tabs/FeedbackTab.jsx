// FeedbackTab.jsx
const FeedbackTab = ({ feedback, onDeleteFeedback, onImageClick }) => {
  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Feedback ({feedback.length})
      </h1>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {feedback.map(item => (
          <div 
            key={item._id} 
            style={{ 
              backgroundColor: 'white', 
              padding: '1.75rem', 
              borderRadius: '1rem', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '1rem' 
            }}>
              <div>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                  {item.productId?.name || 'Unknown'}
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                  {item.userId?.name || item.customerName} • {item.userId?.email || item.customerEmail}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: item.rating >= 4 ? '#ECFDF5' : '#FEE2E2', 
                  color: item.rating >= 4 ? '#059669' : '#DC2626', 
                  borderRadius: '0.5rem', 
                  fontWeight: 'bold' 
                }}>
                  {item.rating}/5
                </span>
                <button 
                  onClick={() => onDeleteFeedback(item._id)} 
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
              </div>
            </div>
            <p>{item.comment || 'No comment'}</p>
            {item.image && (
              <img 
                onClick={() => onImageClick(item.image)} 
                src={item.image} 
                alt="Review" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  objectFit: 'cover', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer', 
                  border: '2px solid #E5E7EB', 
                  marginTop: '1rem' 
                }} 
              />
            )}
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackTab;