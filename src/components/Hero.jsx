import { useState, useEffect } from 'react';
import { TrendingUp, Award, Star, Crown } from 'lucide-react';

const PRODUCTS_API_URL = 'http://localhost:5001/api/products';

function Hero({ currentUser }) {
  const [bestSellers, setBestSellers] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const [bestSellersRes, topRatedRes, topProductsRes] = await Promise.all([
        fetch(`${PRODUCTS_API_URL}/best-sellers`),
        fetch(`${PRODUCTS_API_URL}/top-rated`),
        fetch(`${PRODUCTS_API_URL}/top-products`)
      ]);

      const bestSellersData = await bestSellersRes.json();
      const topRatedData = await topRatedRes.json();
      const topProductsData = await topProductsRes.json();

      if (bestSellersData.success) setBestSellers(bestSellersData.data.slice(0, 3));
      if (topRatedData.success) setTopRated(topRatedData.data.slice(0, 3));
      if (topProductsData.success) setTopProducts(topProductsData.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ product, rank }) => (
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      position: 'relative',
      border: '2px solid transparent',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 119, 6, 0.2)';
      e.currentTarget.style.borderColor = '#D97706';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      e.currentTarget.style.borderColor = 'transparent';
    }}>
      {/* Rank Badge */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: rank === 1 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 
                    rank === 2 ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)' :
                    'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '1.1rem',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 10
      }}>
        #{rank}
      </div>

      {/* Coffee Icon */}
      <div style={{
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1rem',
        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
      }}>
        <span style={{ fontSize: '2rem' }}>☕</span>
      </div>

      {/* Product Name */}
      <h4 style={{
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: '0.5rem',
        textAlign: 'center',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {product.name}
      </h4>

      {/* Category */}
      <p style={{
        fontSize: '0.75rem',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textAlign: 'center',
        marginBottom: '0.75rem'
      }}>
        {product.category}
      </p>

      {/* Rating & Reviews */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem'
      }}>
        <Star fill="#F59E0B" color="#F59E0B" size={16} />
        <span style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: '#1F2937'
        }}>
          {product.averageRating}
        </span>
        <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
          ({product.reviewCount})
        </span>
      </div>

      {/* Price */}
      <div style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#D97706',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        ₱{product.price}
      </div>
    </div>
  );

  const Section = ({ title, icon: Icon, products, color }) => (
    <div style={{
      flex: '1',
      minWidth: '280px'
    }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '2rem',
        padding: '1rem',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderRadius: '1rem',
        border: `2px solid ${color}30`
      }}>
        <Icon color={color} size={28} />
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1F2937',
          margin: 0
        }}>
          {title}
        </h2>
      </div>

      {/* Products Grid */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {products.length > 0 ? (
          products.map((product, index) => (
            <ProductCard key={product.id} product={product} rank={index + 1} />
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#9CA3AF',
            background: '#F9FAFB',
            borderRadius: '1rem',
            border: '2px dashed #E5E7EB'
          }}>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>No products yet</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
              Add reviews to see products here!
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section id="home" style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FEF3C7 0%, #FFFFFF 100%)',
      padding: '6rem 2rem 4rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Welcome Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            {currentUser ? `Welcome, ${currentUser.name}! ` : 'Welcome to CoffeePlease '}
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#6B7280',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Discover our most loved coffees, highest-rated favorites, and top picks!
          </p>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            fontSize: '1.2rem',
            color: '#6B7280'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #F3F4F6',
              borderTop: '4px solid #D97706',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            Loading featured products...
          </div>
        ) : (
          <>
            {/* 3 Column Grid */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              marginBottom: '3rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <Section
                title="Best Sellers"
                icon={TrendingUp}
                products={bestSellers}
                color="#10B981"
              />
              <Section
                title="Highest Rating"
                icon={Award}
                products={topRated}
                color="#F59E0B"
              />
              <Section
                title="Top Products"
                icon={Crown}
                products={topProducts}
                color="#8B5CF6"
              />
            </div>

            {/* CTA Button */}
            <div style={{
              textAlign: 'center',
              marginTop: '3rem'
            }}>
              <a 
                href="#menu"
                style={{
                  display: 'inline-block',
                  padding: '1rem 3rem',
                  background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '3rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  boxShadow: '0 10px 30px rgba(217, 119, 6, 0.3)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(217, 119, 6, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(217, 119, 6, 0.3)';
                }}
              >
                Explore Full Menu
              </a>
            </div>
          </>
        )}
      </div>

      {/* CSS Animation for Loading Spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          section#home > div > div:nth-child(2) {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;