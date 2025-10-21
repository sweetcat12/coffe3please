import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#EF4444', '#F59E0B', '#FCD34D', '#34D399', '#10B981'];

const DashboardCharts = ({ dashboardData }) => {
  const ratingsChartData = [
    { name: '1★ Poor', value: dashboardData.ratingsDistribution[1] || 0, fill: COLORS[0] },
    { name: '2★ Fair', value: dashboardData.ratingsDistribution[2] || 0, fill: COLORS[1] },
    { name: '3★ Good', value: dashboardData.ratingsDistribution[3] || 0, fill: COLORS[2] },
    { name: '4★ Very Good', value: dashboardData.ratingsDistribution[4] || 0, fill: COLORS[3] },
    { name: '5★ Excellent', value: dashboardData.ratingsDistribution[5] || 0, fill: COLORS[4] },
  ];

  const topProductsChart = dashboardData?.topProducts?.slice(0, 8).map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    rating: parseFloat(p.averageRating),
    fullName: p.name,
    reviewCount: p.reviewCount
  })) || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
            {data.fullName || data.name}
          </p>
          {data.reviewCount && (
            <p style={{ margin: '0', fontSize: '0.75rem', color: '#6b7280' }}>
              Reviews: {data.reviewCount}
            </p>
          )}
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#667eea', fontWeight: '500' }}>
            Rating: {data.rating || data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: '0', fontSize: '0.875rem', fontWeight: '600' }}>
            {payload[0].name}
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#667eea' }}>
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
      gap: '1.5rem' 
    }}>
      {/* Ratings Distribution Pie Chart */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.75rem', 
        borderRadius: '1rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
          Ratings Distribution
        </h3>
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Pie 
              data={ratingsChartData} 
              cx="50%" 
              cy="45%" 
              label={(e) => `${e.value}`} 
              outerRadius={100} 
              dataKey="value"
            >
              {ratingsChartData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend for Pie Chart */}
        <div style={{ 
          marginTop: '1.5rem', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '0.75rem' 
        }}>
          {ratingsChartData.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: item.fill
              }} />
              <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Products Bar Chart */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.75rem', 
        borderRadius: '1rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
          Top Rated Products
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart 
            data={topProductsChart}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 5]} 
              label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="rating" 
              fill="#667eea" 
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend Info */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#4b5563'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#667eea',
              borderRadius: '2px'
            }} />
            Average Product Rating
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;