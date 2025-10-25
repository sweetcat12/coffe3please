import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Menu from './components/Menu';
import Contact from './components/Contact';
import Footer from './components/Footer';
import RatingModal from './components/RatingModal';
import AuthModal from './components/AuthModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import Passport from './components/Passport';
import ProfileEdit from './components/ProfileEdit';
import BadgeUnlockedModal from './components/BadgeUnlockedModal';
import WelcomeSplash from './components/WelcomeSplash';
import Toast from './components/Toast';
import './App.css';

// Backend API URLs
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const AUTH_API_URL = `${API_BASE}/api/auth`;
const PRODUCTS_API_URL = `${API_BASE}/api/products`;
const FEEDBACK_API_URL = `${API_BASE}/api/feedback`;
const PASSPORT_API_URL = `${API_BASE}/api/passport`;

function App() {
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratings, setRatings] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchProducts();
    fetchFeedback();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(PRODUCTS_API_URL);
      const result = await response.json();
      if (result.success) {
        setMenuItems(result.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await fetch(FEEDBACK_API_URL);
      const result = await response.json();
      if (result.success) {
        const groupedRatings = {};
        result.data.forEach(feedback => {
          const productId = feedback.productId._id || feedback.productId;
          if (!groupedRatings[productId]) groupedRatings[productId] = [];
          groupedRatings[productId].push({
            rating: feedback.rating,
            comment: feedback.comment,
            customerName: feedback.userId?.name || feedback.customerName,
            customerEmail: feedback.userId?.email || feedback.customerEmail,
            image: feedback.image,
            date: new Date(feedback.createdAt).toLocaleDateString()
          });
        });
        setRatings(groupedRatings);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      showToast('Failed to load feedback.', 'error');
    }
  };

  const openRatingModal = (item, category) => {
    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setSelectedProduct({ ...item, category });
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedProduct(null);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleForgotPassword = () => {
    setShowAuthModal(false);
    setShowForgotPassword(true);
  };

  const handleForgotPasswordSuccess = (message) => {
    showToast(message, 'success');
    setShowForgotPassword(false);
    setShowAuthModal(true);
    setAuthMode('login');
  };

  // ===== FIXED: LOGIN HANDLER WITH APPROVAL CHECK =====
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        // Check for pending/rejected status
        if (data.accountStatus === 'pending') {
          return { 
            success: false, 
            error: 'Your account is pending admin approval. Please wait for confirmation.' 
          };
        }
        if (data.accountStatus === 'rejected') {
          return { 
            success: false, 
            error: data.error || 'Your account has been rejected. Please contact support.' 
          };
        }
        return { success: false, error: data.error || 'Invalid credentials.' };
      }

      // Double-check status even if response is OK
      if (data.user && data.user.accountStatus === 'pending') {
        return { 
          success: false, 
          error: 'Your account is pending admin approval. Please wait for confirmation.' 
        };
      }

      const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        username: data.user.username
      };
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      setCurrentUser(userSession);
      closeAuthModal();
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // ===== FIXED: SIGNUP HANDLER - DON'T AUTO-LOGIN PENDING USERS =====
  const handleSignup = async (email, password, name, phone, username) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, email, phone, password }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Signup failed. Please try again.' };
      }

      // ✅ Check if account is pending - DON'T log them in!
      if (data.user && data.user.accountStatus === 'pending') {
        // Keep modal open, show success message
        return { 
          success: true, 
          message: data.message || 'Account created successfully! Please wait for admin approval before logging in.'
        };
      }

      // If somehow approved immediately (shouldn't happen with new system)
      const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        username: data.user.username
      };
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      setCurrentUser(userSession);
      closeAuthModal();
      showToast(`Account created! Welcome, ${data.user.name}! 🎉`, 'success');
      return { success: true };

    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const handleLogout = () => {
    const userName = currentUser?.name || 'User';
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
    showToast(`Goodbye, ${userName}!`, 'info');
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setShowProfileEdit(false);
    showToast('Profile updated successfully!', 'success');
  };

  const submitRating = async (rating, comment, image = null) => {
    try {
      const feedbackData = {
        userId: currentUser.id,
        productId: selectedProduct.id,
        rating,
        comment,
        image
      };
      const response = await fetch(FEEDBACK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });
      const result = await response.json();
      
      if (result.success) {
        // Check for new badges directly from feedback response
        if (result.newBadges && result.newBadges.length > 0) {
          setNewBadges(result.newBadges);
          setShowBadgeModal(true);
        }

        // Update local ratings state
        const newRating = {
          rating,
          comment,
          customerName: currentUser.name,
          customerEmail: currentUser.email,
          image,
          date: new Date().toLocaleDateString()
        };
        setRatings(prev => ({
          ...prev,
          [selectedProduct.id]: [...(prev[selectedProduct.id] || []), newRating]
        }));
        
        closeRatingModal();
        showToast('Review submitted successfully!', 'success');
        
        // Refresh feedback to get latest data
        await fetchFeedback();
      } else {
        showToast('Failed to submit review: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('Error submitting review. Please try again.', 'error');
    }
  };

  const getAverageRating = (productId) => {
    const productRatings = ratings[productId];
    if (!productRatings || productRatings.length === 0) return 0;
    const sum = productRatings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / productRatings.length).toFixed(1);
  };

  const HomePage = () => (
    <>
      <Hero currentUser={currentUser} />
      <About />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', fontSize: '1.2rem', color: '#666' }}>
          Loading menu...
        </div>
      ) : (
        <Menu 
          menuItems={menuItems} 
          openRatingModal={openRatingModal}
          ratings={ratings}
          getAverageRating={getAverageRating}
          currentUser={currentUser}
        />
      )}
      <Contact />
    </>
  );

  return (
    <div className="App">
      <Header 
        currentUser={currentUser}
        onLoginClick={() => openAuthModal('login')}
        onSignupClick={() => openAuthModal('signup')}
        onLogout={handleLogout}
        onEditProfile={() => setShowProfileEdit(true)}
      />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route 
          path="/passport" 
          element={
            currentUser ? (
              <Passport currentUser={currentUser} />
            ) : (
              <div style={{ 
                minHeight: '60vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h2>Please login to view your Coffee Passport</h2>
                <button 
                  onClick={() => openAuthModal('login')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#D97706',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Login
                </button>
              </div>
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Footer />

      {showRatingModal && (
        <RatingModal 
          product={selectedProduct}
          closeModal={closeRatingModal}
          submitRating={submitRating}
          existingRatings={ratings[selectedProduct.id] || []}
          currentUser={currentUser}
        />
      )}

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          closeModal={closeAuthModal}
          onLogin={handleLogin}
          onSignup={handleSignup}
          switchMode={(mode) => setAuthMode(mode)}
          onForgotPassword={handleForgotPassword}
        />
      )}

      {showForgotPassword && (
        <ForgotPasswordModal
          closeModal={() => {
            setShowForgotPassword(false);
            setShowAuthModal(true);
          }}
          onSuccess={handleForgotPasswordSuccess}
        />
      )}

      {showBadgeModal && (
        <BadgeUnlockedModal
          badges={newBadges}
          closeModal={() => setShowBadgeModal(false)}
        />
      )}

      {showProfileEdit && currentUser && (
        <ProfileEdit
          currentUser={currentUser}
          onClose={() => setShowProfileEdit(false)}
          onUpdateSuccess={handleProfileUpdate}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;