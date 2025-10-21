// ProductsTab.jsx
const ProductsTab = ({ products, onAddProduct, onEditProduct, onDeleteProduct }) => {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
          Products ({products.length})
        </h1>
        <button 
          onClick={onAddProduct} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem', 
            cursor: 'pointer', 
            fontWeight: '600' 
          }}
        >
          + Add Product
        </button>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {products.map(p => (
          <div 
            key={p._id} 
            style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '1rem', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
            }}
          >
            <h3 style={{ 
              fontWeight: 'bold', 
              fontSize: '1.125rem', 
              marginBottom: '0.5rem' 
            }}>
              {p.name}
            </h3>
            <p style={{ 
              color: '#6B7280', 
              fontSize: '0.875rem', 
              marginBottom: '1rem' 
            }}>
              {p.description}
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1rem' 
            }}>
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                backgroundColor: '#F3F4F6', 
                borderRadius: '0.375rem', 
                fontSize: '0.75rem' 
              }}>
                {p.category}
              </span>
              <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                ₱{p.price}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => onEditProduct(p)} 
                style={{ 
                  flex: 1, 
                  padding: '0.5rem', 
                  backgroundColor: '#EFF6FF', 
                  color: '#3B82F6', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer', 
                  fontWeight: '600' 
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => onDeleteProduct(p._id)} 
                style={{ 
                  flex: 1, 
                  padding: '0.5rem', 
                  backgroundColor: '#FEE2E2', 
                  color: '#DC2626', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer', 
                  fontWeight: '600' 
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsTab;