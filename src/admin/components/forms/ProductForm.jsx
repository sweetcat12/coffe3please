// ProductForm.jsx
const ProductForm = ({ productForm, setProductForm, onSubmit, editingItem }) => {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Product Name
        </label>
        <input 
          required 
          type="text" 
          value={productForm.name} 
          onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
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
          Description
        </label>
        <textarea 
          required 
          value={productForm.description} 
          onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
          rows="3" 
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
          Category
        </label>
        <select 
          value={productForm.category} 
          onChange={(e) => setProductForm({...productForm, category: e.target.value})} 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #D1D5DB', 
            borderRadius: '0.5rem' 
          }}
        >
          <option value="ICED COFFEE">Iced Coffee</option>
          <option value="NON COFFEE">Non Coffee</option>
          <option value="HOT COFFEE">Hot Coffee</option>
          <option value="BLENDED DRINK">Blended Drink</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Price (₱)
        </label>
        <input 
          required 
          type="number" 
          min="0" 
          value={productForm.price} 
          onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})} 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid #D1D5DB', 
            borderRadius: '0.5rem' 
          }} 
        />
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
        {editingItem ? 'Update' : 'Create'} Product
      </button>
    </form>
  );
};

export default ProductForm;