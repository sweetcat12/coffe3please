// StatsCards.jsx
const StatsCards = ({ dashboardData }) => {
  const stats = [
    { 
      label: 'Total Users', 
      value: dashboardData.totalUsers, 
      icon: '👥', 
      color: '#3B82F6', 
      bg: '#EFF6FF' 
    },
    { 
      label: 'Total Products', 
      value: dashboardData.totalProducts, 
      icon: '☕', 
      color: '#8B5CF6', 
      bg: '#F5F3FF' 
    },
    { 
      label: 'Total Reviews', 
      value: dashboardData.totalFeedback, 
      icon: '💬', 
      color: '#EC4899', 
      bg: '#FDF2F8' 
    },
    { 
      label: 'Avg Rating', 
      value: `${dashboardData.avgRating}/5`, 
      icon: '⭐', 
      color: '#F59E0B', 
      bg: '#FFFBEB' 
    }
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '1.5rem', 
      marginBottom: '2.5rem' 
    }}>
      {stats.map((stat, i) => (
        <div 
          key={i} 
          style={{ 
            backgroundColor: 'white', 
            padding: '1.75rem', 
            borderRadius: '1rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            border: '1px solid #E5E7EB' 
          }}
        >
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            backgroundColor: stat.bg, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.5rem', 
            marginBottom: '1rem' 
          }}>
            {stat.icon}
          </div>
          <h3 style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {stat.label}
          </h3>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: stat.color }}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;