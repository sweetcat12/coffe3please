import { useState, useEffect } from 'react';
import MenuItem from './MenuItem';

const PRODUCTS_API_URL = 'http://localhost:5001/api/products';
const FEEDBACK_API_URL = 'http://localhost:5001/api/feedback';

function Menu({ openRatingModal }) {
  const [menuItems, setMenuItems] = useState({});
  const [productRatings, setProductRatings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsRes = await fetch(PRODUCTS_API_URL);
      const productsData = await productsRes.json();
      
      if (productsData.success) {
        setMenuItems(productsData.data);
        
        // Get all product IDs
        const allProductIds = [];
        Object.values(productsData.data).forEach(categoryItems => {
          categoryItems.forEach(item => {
            allProductIds.push(item.id);
          });
        });
        
        // Fetch ratings for all products
        await fetchAllRatings(allProductIds);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRatings = async (productIds) => {
    try {
      const ratingsPromises = productIds.map(async (productId) => {
        try {
          const response = await fetch(`${FEEDBACK_API_URL}/product/${productId}`);
          const data = await response.json();
          
          if (data.success) {
            return {
              productId,
              averageRating: data.averageRating || 0,
              reviewCount: data.count || 0,
              reviews: data.data || []
            };
          }
          return {
            productId,
            averageRating: 0,
            reviewCount: 0,
            reviews: []
          };
        } catch (error) {
          console.error(`Error fetching ratings for product ${productId}:`, error);
          return {
            productId,
            averageRating: 0,
            reviewCount: 0,
            reviews: []
          };
        }
      });

      const ratingsResults = await Promise.all(ratingsPromises);
      
      // Convert array to object
      const ratingsObj = {};
      ratingsResults.forEach(result => {
        ratingsObj[result.productId] = result;
      });
      
      setProductRatings(ratingsObj);
    } catch (error) {
      console.error('Error fetching all ratings:', error);
    }
  };

  const getAverageRating = (productId) => {
    return productRatings[productId]?.averageRating || 0;
  };

  const getReviewCount = (productId) => {
    return productRatings[productId]?.reviewCount || 0;
  };

  if (loading) {
    return (
      <section id="menu" className="menu">
        <div className="container">
          <h2>Our Menu</h2>
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
            Loading menu...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="menu">
      <div className="container">
        <h2>Our Menu</h2>
        <div className="menu-categories">
          {Object.entries(menuItems).map(([category, items]) => (
            <div key={category} className="menu-category">
              <h3>{category}</h3>
              {items.map(item => (
                <MenuItem 
                  key={item.id}
                  item={item}
                  category={category}
                  openRatingModal={openRatingModal}
                  averageRating={getAverageRating(item.id)}
                  reviewCount={getReviewCount(item.id)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}

export default Menu;