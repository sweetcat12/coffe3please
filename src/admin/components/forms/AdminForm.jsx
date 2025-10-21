// AdminForm.jsx
const AdminForm = ({ adminForm, setAdminForm, onSubmit, editingItem }) => {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Username
        </label>
        <input 
          required 
          type="text" 
          value={adminForm.username} 
          onChange={(e) => setAdminForm({...adminForm, username: e.target.value})} 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #D1D5DB', 
            borderRadius: '0.5rem' 
          }} 
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Email
        </label>
        <input 
          required 
          type="email" 
          value={adminForm.email} 
          onChange={(e) => setAdminForm({...adminForm, email: e.target.value})} 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #D1D5DB', 
            borderRadius: '0.5rem' 
          }} 
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Phone (e.g., 09171234567)
        </label>
        <input 
          required 
          type="tel" 
          pattern="^(09|\+639)\d{9}$" 
          value={adminForm.phone} 
          onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})} 
          placeholder="09171234567" 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #D1D5DB', 
            borderRadius: '0.5rem' 
          }} 
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Password {editingItem && '(leave blank to keep current)'}
        </label>
        <input 
          type="password" 
          minLength="6" 
          value={adminForm.password} 
          onChange={(e) => setAdminForm({...adminForm, password: e.target.value})} 
          required={!editingItem} 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #D1D5DB', 
            borderRadius: '0.5rem' 
          }} 
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Role
        </label>
        <select 
          value={adminForm.role} 
          onChange={(e) => setAdminForm({...adminForm, role: e.target.value})} 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #D1D5DB', 
            borderRadius: '0.5rem' 
          }}
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      <button 
        type="submit" 
        style={{ 
          padding: '0.75rem', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          border: 'none', 
          borderRadius: '0.5rem', 
          cursor: 'pointer', 
          fontWeight: '600' 
        }}
      >
        {editingItem ? 'Update' : 'Create'} Admin
      </button>
    </form>
  );
};

export default AdminForm;