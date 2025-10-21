// src/admin/components/forms/UserForm.jsx
const UserForm = ({ userForm, setUserForm, onSubmit, editingItem }) => {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Username
        </label>
        <input 
          required 
          type="text" 
          value={userForm.username} 
          onChange={(e) => setUserForm({...userForm, username: e.target.value})} 
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
          Name
        </label>
        <input 
          required 
          type="text" 
          value={userForm.name} 
          onChange={(e) => setUserForm({...userForm, name: e.target.value})} 
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
          value={userForm.email} 
          onChange={(e) => setUserForm({...userForm, email: e.target.value})} 
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
          value={userForm.phone} 
          onChange={(e) => setUserForm({...userForm, phone: e.target.value})} 
          placeholder="09171234567" 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #D1D5DB', 
            borderRadius: '0.5rem' 
          }} 
        />
      </div>
      {!editingItem && (
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Password
          </label>
          <input 
            required 
            type="password" 
            minLength="6" 
            value={userForm.password} 
            onChange={(e) => setUserForm({...userForm, password: e.target.value})} 
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '1px solid #D1D5DB', 
              borderRadius: '0.5rem' 
            }} 
          />
        </div>
      )}
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
        {editingItem ? 'Update' : 'Create'} User
      </button>
    </form>
  );
};

export default UserForm;