import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Menu from './components/Menu';
import Contact from './components/Contact';
import Footer from './components/Footer';
import RatingModal from './components/RatingModal';
import AuthModal from './components/AuthModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import Toast from './components/Toast';
import './App.css';

// Backend API URLs
const AUTH_API_URL = 'http://localhost:5000/api/auth';
const PRODUCTS_API_URL = 'http://localhost:5000/api/products';
const FEEDBACK_API_URL = 'http://localhost:5000/api/feedback';

function App() {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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

  // LOGIN
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast(data.error || 'Invalid credentials.', 'error');
        return { success: false };
      }

      const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name
      };
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      setCurrentUser(userSession);
      closeAuthModal();
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      showToast('Network error. Please try again.', 'error');
      return { success: false };
    }
  };

  // SIGNUP
  const handleSignup = async (email, password, name, phone) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast(data.error || 'Signup failed. Please try again.', 'error');
        return { success: false };
      }

      const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name
      };
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      setCurrentUser(userSession);
      closeAuthModal();
      showToast(`Account created! Welcome, ${data.user.name}!`, 'success');
      return { success: true };

    } catch (error) {
      console.error('Signup error:', error);
      showToast('Network error. Please try again.', 'error');
      return { success: false };
    }
  };

  const handleLogout = () => {
    const userName = currentUser?.name || 'User';
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    showToast(`Goodbye, ${userName}!`, 'info');
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
        fetchFeedback();
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

  return (
    <div className="App">
      <Header 
        currentUser={currentUser}
        onLoginClick={() => openAuthModal('login')}
        onSignupClick={() => openAuthModal('signup')}
        onLogout={handleLogout}
      />
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