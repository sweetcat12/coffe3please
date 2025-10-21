// src/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import Sidebar from './components/layout/Sidebar';
import Modal from './components/layout/Modal';
import StatsCards from './components/dashboard/StatsCards';
import Recommendations from './components/dashboard/Recommendations';
import DashboardCharts from './components/dashboard/DashboardCharts';
import FeedbackTab from './components/tabs/FeedbackTab';
import ProductsTab from './components/tabs/ProductsTab';
import UsersTab from './components/tabs/UsersTab';
import AccountTab from './components/tabs/AccountTab';
import UserForm from './components/forms/UserForm';
import AdminForm from './components/forms/AdminForm';
import ProductForm from './components/forms/ProductForm';
import { api } from './utils/apiService';
import { generateRecommendationsWithGemini } from './utils/recommendationsUtils';

function AdminDashboard({ admin, onLogout, showToast }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
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
  const [userForm, setUserForm] = useState({ username: '', name: '', email: '', phone: '', password: '' });
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
      const data = await api.fetchDashboardData();
      if (data.success) {
        setDashboardData(data.data);
        // Fetch AI recommendations after dashboard data loads
        fetchRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (dashboardDataToUse) => {
    setLoadingRecommendations(true);
    try {
      const recs = await generateRecommendationsWithGemini(dashboardDataToUse);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      showToast('Failed to generate recommendations', 'error');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.fetchUsers();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const data = await api.fetchAdmins();
      if (data.success) setAdmins(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const data = await api.fetchFeedback();
      if (data.success) setFeedback(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await api.fetchProducts();
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

  // User operations
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = editingItem 
        ? await api.updateUser(editingItem._id, { 
            username: userForm.username,
            name: userForm.name, 
            email: userForm.email, 
            phone: userForm.phone 
          })
        : await api.createUser(userForm);
      
      if (data.success) {
        showToast(editingItem ? 'User updated successfully' : 'User created successfully', 'success');
        setShowUserModal(false);
        setUserForm({ username: '', name: '', email: '', phone: '', password: '' });
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
      const data = await api.deleteUser(id);
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
      const data = editingItem 
        ? await api.updateAdmin(editingItem._id, adminForm)
        : await api.createAdmin(adminForm);
      
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
      const data = await api.deleteAdmin(id);
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
      const data = editingItem 
        ? await api.updateProduct(editingItem._id, productForm)
        : await api.createProduct(productForm);
      
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
      const data = await api.deleteProduct(id);
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
      const data = await api.deleteFeedback(id);
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        fontSize: '1.5rem' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} admin={admin} onLogout={onLogout} />

      <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        {activeTab === 'dashboard' && dashboardData && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Dashboard</h1>
              <NotificationBell />
            </div>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Real-time analytics and insights</p>
            
            <StatsCards dashboardData={dashboardData} />
            {loadingRecommendations ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Loading AI recommendations...
              </div>
            ) : (
              <Recommendations recommendations={recommendations} />
            )}
            <DashboardCharts dashboardData={dashboardData} />
          </div>
        )}

        {activeTab === 'feedback' && (
          <FeedbackTab 
            feedback={feedback} 
            onDeleteFeedback={deleteFeedback} 
            onImageClick={setSelectedImage} 
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab 
            products={products}
            onAddProduct={() => {
              setEditingItem(null);
              setProductForm({ name: '', description: '', category: 'ICED COFFEE', price: 0 });
              setShowProductModal(true);
            }}
            onEditProduct={(p) => {
              setEditingItem(p);
              setProductForm({ name: p.name, description: p.description, category: p.category, price: p.price });
              setShowProductModal(true);
            }}
            onDeleteProduct={deleteProduct}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={users}
            onAddUser={() => {
              setEditingItem(null);
              setUserForm({ username: '', name: '', email: '', phone: '', password: '' });
              setShowUserModal(true);
            }}
            onEditUser={(u) => {
              setEditingItem(u);
              setUserForm({ username: u.username, name: u.name, email: u.email, phone: u.phone || '', password: '' });
              setShowUserModal(true);
            }}
            onDeleteUser={deleteUser}
          />
        )}

        {activeTab === 'account' && (
          <AccountTab 
            admin={admin}
            admins={admins}
            onAddAdmin={() => {
              setEditingItem(null);
              setAdminForm({ username: '', email: '', phone: '', password: '', role: 'admin' });
              setShowAdminModal(true);
            }}
            onEditProfile={() => {
              setEditingItem(admin);
              setAdminForm({ username: admin.username, email: admin.email, phone: admin.phone || '', password: '', role: admin.role });
              setShowAdminModal(true);
            }}
            onDeleteAdmin={deleteAdmin}
          />
        )}
      </div>

      {/* Modals */}
      <Modal show={showUserModal} onClose={() => { setShowUserModal(false); setEditingItem(null); }} title={editingItem ? 'Edit User' : 'Add User'}>
        <UserForm userForm={userForm} setUserForm={setUserForm} onSubmit={handleUserSubmit} editingItem={editingItem} />
      </Modal>

      <Modal show={showAdminModal} onClose={() => { setShowAdminModal(false); setEditingItem(null); }} title={editingItem ? 'Edit Admin' : 'Add Admin'}>
        <AdminForm adminForm={adminForm} setAdminForm={setAdminForm} onSubmit={handleAdminSubmit} editingItem={editingItem} />
      </Modal>

      <Modal show={showProductModal} onClose={() => { setShowProductModal(false); setEditingItem(null); }} title={editingItem ? 'Edit Product' : 'Add Product'}>
        <ProductForm productForm={productForm} setProductForm={setProductForm} onSubmit={handleProductSubmit} editingItem={editingItem} />
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