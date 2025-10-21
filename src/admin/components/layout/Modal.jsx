// Modal.jsx
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  
  return (
    <div 
      onClick={onClose} 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 9999, 
        padding: '2rem' 
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          backgroundColor: 'white', 
          borderRadius: '1rem', 
          width: '100%', 
          maxWidth: '500px', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)' 
        }}
      >
        <div 
          style={{ 
            padding: '1.5rem', 
            borderBottom: '1px solid #E5E7EB', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{title}</h2>
          <button 
            onClick={onClose} 
            style={{ 
              fontSize: '2rem', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#9CA3AF' 
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;