import { useState } from 'react';

const MobileNav = ({ isOpen, onClose, onNavigate }) => {
  return (
    <>
      {/* Hamburger Button */}
      <button 
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1.5rem',
          cursor: 'pointer',
          '@media (max-width: 768px)': { display: 'block' }
        }}
        onClick={() => onClose(!isOpen)}
      >
        ☰
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          background: '#6F4E37',
          padding: '1rem',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Menu items */}
        </div>
      )}
    </>
  );
};

export default MobileNav;