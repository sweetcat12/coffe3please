// src/admin/components/dashboard/DashboardCharts.jsx
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart } from 'recharts';

const DashboardCharts = ({ dashboardData }) => {
  const [activeChart, setActiveChart] = useState('ratings');

  if (!dashboardData) return null;

  const COLORS = ['#EF4444', '#F59E0B', '#FCD34D', '#34D399', '#10B981'];

  // Ratings distribution data
  const ratingsChartData = [
    { name: '1★', fullName: '1★ Poor', value: dashboardData.ratingsDistribution[1] || 0, fill: COLORS[0] },
    { name: '2★', fullName: '2★ Fair', value: dashboardData.ratingsDistribution[2] || 0, fill: COLORS[1] },
    { name: '3★', fullName: '3★ Good', value: dashboardData.ratingsDistribution[3] || 0, fill: COLORS[2] },
    { name: '4★', fullName: '4★ Very Good', value: dashboardData.ratingsDistribution[4] || 0, fill: COLORS[3] },
    { name: '5★', fullName: '5★ Excellent', value: dashboardData.ratingsDistribution[5] || 0, fill: COLORS[4] }
  ];

  // Top products data
  const topProductsData = dashboardData.topProducts?.slice(0, 8).map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    rating: parseFloat(p.averageRating),
    reviews: p.reviewCount,
    fullName: p.name
  })) || [];

  // Bottom products needing attention
  const lowProductsData = dashboardData.lowProducts?.slice(0, 6).map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    rating: parseFloat(p.averageRating),
    reviews: p.reviewCount,
    fullName: p.name
  })) || [];

  // Performance comparison
  const performanceData = [
    { category: 'Excellent (5★)', count: dashboardData.ratingsDistribution[5] || 0, percentage: ((dashboardData.ratingsDistribution[5] || 0) / dashboardData.totalFeedback * 100).toFixed(1) },
    { category: 'Good (4★)', count: dashboardData.ratingsDistribution[4] || 0, percentage: ((dashboardData.ratingsDistribution[4] || 0) / dashboardData.totalFeedback * 100).toFixed(1) },
    { category: 'Average (3★)', count: dashboardData.ratingsDistribution[3] || 0, percentage: ((dashboardData.ratingsDistribution[3] || 0) / dashboardData.totalFeedback * 100).toFixed(1) },
    { category: 'Poor (1-2★)', count: (dashboardData.ratingsDistribution[1] || 0) + (dashboardData.ratingsDistribution[2] || 0), percentage: (((dashboardData.ratingsDistribution[1] || 0) + (dashboardData.ratingsDistribution[2] || 0)) / dashboardData.totalFeedback * 100).toFixed(1) }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '0.75rem',
          borderRadius: '0.625rem',
          boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: '0 0 0.375rem 0', fontSize: '0.8125rem', fontWeight: '700', color: '#111827' }}>
            {data.fullName || data.name}
          </p>
          {data.reviews && (
            <p style={{ margin: '0 0 0.1875rem 0', fontSize: '0.75rem', color: '#6b7280' }}>
              📊 Total Reviews: <strong>{data.reviews}</strong>
            </p>
          )}
          <p style={{ margin: '0', fontSize: '0.8125rem', color: '#667eea', fontWeight: '600' }}>
            ⭐ Rating: {data.rating || data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate percentages for ratings
  const getRatingPercentage = (value) => {
    return dashboardData.totalFeedback > 0 ? ((value / dashboardData.totalFeedback) * 100).toFixed(1) : 0;
  };

  return (
    <div>
      <div style={{ marginBottom: '1.125rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
          Detailed Analytics
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
          Visual insights into your business performance
        </p>
      </div>

      {/* Chart Navigation */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '0.375rem',
        borderRadius: '0.625rem',
        marginBottom: '1rem',
        display: 'flex',
        gap: '0.375rem',
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}>
        {[
          { id: 'ratings', label: '📊 Ratings', icon: '📊' },
          { id: 'top', label: '🏆 Top Performers', icon: '🏆' },
          { id: 'low', label: '⚠️ Attention', icon: '⚠️' },
          { id: 'performance', label: '📈 Performance', icon: '📈' }
        ].map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            style={{
              flex: '1 1 auto',
              minWidth: '130px',
              padding: '0.625rem 0.875rem',
              borderRadius: '0.375rem',
              border: 'none',
              backgroundColor: activeChart === chart.id ? '#667eea' : 'transparent',
              color: activeChart === chart.id ? 'white' : '#6B7280',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {chart.label}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '1rem' 
      }}>
        {/* Ratings Distribution */}
        {activeChart === 'ratings' && (
          <>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.25rem', 
              borderRadius: '0.875rem', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)' 
            }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
                Customer Rating Distribution
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '1rem', lineHeight: '1.4' }}>
                Shows how many customers gave each star rating. Larger sections = more reviews at that rating level.
              </p>
              
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie 
                    data={ratingsChartData} 
                    cx="50%" 
                    cy="50%" 
                    label={(entry) => entry.value > 0 ? `${entry.value}` : ''}
                    labelLine={true}
                    outerRadius={90} 
                    dataKey="value"
                  >
                    {ratingsChartData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              <div style={{ 
                marginTop: '1rem', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', 
                gap: '0.625rem' 
              }}>
                {ratingsChartData.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0.625rem',
                    backgroundColor: `${item.fill}15`,
                    borderRadius: '0.375rem'
                  }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '3px',
                      backgroundColor: item.fill,
                      marginBottom: '0.375rem'
                    }} />
                    <span style={{ fontSize: '0.8125rem', color: '#4b5563', fontWeight: '600' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827', marginTop: '0.1875rem' }}>
                      {item.value}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '0.125rem' }}>
                      {getRatingPercentage(item.value)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Simple Explanation Box */}
              <div style={{
                marginTop: '1rem',
                padding: '0.875rem',
                backgroundColor: '#F0F9FF',
                borderRadius: '0.625rem',
                borderLeft: '3px solid #3B82F6'
              }}>
                <p style={{ fontSize: '0.8125rem', color: '#1E40AF', lineHeight: '1.5', margin: 0 }}>
                  <strong>What this means:</strong> Out of {dashboardData.totalFeedback} total reviews,{' '}
                  <strong style={{ color: '#10B981' }}>{ratingsChartData[4].value}</strong> customers rated 5★ and{' '}
                  <strong style={{ color: '#34D399' }}>{ratingsChartData[3].value}</strong> rated 4★.{' '}
                  {ratingsChartData[0].value + ratingsChartData[1].value > 0 ? (
                    <span style={{ color: '#DC2626' }}>
                      <strong>{ratingsChartData[0].value + ratingsChartData[1].value}</strong> customers gave low ratings (1-2★) - these need attention!
                    </span>
                  ) : (
                    <span style={{ color: '#10B981' }}>
                      Great news! No low ratings received. 🎉
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.25rem', 
              borderRadius: '0.875rem', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)' 
            }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
                Rating Trends Analysis
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '1rem', lineHeight: '1.4' }}>
                Visual representation of rating distribution from lowest to highest.
              </p>
              
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={ratingsChartData}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'Reviews', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRating)" />
                </AreaChart>
              </ResponsiveContainer>
              
              <div style={{
                marginTop: '1rem',
                padding: '0.875rem',
                backgroundColor: '#F9FAFB',
                borderRadius: '0.625rem',
                borderLeft: '3px solid #667eea'
              }}>
                <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.5', margin: 0 }}>
                  <strong>Quick Insight:</strong>{' '}
                  {ratingsChartData[4].value + ratingsChartData[3].value} out of {dashboardData.totalFeedback} reviews{' '}
                  ({(((ratingsChartData[4].value + ratingsChartData[3].value) / dashboardData.totalFeedback) * 100).toFixed(1)}%)
                  are positive (4-5★). This is your satisfaction score!
                </p>
              </div>
            </div>
          </>
        )}

        {/* Top Performers */}
        {activeChart === 'top' && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.25rem', 
            borderRadius: '0.875rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
              🏆 Top Performing Products
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart 
                data={topProductsData}
                margin={{ top: 15, right: 20, left: 15, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  domain={[0, 5]} 
                  label={{ value: 'Avg Rating', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="rating" 
                  fill="#10B981" 
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
            
            <div style={{
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '0.75rem'
            }}>
              {topProductsData.slice(0, 3).map((product, idx) => (
                <div key={idx} style={{
                  padding: '0.875rem',
                  backgroundColor: '#D1FAE5',
                  borderRadius: '0.625rem',
                  borderLeft: '3px solid #10B981'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.8125rem', color: '#065F46', fontWeight: '600', marginBottom: '0.1875rem' }}>
                        #{idx + 1} Best Seller
                      </p>
                      <p style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#111827' }}>
                        {product.fullName}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.375rem', fontWeight: '700', color: '#10B981' }}>
                        {product.rating}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#065F46' }}>
                        {product.reviews} reviews
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '0.875rem',
              backgroundColor: '#F0FDF4',
              borderRadius: '0.625rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ fontSize: '1.75rem' }}>💡</div>
              <p style={{ fontSize: '0.8125rem', color: '#065F46', lineHeight: '1.5', margin: 0 }}>
                <strong>Marketing Opportunity:</strong> Feature these top-rated products in promotional materials and social media. Consider creating combo deals with these bestsellers.
              </p>
            </div>
          </div>
        )}

        {/* Products Needing Attention */}
        {activeChart === 'low' && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.25rem', 
            borderRadius: '0.875rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
              ⚠️ Products Requiring Immediate Attention
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart 
                data={lowProductsData}
                margin={{ top: 15, right: 20, left: 15, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  domain={[0, 5]} 
                  label={{ value: 'Avg Rating', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="rating" 
                  fill="#EF4444" 
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
            
            <div style={{
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '0.75rem'
            }}>
              {lowProductsData.slice(0, 3).map((product, idx) => (
                <div key={idx} style={{
                  padding: '0.875rem',
                  backgroundColor: '#FEE2E2',
                  borderRadius: '0.625rem',
                  borderLeft: '3px solid #EF4444'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.8125rem', color: '#991B1B', fontWeight: '600', marginBottom: '0.1875rem' }}>
                        Priority {idx + 1}
                      </p>
                      <p style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#111827' }}>
                        {product.fullName}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.375rem', fontWeight: '700', color: '#EF4444' }}>
                        {product.rating}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#991B1B' }}>
                        {product.reviews} reviews
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '0.875rem',
              backgroundColor: '#FEF2F2',
              borderRadius: '0.625rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ fontSize: '1.75rem' }}>🔍</div>
              <p style={{ fontSize: '0.8125rem', color: '#991B1B', lineHeight: '1.5', margin: 0 }}>
                <strong>Action Required:</strong> Review recipes, ingredients, and preparation methods. Consider staff training, quality control improvements, or menu refinements.
              </p>
            </div>
          </div>
        )}

        {/* Performance Breakdown */}
        {activeChart === 'performance' && (
          <>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.25rem', 
              borderRadius: '0.875rem', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)' 
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
                Overall Performance Summary
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={performanceData}
                  layout="vertical"
                  margin={{ top: 15, right: 20, left: 100, bottom: 15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    tick={{ fontSize: 11 }}
                    width={95}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            backgroundColor: 'white',
                            padding: '0.75rem',
                            borderRadius: '0.625rem',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                            border: '1px solid #e5e7eb'
                          }}>
                            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: '700' }}>
                              {payload[0].payload.category}
                            </p>
                            <p style={{ margin: '0.1875rem 0 0 0', fontSize: '0.8125rem', color: '#667eea' }}>
                              Count: {payload[0].value} ({payload[0].payload.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#667eea" 
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.25rem', 
              borderRadius: '0.875rem', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)' 
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
                Key Performance Indicators
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {performanceData.map((item, idx) => {
                  const colors = ['#10B981', '#34D399', '#F59E0B', '#EF4444'];
                  return (
                    <div key={idx} style={{
                      padding: '1rem',
                      backgroundColor: '#F9FAFB',
                      borderRadius: '0.625rem',
                      borderLeft: `3px solid ${colors[idx]}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                          {item.category}
                        </span>
                        <span style={{ fontSize: '1.125rem', fontWeight: '700', color: colors[idx] }}>
                          {item.percentage}%
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '7px', 
                        backgroundColor: '#E5E7EB', 
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          backgroundColor: colors[idx],
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                      <p style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '0.375rem', margin: '0.375rem 0 0 0' }}>
                        {item.count} reviews
                      </p>
                    </div>
                  );
                })}
              </div>

              <div style={{
                marginTop: '1rem',
                padding: '0.875rem',
                backgroundColor: '#EFF6FF',
                borderRadius: '0.625rem',
                borderLeft: '3px solid #3B82F6'
              }}>
                <p style={{ fontSize: '0.8125rem', color: '#1E40AF', lineHeight: '1.5', margin: 0 }}>
                  <strong>Overall Health Score:</strong>{' '}
                  {((parseFloat(performanceData[0].percentage) + parseFloat(performanceData[1].percentage)) / 2).toFixed(1)}%
                  {' '}of reviews are positive (4-5★)
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;