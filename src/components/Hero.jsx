import { useState, useEffect } from 'react';
import { TrendingUp, Award, Star, Crown, Users, ThumbsUp, Trophy } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const PRODUCTS_API_URL = `${API_BASE}/products`;
const FEEDBACK_API_URL = `${API_BASE}/feedback`;

function Hero({ currentUser }) {
  const [bestSellers, setBestSellers] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [productHighlights, setProductHighlights] = useState({});
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

      if (bestSellersData.success) {
        const products = bestSellersData.data.slice(0, 3);
        setBestSellers(products);
        await fetchProductHighlights(products);
      }
      if (topRatedData.success) {
        const products = topRatedData.data.slice(0, 3);
        setTopRated(products);
        await fetchProductHighlights(products);
      }
      if (topProductsData.success) {
        const products = topProductsData.data.slice(0, 3);
        setTopProducts(products);
        await fetchProductHighlights(products);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductHighlights = async (products) => {
    try {
      const highlightsPromises = products.map(async (product) => {
        try {
          const response = await fetch(`${FEEDBACK_API_URL}/product/${product.id}`);
          const data = await response.json();
          
          if (data.success && data.data && data.data.length > 0) {
            const reviewsWithComments = data.data.filter(review => review.comment && review.comment.trim());
            const highlight = generateHighlight(reviewsWithComments, product);
            
            return {
              productId: product.id,
              highlight
            };
          }
          return {
            productId: product.id,
            highlight: "Loved by our customers for its great taste!"
          };
        } catch (error) {
          console.error(`Error fetching highlights for product ${product.id}:`, error);
          return {
            productId: product.id,
            highlight: "A customer favorite!"
          };
        }
      });

      const highlights = await Promise.all(highlightsPromises);
      const highlightsObj = {};
      highlights.forEach(h => {
        highlightsObj[h.productId] = h.highlight;
      });
      
      setProductHighlights(prev => ({ ...prev, ...highlightsObj }));
    } catch (error) {
      console.error('Error fetching product highlights:', error);
    }
  };

  const generateHighlight = (reviews, product) => {
    if (!reviews || reviews.length === 0) {
      return getDefaultDescription(product);
    }

    const keywords = {
      taste: ['delicious', 'tasty', 'yummy', 'flavorful', 'amazing', 'perfect', 'love', 'best', 'great taste', 'incredible'],
      quality: ['quality', 'premium', 'excellent', 'perfect', 'worth', 'good', 'high quality'],
      texture: ['smooth', 'creamy', 'rich', 'silky', 'thick', 'velvety'],
      sweetness: ['sweet', 'balanced', 'not too sweet', 'perfect sweetness', 'just right'],
      coffee: ['strong', 'bold', 'coffee flavor', 'espresso', 'aromatic', 'robust'],
      refreshing: ['refreshing', 'cool', 'fresh', 'light', 'crisp'],
      value: ['affordable', 'sulit', 'worth it', 'good price', 'value'],
      caramel: ['caramel', 'caramelized', 'buttery'],
      chocolate: ['chocolate', 'choco', 'cocoa', 'mocha'],
      matcha: ['matcha', 'green tea'],
      strawberry: ['strawberry', 'berry', 'fruity'],
      blueberry: ['blueberry'],
      mango: ['mango'],
      cookies: ['cookies', 'oreo', 'cookie']
    };

    const allComments = reviews.map(r => r.comment.toLowerCase()).join(' ');
    const productName = product.name.toLowerCase();
    const foundKeywords = {};

    // Count keywords in reviews
    Object.keys(keywords).forEach(category => {
      keywords[category].forEach(keyword => {
        if (allComments.includes(keyword)) {
          foundKeywords[category] = (foundKeywords[category] || 0) + 1;
        }
      });
    });

    // Check product name for specific ingredients
    let flavorCategory = null;
    if (productName.includes('caramel')) flavorCategory = 'caramel';
    else if (productName.includes('choco') || productName.includes('mocha')) flavorCategory = 'chocolate';
    else if (productName.includes('matcha')) flavorCategory = 'matcha';
    else if (productName.includes('strawberry')) flavorCategory = 'strawberry';
    else if (productName.includes('blueberry')) flavorCategory = 'blueberry';
    else if (productName.includes('mango')) flavorCategory = 'mango';
    else if (productName.includes('cookies')) flavorCategory = 'cookies';
    else if (productName.includes('spanish')) flavorCategory = 'spanish';

    // Get top 2 mentioned qualities
    const topCategories = Object.keys(foundKeywords)
      .sort((a, b) => foundKeywords[b] - foundKeywords[a])
      .slice(0, 2);

    // Generate description based on product + top qualities
    return getSpecificDescription(product, flavorCategory, topCategories, reviews.length);
  };

  const getSpecificDescription = (product, flavorCategory, topQualities, reviewCount) => {
    const name = product.name;
    const category = product.category;
    
    // Caramel-based drinks
    if (flavorCategory === 'caramel') {
      if (topQualities.includes('sweetness')) return `Perfect balance of rich caramel and sweetness - a crowd favorite`;
      if (topQualities.includes('texture')) return `Silky smooth caramel blend loved for its creamy texture`;
      if (topQualities.includes('coffee')) return `Bold espresso perfectly complemented by sweet caramel notes`;
      return `Rich caramel flavor that customers can't get enough of`;
    }
    
    // Chocolate/Mocha drinks
    if (flavorCategory === 'chocolate') {
      if (topQualities.includes('texture')) return `Decadently creamy chocolate blend with velvety smooth texture`;
      if (topQualities.includes('sweetness')) return `Perfectly balanced chocolate sweetness without being overwhelming`;
      if (topQualities.includes('coffee')) return `Rich mocha blend combining bold coffee with smooth chocolate`;
      return `Indulgent chocolate flavor that hits the sweet spot every time`;
    }
    
    // Matcha drinks
    if (flavorCategory === 'matcha') {
      if (topQualities.includes('texture')) return `Premium matcha with signature smooth and creamy consistency`;
      if (topQualities.includes('sweetness')) return `Authentic matcha taste with perfectly balanced natural sweetness`;
      if (topQualities.includes('refreshing')) return `Light and refreshing matcha blend perfect for any occasion`;
      return `Authentic Japanese matcha loved for its genuine green tea flavor`;
    }
    
    // Strawberry drinks
    if (flavorCategory === 'strawberry') {
      if (topQualities.includes('refreshing')) return `Refreshing strawberry blend bursting with fruity goodness`;
      if (topQualities.includes('sweetness')) return `Sweet and fruity strawberry perfection in every sip`;
      if (topQualities.includes('texture')) return `Creamy strawberry blend with smooth, satisfying texture`;
      return `Fresh strawberry flavor that tastes like summer in a cup`;
    }
    
    // Blueberry drinks
    if (flavorCategory === 'blueberry') {
      return `Vibrant blueberry flavor with the perfect fruity-sweet balance`;
    }
    
    // Mango drinks
    if (flavorCategory === 'mango') {
      if (topQualities.includes('refreshing')) return `Tropical mango refreshment that's always a summer hit`;
      return `Sweet tropical mango flavor that transports you to paradise`;
    }
    
    // Cookies & Cream
    if (flavorCategory === 'cookies') {
      if (topQualities.includes('texture')) return `Crunchy cookie bits blended into smooth cream perfection`;
      if (topQualities.includes('sweetness')) return `Sweet cookies and cream combo that's pure indulgence`;
      return `Classic cookies and cream blend loved by dessert enthusiasts`;
    }
    
    // Spanish Latte
    if (flavorCategory === 'spanish') {
      if (topQualities.includes('coffee')) return `Bold Spanish-style espresso with rich, condensed milk sweetness`;
      if (topQualities.includes('texture')) return `Ultra-creamy Spanish latte with luxurious smooth texture`;
      return `Authentic Spanish latte style with sweet condensed milk richness`;
    }
    
    // Coffee-focused drinks (no specific flavor)
    if (category.includes('COFFEE')) {
      if (topQualities.includes('coffee')) return `Strong, bold coffee flavor that true enthusiasts appreciate`;
      if (topQualities.includes('texture')) return `Perfectly crafted espresso with smooth, rich consistency`;
      if (topQualities.includes('quality')) return `Premium coffee beans shine through in every expertly-made cup`;
      return `Expertly crafted coffee blend with exceptional depth of flavor`;
    }
    
    // Blended/Frappe drinks
    if (category.includes('BLENDED')) {
      if (topQualities.includes('texture')) return `Perfectly blended with smooth, icy consistency customers crave`;
      if (topQualities.includes('refreshing')) return `Refreshingly cold and smooth - ideal for beating the heat`;
      return `Perfectly blended frozen treat with irresistible smooth texture`;
    }
    
    // Generic fallbacks based on top qualities
    if (topQualities.includes('taste')) return `Exceptional flavor profile that keeps customers coming back`;
    if (topQualities.includes('quality')) return `Premium ingredients and expert preparation in every cup`;
    if (topQualities.includes('value')) return `Outstanding quality at a price that offers incredible value`;
    
    return `Highly rated for its consistent quality and delicious taste`;
  };

  const getDefaultDescription = (product) => {
    const name = product.name.toLowerCase();
    
    if (name.includes('caramel')) return `Rich caramel sweetness in every delightful sip`;
    if (name.includes('spanish')) return `Authentic Spanish latte with sweet condensed milk`;
    if (name.includes('mocha') || name.includes('choco')) return `Indulgent chocolate coffee blend`;
    if (name.includes('matcha')) return `Premium Japanese matcha with authentic taste`;
    if (name.includes('strawberry')) return `Fresh and fruity strawberry goodness`;
    if (name.includes('blueberry')) return `Sweet blueberry flavor in every sip`;
    if (name.includes('mango')) return `Tropical mango refreshment`;
    if (name.includes('cookies')) return `Classic cookies and cream favorite`;
    if (product.category.includes('COFFEE')) return `Expertly crafted coffee with rich flavor`;
    if (product.category.includes('BLENDED')) return `Smooth, icy blended perfection`;
    
    return `A delicious favorite loved by our customers`;
  };

  const ProductCard = ({ product, rank }) => {
    const highlight = productHighlights[product.id] || "Loading...";
    
    return (
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
          fontSize: '1.15rem',
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: '0.5rem',
          textAlign: 'center',
          lineHeight: '1.3'
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
          marginBottom: '1rem',
          fontWeight: '600'
        }}>
          {product.category}
        </p>

        {/* Highlight Box */}
        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          border: '2px solid #FCD34D',
          flex: '1',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%'
          }}>
            <Star fill="#F59E0B" color="#F59E0B" size={18} style={{ flexShrink: 0 }} />
            <p style={{
              fontSize: '0.875rem',
              lineHeight: '1.5',
              color: '#78350F',
              margin: 0,
              fontWeight: '500'
            }}>
              {highlight}
            </p>
          </div>
        </div>

        {/* Rating & Reviews */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          padding: '0.5rem',
          background: '#F9FAFB',
          borderRadius: '0.5rem'
        }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                size={14}
                fill={i < Math.floor(product.averageRating) ? '#F59E0B' : 'none'}
                color="#F59E0B"
              />
            ))}
          </div>
          <span style={{
            fontSize: '0.95rem',
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
          fontSize: '1.75rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          ₱{product.price}
        </div>
      </div>
    );
  };

  const Section = ({ title, icon: Icon, products, color, description, descriptionIcon: DescIcon }) => (
    <div style={{
      flex: '1',
      minWidth: '300px',
      maxWidth: '400px'
    }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        padding: '1.25rem',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderRadius: '1rem',
        border: `2px solid ${color}30`
      }}>
        <Icon color={color} size={28} strokeWidth={2.5} />
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '800',
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
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>No products yet</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
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
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            {currentUser ? `Welcome back, ${currentUser.name}! ☕` : 'Welcome to CoffeePlease ☕'}
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
            color: '#6B7280',
            maxWidth: '700px',
            margin: '0 auto',
            fontWeight: '500'
          }}>
            Discover what makes each drink special and why customers love them
          </p>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            fontSize: '1.2rem',
            color: '#6B7280'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '5px solid #F3F4F6',
              borderTop: '5px solid #D97706',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem'
            }} />
            <p style={{ margin: 0, fontWeight: '600' }}>Loading featured products...</p>
          </div>
        ) : (
          <>
            {/* 3 Column Grid */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              marginBottom: '4rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}>
              <Section
                title="Best Sellers"
                icon={TrendingUp}
                products={bestSellers}
                color="#10B981"
              />
              <Section
                title="Highest Rated"
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
                  padding: '1.25rem 3.5rem',
                  background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '3rem',
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  boxShadow: '0 10px 30px rgba(217, 119, 6, 0.3)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.02em'
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
                Explore Full Menu →
              </a>
            </div>
          </>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          section#home > div > div:nth-child(2) {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero;