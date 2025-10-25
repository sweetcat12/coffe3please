// src/admin/utils/apiService.jsx
const API_URL = 'http://localhost:5001/api';

export const api = {
  // ==================== DASHBOARD ====================
  fetchDashboardData: async () => {
    const res = await fetch(`${API_URL}/admin/dashboard`);
    return await res.json();
  },

  // ==================== USERS ====================
  fetchUsers: async () => {
    const res = await fetch(`${API_URL}/admin/users`);
    return await res.json();
  },

  fetchPendingUsers: async () => {
    const res = await fetch(`${API_URL}/admin/users/pending`);
    return await res.json();
  },

  createUser: async (userData) => {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  updateUser: async (id, userData) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, { 
      method: 'DELETE' 
    });
    return await res.json();
  },

  // ===== NEW: USER APPROVAL METHODS =====
  approveUser: async (id, adminId) => {
    const res = await fetch(`${API_URL}/admin/users/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId })
    });
    return await res.json();
  },

  rejectUser: async (id, adminId, reason) => {
    const res = await fetch(`${API_URL}/admin/users/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, reason })
    });
    return await res.json();
  },

  // ==================== ADMINS ====================
  fetchAdmins: async () => {
    const res = await fetch(`${API_URL}/admin/all`);
    return await res.json();
  },

  createAdmin: async (adminData) => {
    const res = await fetch(`${API_URL}/admin/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    return await res.json();
  },

  updateAdmin: async (id, adminData) => {
    const res = await fetch(`${API_URL}/admin/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    return await res.json();
  },

  deleteAdmin: async (id) => {
    const res = await fetch(`${API_URL}/admin/${id}`, { 
      method: 'DELETE' 
    });
    return await res.json();
  },

  // ==================== FEEDBACK ====================
  fetchFeedback: async () => {
    const res = await fetch(`${API_URL}/admin/feedback`);
    return await res.json();
  },

  deleteFeedback: async (id) => {
    const res = await fetch(`${API_URL}/admin/feedback/${id}`, { 
      method: 'DELETE' 
    });
    return await res.json();
  },

  // ==================== PRODUCTS ====================
  fetchProducts: async () => {
    const res = await fetch(`${API_URL}/products`);
    return await res.json();
  },

  createProduct: async (productData) => {
    const res = await fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return await res.json();
  },

  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return await res.json();
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, { 
      method: 'DELETE' 
    });
    return await res.json();
  }
};