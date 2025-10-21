// src/admin/components/dashboard/Recommendations.jsx
import { useState } from 'react';

const Recommendations = ({ recommendations, dashboardData }) => {
  const [filter, setFilter] = useState('all');

  // Generate additional data-driven recommendations
  const generateDataDrivenRecommendations = () => {
    const recs = [...(recommendations || [])];
    
    if (!dashboardData) return recs;

    const { avgRating, totalFeedback, ratingsDistribution } = dashboardData;
    
    // Critical issues check
    const negativeCount = (ratingsDistribution[1] || 0) + (ratingsDistribution[2] || 0);
    if (negativeCount > totalFeedback * 0.2) {
      recs.push({
        type: 'critical',
        icon: '🚨',
        title: 'High Negative Review Rate',
        message: `${negativeCount} negative reviews (${((negativeCount/totalFeedback)*100).toFixed(1)}%) detected. This is above acceptable threshold.`,
        action: 'Conduct immediate quality audit and customer feedback session.',
        priority: 1
      });
    }

    // Low engagement warning
    if (totalFeedback < 50) {
      recs.push({
        type: 'warning',
        icon: '📢',
        title: 'Low Customer Feedback Volume',
        message: `Only ${totalFeedback} reviews collected. More feedback needed for accurate insights.`,
        action: 'Launch feedback incentive campaign: offer small discounts for verified reviews.',
        priority: 2
      });
    }

    // Success recognition
    if (avgRating >= 4.5) {
      recs.push({
        type: 'success',
        icon: '🎉',
        title: 'Excellent Customer Satisfaction',
        message: `Outstanding ${avgRating.toFixed(1)}/5 average rating! Customers love your products.`,
        action: 'Leverage this success in marketing materials and social media campaigns.',
        priority: 3
      });
    }

    return recs;
  };

  const allRecommendations = generateDataDrivenRecommendations();
  
  const filteredRecs = filter === 'all' 
    ? allRecommendations 
    : allRecommendations.filter(r => r.type === filter);

  const typeColors = {
    critical: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
    warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
    success: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
    info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' }
  };

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827' }}>
            AI-Powered Recommendations
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
            Actionable insights generated from your business data
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'critical', 'warning', 'success', 'info'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: filter === type ? '2px solid #667eea' : '1px solid #E5E7EB',
                backgroundColor: filter === type ? '#EEF2FF' : 'white',
                color: filter === type ? '#667eea' : '#6B7280',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {type}
              {type === 'all' && ` (${allRecommendations.length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredRecs.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            color: '#6B7280',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <p>No {filter !== 'all' ? filter : ''} recommendations at this time.</p>
          </div>
        ) : (
          filteredRecs.map((rec, i) => {
            const colors = typeColors[rec.type] || typeColors.info;
            return (
              <div 
                key={i} 
                style={{ 
                  backgroundColor: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '1rem', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)', 
                  borderLeft: `5px solid ${colors.border}`,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    backgroundColor: colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    flexShrink: 0
                  }}>
                    {rec.icon}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h3 style={{ 
                        fontWeight: '700', 
                        fontSize: '1.125rem',
                        color: '#111827'
                      }}>
                        {rec.title}
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {rec.type}
                      </span>
                    </div>
                    
                    <p style={{ 
                      color: '#4B5563', 
                      marginBottom: '1rem',
                      fontSize: '0.9375rem',
                      lineHeight: '1.6'
                    }}>
                      {rec.message}
                    </p>
                    
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#F9FAFB', 
                      borderRadius: '0.75rem', 
                      borderLeft: `3px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        backgroundColor: colors.bg,
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '1.25rem'
                      }}>
                        💡
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600', marginBottom: '0.25rem' }}>
                          RECOMMENDED ACTION
                        </p>
                        <p style={{ fontSize: '0.9375rem', color: '#111827', fontWeight: '500' }}>
                          {rec.action}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Recommendations;