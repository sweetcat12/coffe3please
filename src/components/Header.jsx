import { useState } from 'react';

function Header({ currentUser, onLoginClick, onSignupClick, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLoginClick = (e) => {
    e.preventDefault();
    console.log('Login button clicked');
    onLoginClick();
  };

  const handleSignupClick = (e) => {
    e.preventDefault();
    console.log('Signup button clicked');
    onSignupClick();
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          <div className="logo-img">☕</div>
          <span className="logo-text">CoffeePlease</span>
        </div>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#menu">Menu</a></li>
          <li><a href="#contact">Contact</a></li>
          
          {currentUser ? (
            <li className="user-menu">
              <button 
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-icon">👤</span>
                {currentUser.name}
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <strong>{currentUser.name}</strong>
                    <span>{currentUser.email}</span>
                  </div>
                  <button onClick={onLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </li>
          ) : (
            <>
              <li>
                <button 
                  type="button"
                  onClick={handleLoginClick} 
                  className="auth-btn login-btn"
                >
                  Login
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={handleSignupClick} 
                  className="auth-btn signup-btn"
                >
                  Sign Up
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;