import { useState, useEffect } from 'react';

const PASSPORT_API_URL = 'http://localhost:5001/api/passport';
const PRODUCTS_API_URL = 'http://localhost:5001/api/products';

const Passport = ({ currentUser }) => {
  const [passportData, setPassportData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewedProductsDetails, setReviewedProductsDetails] = useState([]);
  const [newBadges, setNewBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchPassportData();
      fetchLeaderboard();
    }
  }, [currentUser]);

  useEffect(() => {
    if (passportData) {
      checkForNewBadges();
    }
  }, [passportData]);

  const fetchPassportData = async () => {
    try {
      const response = await fetch(`${PASSPORT_API_URL}/${currentUser.id}`);
      const result = await response.json();
      if (result.success) {
        setPassportData(result.data);
        await fetchReviewedProducts(result.data.passport.reviewedProducts);
      }
    } catch (error) {
      console.error('Error fetching passport:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewedProducts = async (reviewedProducts) => {
    try {
      const response = await fetch(PRODUCTS_API_URL);
      const result = await response.json();
      
      if (result.success) {
        let allProducts = [];
        if (Array.isArray(result.data)) {
          allProducts = result.data;
        } else {
          Object.values(result.data).forEach(categoryProducts => {
            allProducts = [...allProducts, ...categoryProducts];
          });
        }

        const productDetails = reviewedProducts.map(reviewedItem => {
          const product = allProducts.find(p => 
            p._id?.toString() === reviewedItem.productId?.toString() || 
            p.id?.toString() === reviewedItem.productId?.toString()
          );
          return product ? {
            ...product,
            reviewedAt: reviewedItem.reviewedAt,
            category: reviewedItem.category
          } : null;
        }).filter(Boolean);

        setReviewedProductsDetails(productDetails);
      }
    } catch (error) {
      console.error('Error fetching reviewed products:', error);
    }
  };

  const checkForNewBadges = () => {
    const storedBadges = JSON.parse(localStorage.getItem(`seenBadges_${currentUser.id}`) || '[]');
    const currentBadgeNames = passportData.passport.badges.map(b => b.name);
    const unseenBadges = passportData.passport.badges.filter(badge => 
      !storedBadges.includes(badge.name)
    );

    if (unseenBadges.length > 0) {
      setNewBadges(unseenBadges);
      setShowBadgeModal(true);
      localStorage.setItem(`seenBadges_${currentUser.id}`, JSON.stringify(currentBadgeNames));
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${PASSPORT_API_URL}/leaderboard/top`);
      const result = await response.json();
      if (result.success) {
        setLeaderboard(result.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const getRankColor = (rank) => {
    const colors = {
      'Newbie': '#9CA3AF',
      'Coffee Explorer': '#F59E0B',
      'Espresso Expert': '#EF4444',
      'Latte Legend': '#8B5CF6',
      'Supreme Barista': '#F59E0B'
    };
    return colors[rank] || '#6B7280';
  };

  const getRankIcon = (rank) => {
    const icons = {
      'Newbie': '🌱',
      'Coffee Explorer': '🗺️',
      'Espresso Expert': '⚡',
      'Latte Legend': '👑',
      'Supreme Barista': '💎'
    };
    return icons[rank] || '☕';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'ICED COFFEE': '❄️',
      'HOT COFFEE': '☕',
      'NON COFFEE': '🍵',
      'BLENDED DRINK': '🥤'
    };
    return icons[category] || '☕';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2rem',
        color: '#6B7280'
      }}>
        Loading your passport...
      </div>
    );
  }

  if (!passportData) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2rem',
        color: '#6B7280'
      }}>
        Error loading passport data
      </div>
    );
  }

  const { passport, categoryProgress, totalProducts, completionPercentage } = passportData;

  const groupedProducts = reviewedProductsDetails.reduce((acc, product) => {
    const category = product.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  return (
    <div style={{
      minHeight: '80vh',
      padding: '3rem 2rem',
      backgroundColor: '#FFF7ED'
    }}>
      {/* Badge Unlock Modal */}
      {showBadgeModal && newBadges.length > 0 && (
        <div
          onClick={() => setShowBadgeModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '1.5rem',
              padding: '3rem',
              maxWidth: '500px',
              textAlign: 'center',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              animation: 'scaleIn 0.3s ease-out'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '1rem'
            }}>
              New Badge{newBadges.length > 1 ? 's' : ''} Unlocked!
            </h2>
            <div style={{
              display: 'grid',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {newBadges.map((badge, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#FFF7ED',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '3px solid #F59E0B'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                    {badge.icon}
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    color: '#1F2937',
                    marginBottom: '0.5rem'
                  }}>
                    {badge.name}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6B7280'
                  }}>
                    {badge.description}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowBadgeModal(false)}
              style={{
                padding: '0.875rem 2rem',
                backgroundColor: '#D97706',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#6F4E37',
            marginBottom: '0.5rem'
          }}>
            ☕ Coffee Passport
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#92400E'
          }}>
            Track your coffee journey and unlock achievements!
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {['overview', 'badges', 'leaderboard'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === tab ? '#D97706' : 'white',
                color: activeTab === tab ? 'white' : '#6F4E37',
                border: activeTab === tab ? 'none' : '2px solid #D97706',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Profile Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '2rem'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#1F2937',
                    marginBottom: '0.5rem'
                  }}>
                    {currentUser.name}
                  </h2>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: getRankColor(passport.rank),
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginTop: '0.5rem'
                  }}>
                    {getRankIcon(passport.rank)} {passport.rank}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '2rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#D97706'
                    }}>
                      {passport.stats.totalReviews}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                      Reviews
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#D97706'
                    }}>
                      {passport.badges.length}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                      Badges
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: '#D97706'
                    }}>
                      {passport.stats.currentStreak}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                      Day Streak 🔥
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div style={{ marginTop: '2rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontWeight: '600', color: '#374151' }}>
                    Overall Menu Progress
                  </span>
                  <span style={{ fontWeight: 'bold', color: '#D97706' }}>
                    {completionPercentage}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '1.5rem',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '1rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${completionPercentage}%`,
                    height: '100%',
                    backgroundColor: '#D97706',
                    transition: 'width 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {completionPercentage > 10 && `${passport.stats.totalReviews}/${totalProducts}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Progress */}
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '1rem'
            }}>
              Category Progress
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {Object.entries(categoryProgress).map(([category, progress]) => (
                <div
                  key={category}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '2rem' }}>
                      {getCategoryIcon(category)}
                    </span>
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: '#1F2937',
                        fontSize: '1.1rem'
                      }}>
                        {category}
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#6B7280'
                      }}>
                        {progress.reviewed} / {progress.total} items
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '0.75rem',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '0.5rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress.percentage}%`,
                      height: '100%',
                      backgroundColor: '#D97706',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <div style={{
                    marginTop: '0.5rem',
                    textAlign: 'right',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#D97706'
                  }}>
                    {progress.percentage}%
                  </div>
                </div>
              ))}
            </div>

            {/* Products You've Tried */}
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '1rem'
            }}>
              Products You've Tried ({reviewedProductsDetails.length})
            </h3>
            {Object.keys(groupedProducts).length > 0 ? (
              <div style={{ display: 'grid', gap: '2rem' }}>
                {Object.entries(groupedProducts).map(([category, products]) => (
                  <div key={category}>
                    <h4 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#6F4E37',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {getCategoryIcon(category)} {category}
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '1rem'
                    }}>
                      {products.map((product, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            border: '2px solid #FED7AA'
                          }}
                        >
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '0.5rem',
                                marginBottom: '0.75rem'
                              }}
                            />
                          )}
                          <h5 style={{
                            fontWeight: 'bold',
                            color: '#1F2937',
                            fontSize: '1rem',
                            marginBottom: '0.5rem'
                          }}>
                            {product.name}
                          </h5>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#6B7280',
                            marginBottom: '0.5rem'
                          }}>
                            {product.description}
                          </p>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          }}>
                            <span>₱{product.price}</span>
                            <span>
                              {new Date(product.reviewedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
                <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
                  You haven't reviewed any products yet.
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Start reviewing to unlock badges and track your journey!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '1rem'
            }}>
              Your Badges ({passport.badges.length})
            </h3>
            {passport.badges.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                {passport.badges.map((badge, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      textAlign: 'center',
                      border: '2px solid #FCD34D'
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                      {badge.icon}
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      color: '#1F2937',
                      marginBottom: '0.25rem'
                    }}>
                      {badge.name}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6B7280'
                    }}>
                      {badge.description}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#92400E',
                      marginTop: '0.5rem'
                    }}>
                      Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
                  No badges unlocked yet.
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Keep reviewing products to earn badges!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab - ✅ UPDATED */}
        {activeTab === 'leaderboard' && (
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '1rem'
            }}>
              Top Reviewers
            </h3>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    borderBottom: index < leaderboard.length - 1 ? '1px solid #E5E7EB' : 'none',
                    backgroundColor: entry.userId === currentUser.id ? '#FEF3C7' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#B45309' : '#6B7280',
                      minWidth: '2rem'
                    }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${entry.rank}`}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: '#1F2937',
                        fontSize: '1.1rem'
                      }}>
                        {entry.username}
                        {entry.userId === currentUser.id && (
                          <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#D97706'
                          }}>
                            (You)
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6B7280'
                      }}>
                        {getRankIcon(entry.currentRank)} {entry.currentRank}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#D97706'
                    }}>
                      {entry.totalReviews}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6B7280'
                    }}>
                      reviews
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes scaleIn {
            from {
              transform: scale(0.8);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Passport;