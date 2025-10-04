import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import NotificationBell from './NotificationBell';

const COLORS = ['#EF4444', '#F59E0B', '#FCD34D', '#34D399', '#10B981'];

// Modal Component
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '1rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{title}</h2>
          <button onClick={onClose} style={{ fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

function AdminDashboard({ admin, onLogout, showToast }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form data
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [adminForm, setAdminForm] = useState({ username: '', email: '', phone: '', password: '', role: 'admin' });
  const [productForm, setProductForm] = useState({ name: '', description: '', category: 'ICED COFFEE', price: 0 });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    fetchDashboardData();
    fetchUsers();
    fetchAdmins();
    fetchFeedback();
    fetchProducts();
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/dashboard');
      const data = await res.json();
      if (data.success) setDashboardData(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/all');
      const data = await res.json();
      if (data.success) setAdmins(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/feedback');
      const data = await res.json();
      if (data.success) setFeedback(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          const allProducts = [];
          Object.entries(data.data).forEach(([category, items]) => {
            items.forEach(item => allProducts.push({ ...item, _id: item._id || item.id, category }));
          });
          setProducts(allProducts);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to fetch products', 'error');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  // User operations
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `http://localhost:5000/api/admin/users/${editingItem._id}` : 'http://localhost:5000/api/admin/users';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { name: userForm.name, email: userForm.email, phone: userForm.phone } : userForm;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (data.success) {
        showToast(editingItem ? 'User updated successfully' : 'User created successfully', 'success');
        setShowUserModal(false);
        setUserForm({ name: '', email: '', phone: '', password: '' });
        setEditingItem(null);
        fetchUsers();
      } else {
        showToast(data.error, 'error');
      }
    } catch (error) {
      showToast('Error saving user', 'error');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('User deleted successfully', 'success');
        fetchUsers();
      } else {
        showToast('Failed to delete user', 'error');
      }
    } catch (error) {
      showToast('Error deleting user', 'error');
    }
  };

  // Admin operations
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `http://localhost:5000/api/admin/${editingItem._id}` : 'http://localhost:5000/api/admin/create';
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      });
      
      const data = await res.json();
      
      if (data.success) {
        showToast(editingItem ? 'Admin updated successfully' : 'Admin created successfully', 'success');
        setShowAdminModal(false);
        setAdminForm({ username: '', email: '', phone: '', password: '', role: 'admin' });
        setEditingItem(null);
        fetchAdmins();
      } else {
        showToast(data.error, 'error');
      }
    } catch (error) {
      showToast('Error saving admin', 'error');
    }
  };

  const deleteAdmin = async (id) => {
    if (id === admin.id) {
      showToast('Cannot delete your own account', 'error');
      return;
    }
    if (!window.confirm('Delete this admin?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Admin deleted successfully', 'success');
        fetchAdmins();
      } else {
        showToast('Failed to delete admin', 'error');
      }
    } catch (error) {
      showToast('Error deleting admin', 'error');
    }
  };

  // Product operations
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `http://localhost:5000/api/admin/products/${editingItem._id}` : 'http://localhost:5000/api/admin/products';
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
      
      const data = await res.json();
      
      if (data.success) {
        showToast(editingItem ? 'Product updated successfully' : 'Product created successfully', 'success');
        setShowProductModal(false);
        setProductForm({ name: '', description: '', category: 'ICED COFFEE', price: 0 });
        setEditingItem(null);
        fetchProducts();
        fetchDashboardData();
      } else {
        showToast(data.error, 'error');
      }
    } catch (error) {
      showToast('Error saving product', 'error');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Product deleted successfully', 'success');
        fetchProducts();
        fetchDashboardData();
      } else {
        showToast('Failed to delete product', 'error');
      }
    } catch (error) {
      showToast('Error deleting product', 'error');
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/feedback/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Feedback deleted successfully', 'success');
        fetchFeedback();
        fetchDashboardData();
      } else {
        showToast('Failed to delete feedback', 'error');
      }
    } catch (error) {
      showToast('Error deleting feedback', 'error');
    }
  };

  const generateRecommendations = () => {
    if (!dashboardData) return [];
    const recommendations = [];
    const { lowProducts, avgRating, ratingsDistribution, topProducts, totalFeedback } = dashboardData;

    if (totalFeedback === 0) {
      recommendations.push({
        type: 'warning',
        icon: '📝',
        title: 'No Feedback Yet',
        message: 'You have no customer feedback to analyze.',
        action: 'Encourage customers to leave reviews. Consider QR codes or incentives.'
      });
      return recommendations;
    }

    if (lowProducts?.length > 0) {
      const lowestProduct = lowProducts[0];
      if (lowestProduct.averageRating < 3) {
        recommendations.push({
          type: 'critical',
          icon: '⚠️',
          title: 'Critical: Low-Rated Product',
          message: `"${lowestProduct.name}" has ${lowestProduct.averageRating}/5 rating with ${lowestProduct.reviewCount} reviews.`,
          action: 'Urgent: Review recipe, improve quality, or consider removing from menu.'
        });
      } else if (lowestProduct.averageRating < 3.5) {
        recommendations.push({
          type: 'warning',
          icon: '⚠️',
          title: 'Underperforming Product',
          message: `"${lowestProduct.name}" needs improvement at ${lowestProduct.averageRating}/5.`,
          action: 'Gather specific feedback and adjust recipe or preparation method.'
        });
      }
    }

    if (avgRating < 3.5) {
      recommendations.push({
        type: 'critical',
        icon: '🎯',
        title: 'Below Target Performance',
        message: `Overall ${avgRating}/5 average is below industry standards.`,
        action: 'Immediate action: Staff retraining, quality audit, and customer service review.'
      });
    } else if (avgRating >= 4.5) {
      recommendations.push({
        type: 'success',
        icon: '🏆',
        title: 'Outstanding Performance',
        message: `Excellent ${avgRating}/5 rating demonstrates exceptional service quality.`,
        action: 'Maintain current standards, document best practices, consider expansion.'
      });
    } else if (avgRating >= 4.0) {
      recommendations.push({
        type: 'success',
        icon: '👍',
        title: 'Good Performance',
        message: `Solid ${avgRating}/5 rating shows consistent quality.`,
        action: 'Keep up the good work. Identify top performers for potential promotion.'
      });
    }

    const totalRatings = Object.values(ratingsDistribution).reduce((a, b) => a + b, 0);
    const lowRatings = ratingsDistribution[1] + ratingsDistribution[2];
    const highRatings = ratingsDistribution[4] + ratingsDistribution[5];
    
    if (totalRatings > 0) {
      const lowPercent = (lowRatings / totalRatings) * 100;
      const highPercent = (highRatings / totalRatings) * 100;

      if (lowPercent > 30) {
        recommendations.push({
          type: 'warning',
          icon: '📊',
          title: 'High Negative Feedback',
          message: `${lowPercent.toFixed(1)}% of ratings are 2★ or below (${lowRatings} reviews).`,
          action: 'Investigate common complaints. Staff training and quality control needed.'
        });
      }

      if (highPercent >= 70) {
        recommendations.push({
          type: 'success',
          icon: '🌟',
          title: 'Strong Customer Satisfaction',
          message: `${highPercent.toFixed(1)}% of customers rate 4-5 stars.`,
          action: 'Leverage positive reviews in marketing. Request testimonials.'
        });
      }
    }

    if (topProducts?.length > 0) {
      const topProduct = topProducts[0];
      if (topProduct.averageRating >= 4.5) {
        recommendations.push({
          type: 'success',
          icon: '⭐',
          title: 'Star Product',
          message: `"${topProduct.name}" excelling with ${topProduct.averageRating}/5 (${topProduct.reviewCount} reviews).`,
          action: 'Feature prominently in menu, create seasonal variations, use in promotions.'
        });
      }
    }

    if (topProducts?.length >= 3) {
      const top3Avg = topProducts.slice(0, 3).reduce((sum, p) => sum + parseFloat(p.averageRating), 0) / 3;
      if (top3Avg >= 4.3) {
        recommendations.push({
          type: 'success',
          icon: '📈',
          title: 'Strong Product Portfolio',
          message: `Your top 3 products average ${top3Avg.toFixed(2)}/5 stars.`,
          action: 'Product quality is consistent. Focus on marketing and customer acquisition.'
        });
      }
    }

    if (totalFeedback < 10) {
      recommendations.push({
        type: 'warning',
        icon: '💭',
        title: 'Limited Feedback Data',
        message: `Only ${totalFeedback} reviews collected. Results may not be statistically significant.`,
        action: 'Increase feedback collection through QR codes, follow-up emails, or incentives.'
      });
    }

    return recommendations.length > 0 ? recommendations : [{
      type: 'success',
      icon: '✅',
      title: 'Everything Looks Good',
      message: 'Your coffee shop is performing well with no major issues.',
      action: 'Continue monitoring feedback and maintaining quality standards.'
    }];
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '1.5rem' }}>Loading...</div>;

  const ratingsChartData = dashboardData ? [
    { name: '1★', value: dashboardData.ratingsDistribution[1], fill: COLORS[0] },
    { name: '2★', value: dashboardData.ratingsDistribution[2], fill: COLORS[1] },
    { name: '3★', value: dashboardData.ratingsDistribution[3], fill: COLORS[2] },
    { name: '4★', value: dashboardData.ratingsDistribution[4], fill: COLORS[3] },
    { name: '5★', value: dashboardData.ratingsDistribution[5], fill: COLORS[4] },
  ] : [];

  const topProductsChart = dashboardData?.topProducts?.slice(0, 8).map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    rating: parseFloat(p.averageRating)
  })) || [];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'products', label: 'Products', icon: '☕' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'account', label: 'Account Management', icon: '⚙️' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CoffeePlease</h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Admin Panel</p>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ padding: '0.875rem 1rem', backgroundColor: activeTab === item.id ? 'rgba(102, 126, 234, 0.2)' : 'transparent', color: activeTab === item.id ? '#A5B4FC' : '#D1D5DB', border: activeTab === item.id ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent', borderRadius: '0.75rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', fontWeight: activeTab === item.id ? '600' : '500', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {admin.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.125rem' }}>{admin.username}</p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{admin.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        {activeTab === 'dashboard' && dashboardData && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Dashboard</h1>
              <NotificationBell />
            </div>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Real-time analytics and insights</p>
            
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'Total Users', value: dashboardData.totalUsers, icon: '👥', color: '#3B82F6', bg: '#EFF6FF' },
                { label: 'Total Products', value: dashboardData.totalProducts, icon: '☕', color: '#8B5CF6', bg: '#F5F3FF' },
                { label: 'Total Reviews', value: dashboardData.totalFeedback, icon: '💬', color: '#EC4899', bg: '#FDF2F8' },
                { label: 'Avg Rating', value: `${dashboardData.avgRating}/5`, icon: '⭐', color: '#F59E0B', bg: '#FFFBEB' }
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>{stat.icon}</div>
                  <h3 style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</h3>
                  <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recommendations</h2>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2.5rem' }}>
              {generateRecommendations().map((rec, i) => (
                <div key={i} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${rec.type === 'success' ? '#10B981' : rec.type === 'critical' ? '#EF4444' : '#F59E0B'}` }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>{rec.icon}</span>
                    <div>
                      <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{rec.title}</h3>
                      <p style={{ color: '#4B5563', marginBottom: '0.75rem' }}>{rec.message}</p>
                      <div style={{ padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: '0.5rem', borderLeft: '3px solid #667eea' }}>
                        <p style={{ fontSize: '0.875rem', color: '#374151' }}><strong>Action:</strong> {rec.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Ratings Distribution</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={ratingsChartData} cx="50%" cy="50%" label={(e) => `${e.name}: ${e.value}`} outerRadius={100} dataKey="value">
                      {ratingsChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Top Products</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topProductsChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="rating" fill="#667eea" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Feedback ({feedback.length})</h1>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {feedback.map(item => (
                <div key={item._id} style={{ backgroundColor: 'white', padding: '1.75rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{item.productId?.name || 'Unknown'}</h3>
                      <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{item.userId?.name || item.customerName} • {item.userId?.email || item.customerEmail}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ padding: '0.5rem 1rem', backgroundColor: item.rating >= 4 ? '#ECFDF5' : '#FEE2E2', color: item.rating >= 4 ? '#059669' : '#DC2626', borderRadius: '0.5rem', fontWeight: 'bold' }}>{item.rating}/5</span>
                      <button onClick={() => deleteFeedback(item._id)} style={{ padding: '0.5rem 1rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                  <p>{item.comment || 'No comment'}</p>
                  {item.image && (
                    <img onClick={() => setSelectedImage(item.image)} src={item.image} alt="Review" style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '0.5rem', cursor: 'pointer', border: '2px solid #E5E7EB', marginTop: '1rem' }} />
                  )}
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '0.5rem' }}>{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Products ({products.length})</h1>
              <button onClick={() => { setEditingItem(null); setProductForm({ name: '', description: '', category: 'ICED COFFEE', price: 0 }); setShowProductModal(true); }} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>+ Add Product</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {products.map(p => (
                <div key={p._id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{p.name}</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem' }}>{p.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#F3F4F6', borderRadius: '0.375rem', fontSize: '0.75rem' }}>{p.category}</span>
                    <span style={{ fontWeight: 'bold', color: '#667eea' }}>₱{p.price}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setEditingItem(p); setProductForm({ name: p.name, description: p.description, category: p.category, price: p.price }); setShowProductModal(true); }} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                    <button onClick={() => deleteProduct(p._id)} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Users ({users.length})</h1>
              <button onClick={() => { setEditingItem(null); setUserForm({ name: '', email: '', phone: '', password: '' }); setShowUserModal(true); }} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>+ Add User</button>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#F3F4F6' }}>
                  <tr>
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
                      <td style={{ padding: '1rem' }}>{u.name}</td>
                      <td style={{ padding: '1rem' }}>{u.email}</td>
                      <td style={{ padding: '1rem' }}>{u.phone || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => { setEditingItem(u); setUserForm({ name: u.name, email: u.email, phone: u.phone || '', password: '' }); setShowUserModal(true); }} style={{ padding: '0.5rem 1rem', marginRight: '0.5rem', backgroundColor: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => deleteUser(u._id)} style={{ padding: '0.5rem 1rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Account Management</h1>
              <button onClick={() => { setEditingItem(null); setAdminForm({ username: '', email: '', phone: '', password: '', role: 'admin' }); setShowAdminModal(true); }} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>+ Add Admin</button>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Your Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Username</p>
                  <p style={{ fontWeight: '600' }}>{admin.username}</p>
                </div>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Email</p>
                  <p style={{ fontWeight: '600' }}>{admin.email}</p>
                </div>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Phone</p>
                  <p style={{ fontWeight: '600' }}>{admin.phone || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Role</p>
                  <p style={{ fontWeight: '600', textTransform: 'capitalize' }}>{admin.role}</p>
                </div>
              </div>
              <button onClick={() => { setEditingItem(admin); setAdminForm({ username: admin.username, email: admin.email, phone: admin.phone || '', password: '', role: admin.role }); setShowAdminModal(true); }} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>Edit Profile</button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#F3F4F6' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Username</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a._id} style={{ borderTop: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '1rem' }}>{a.username}</td>
                      <td style={{ padding: '1rem' }}>{a.email}</td>
                      <td style={{ padding: '1rem' }}>{a.phone || 'N/A'}</td>
                      <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{a.role}</td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => deleteAdmin(a._id)} disabled={a._id === admin.id} style={{ padding: '0.5rem 1rem', backgroundColor: a._id === admin.id ? '#F3F4F6' : '#FEE2E2', color: a._id === admin.id ? '#9CA3AF' : '#DC2626', border: 'none', borderRadius: '0.5rem', cursor: a._id === admin.id ? 'not-allowed' : 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      <Modal show={showUserModal} onClose={() => { setShowUserModal(false); setEditingItem(null); }} title={editingItem ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Name</label>
            <input required type="text" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
            <input required type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone (e.g., 09171234567)</label>
            <input required type="tel" pattern="^(09|\+639)\d{9}$" value={userForm.phone} onChange={(e) => setUserForm({...userForm, phone: e.target.value})} placeholder="09171234567" style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
          </div>
          {!editingItem && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Password</label>
              <input required type="password" minLength="6" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
            </div>
          )}
          <button type="submit" style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>{editingItem ? 'Update' : 'Create'} User</button>
        </form>
      </Modal>

      {/* Admin Modal */}
      <Modal show={showAdminModal} onClose={() => { setShowAdminModal(false); setEditingItem(null); }} title={editingItem ? 'Edit Admin' : 'Add Admin'}>
        <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Username</label>
            <input required type="text" value={adminForm.username} onChange={(e) => setAdminForm({...adminForm, username: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
            <input required type="email" value={adminForm.email} onChange={(e) => setAdminForm({...adminForm, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone (e.g., 09171234567)</label>
            <input required type="tel" pattern="^(09|\+639)\d{9}$" value={adminForm.phone} onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})} placeholder="09171234567" style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Password {editingItem && '(leave blank to keep current)'}</label>
            <input type="password" minLength="6" value={adminForm.password} onChange={(e) => setAdminForm({...adminForm, password: e.target.value})} required={!editingItem} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Role</label>
            <select value={adminForm.role} onChange={(e) => setAdminForm({...adminForm, role: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>{editingItem ? 'Update' : 'Create'} Admin</button>
        </form>
      </Modal>

      {/* Product Modal */}
      <Modal show={showProductModal} onClose={() => { setShowProductModal(false); setEditingItem(null); }} title={editingItem ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Product Name</label>
            <input required type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
            <textarea required value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} rows="3" style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Category</label>
            <select value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }}>
              <option value="ICED COFFEE">Iced Coffee</option>
              <option value="NON COFFEE">Non Coffee</option>
              <option value="HOT COFFEE">Hot Coffee</option>
              <option value="BLENDED DRINK">Blended Drink</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Price (₱)</label>
            <input required type="number" min="0" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem' }} />
          </div>
          <button type="submit" style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>{editingItem ? 'Update' : 'Create'} Product</button>
        </form>
      </Modal>

      {/* Image Modal */}
      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem' }}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '-40px', right: '0', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            <img src={selectedImage} alt="Full size" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '0.5rem' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;