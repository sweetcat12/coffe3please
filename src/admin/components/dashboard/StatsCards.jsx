// src/admin/components/dashboard/StatsCards.jsx
import { useState } from 'react';

const StatsCards = ({ dashboardData }) => {
  const [expandedCard, setExpandedCard] = useState(null);

  if (!dashboardData) return null;

  const {
    totalUsers = 0,
    totalProducts = 0,
    totalFeedback = 0,
    avgRating = 0,
    ratingsDistribution = {}
  } = dashboardData;

  // Calculate advanced metrics
  const positiveRatings = (ratingsDistribution[4] || 0) + (ratingsDistribution[5] || 0);
  const negativeRatings = (ratingsDistribution[1] || 0) + (ratingsDistribution[2] || 0);
  const neutralRatings = ratingsDistribution[3] || 0;
  
  const satisfactionRate = totalFeedback > 0 ? ((positiveRatings / totalFeedback) * 100) : 0;
  const criticalIssueRate = totalFeedback > 0 ? ((negativeRatings / totalFeedback) * 100) : 0;
  const reviewsPerUser = totalUsers > 0 ? (totalFeedback / totalUsers) : 0;
  const reviewsPerProduct = totalProducts > 0 ? (totalFeedback / totalProducts) : 0;

  const stats = [
    {
      id: 'satisfaction',
      label: 'Customer Satisfaction',
      value: `${satisfactionRate.toFixed(1)}%`,
      icon: satisfactionRate >= 80 ? '😊' : satisfactionRate >= 60 ? '😐' : '😟',
      color: satisfactionRate >= 80 ? '#10B981' : satisfactionRate >= 60 ? '#F59E0B' : '#EF4444',
      bg: satisfactionRate >= 80 ? '#D1FAE5' : satisfactionRate >= 60 ? '#FEF3C7' : '#FEE2E2',
      trend: satisfactionRate >= 80 ? 'Excellent' : satisfactionRate >= 60 ? 'Good' : 'Needs Attention',
      trendUp: satisfactionRate >= 70,
      details: [
        { label: '5-Star Reviews', value: ratingsDistribution[5] || 0, color: '#10B981' },
        { label: '4-Star Reviews', value: ratingsDistribution[4] || 0, color: '#34D399' },
        { label: 'Positive Ratio', value: `${positiveRatings}/${totalFeedback}` }
      ]
    },
    {
      id: 'quality',
      label: 'Average Quality Score',
      value: `${parseFloat(avgRating).toFixed(2)}/5`,
      icon: '⭐',
      color: avgRating >= 4 ? '#10B981' : avgRating >= 3 ? '#F59E0B' : '#EF4444',
      bg: avgRating >= 4 ? '#D1FAE5' : avgRating >= 3 ? '#FEF3C7' : '#FEE2E2',
      trend: avgRating >= 4 ? 'High Quality' : avgRating >= 3 ? 'Acceptable' : 'Low Quality',
      trendUp: avgRating >= 3.5,
      details: [
        { label: 'Total Reviews', value: totalFeedback, color: '#667eea' },
        { label: 'Negative Reviews', value: negativeRatings, color: '#EF4444' },
        { label: 'Critical Issues', value: `${criticalIssueRate.toFixed(1)}%` }
      ]
    },
    {
      id: 'engagement',
      label: 'Customer Engagement',
      value: reviewsPerUser.toFixed(1),
      icon: '💬',
      color: '#EC4899',
      bg: '#FDF2F8',
      trend: reviewsPerUser >= 2 ? 'Highly Engaged' : reviewsPerUser >= 1 ? 'Moderate' : 'Low Engagement',
      trendUp: reviewsPerUser >= 1.5,
      details: [
        { label: 'Total Customers', value: totalUsers, color: '#3B82F6' },
        { label: 'Reviews/Customer', value: reviewsPerUser.toFixed(2), color: '#EC4899' },
        { label: 'Active Users', value: `${Math.round((totalFeedback / (totalUsers || 1)) * 100)}%` }
      ]
    },
    {
      id: 'coverage',
      label: 'Product Coverage',
      value: reviewsPerProduct.toFixed(1),
      icon: '☕',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      trend: reviewsPerProduct >= 5 ? 'Excellent' : reviewsPerProduct >= 3 ? 'Good' : 'Needs More Reviews',
      trendUp: reviewsPerProduct >= 3,
      details: [
        { label: 'Total Products', value: totalProducts, color: '#8B5CF6' },
        { label: 'Reviews/Product', value: reviewsPerProduct.toFixed(2), color: '#667eea' },
        { label: 'Avg Reviews', value: `${totalFeedback} total` }
      ]
    }
  ];

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {stats.map((stat) => (
          <div 
            key={stat.id}
            onClick={() => setExpandedCard(expandedCard === stat.id ? null : stat.id)}
            style={{ 
              backgroundColor: 'white', 
              padding: '1.25rem', 
              borderRadius: '0.875rem', 
              boxShadow: expandedCard === stat.id ? '0 6px 12px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08)',
              border: expandedCard === stat.id ? `2px solid ${stat.color}` : '1px solid #E5E7EB',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: expandedCard === stat.id ? 'translateY(-2px)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: stat.bg, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.75rem'
              }}>
                {stat.icon}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.625rem',
                borderRadius: '9999px',
                backgroundColor: stat.trendUp ? '#D1FAE5' : '#FEE2E2',
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: stat.trendUp ? '#065F46' : '#991B1B'
              }}>
                <span>{stat.trendUp ? '↑' : '↓'}</span>
                <span>{stat.trend}</span>
              </div>
            </div>

            <h3 style={{ color: '#6B7280', fontSize: '0.8125rem', marginBottom: '0.375rem', fontWeight: '500' }}>
              {stat.label}
            </h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: stat.color, marginBottom: '0', lineHeight: '1' }}>
              {stat.value}
            </p>

            {expandedCard === stat.id && (
              <div style={{ 
                marginTop: '0.875rem', 
                paddingTop: '0.875rem', 
                borderTop: '1px solid #E5E7EB'
              }}>
                {stat.details.map((detail, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.375rem 0',
                    fontSize: '0.8125rem'
                  }}>
                    <span style={{ color: '#6B7280' }}>{detail.label}</span>
                    <span style={{ 
                      fontWeight: '600', 
                      color: detail.color || '#111827',
                      backgroundColor: detail.color ? `${detail.color}15` : '#F3F4F6',
                      padding: '0.1875rem 0.625rem',
                      borderRadius: '0.375rem'
                    }}>
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Insights Bar - More Compact */}
      <div style={{
        backgroundColor: 'white',
        padding: '1rem 1.25rem',
        borderRadius: '0.875rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.375rem', fontWeight: '700', color: '#10B981' }}>
              {positiveRatings}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '0.125rem' }}>
              Positive Reviews
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.375rem', fontWeight: '700', color: '#F59E0B' }}>
              {neutralRatings}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '0.125rem' }}>
              Neutral Reviews
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.375rem', fontWeight: '700', color: '#EF4444' }}>
              {negativeRatings}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '0.125rem' }}>
              Needs Attention
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.375rem', fontWeight: '700', color: '#667eea' }}>
              {totalProducts}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '0.125rem' }}>
              Menu Items
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;