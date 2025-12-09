import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  Sankey,
  Funnel,
  FunnelChart
} from 'recharts';

interface InsightData {
  customerSegmentation: Array<{
    segment: string;
    count: number;
    revenue: number;
    avgOrderValue: number;
    color: string;
  }>;
  timeSeriesAnalysis: Array<{
    date: string;
    orders: number;
    revenue: number;
    customers: number;
    avgOrderValue: number;
  }>;
  geographicDistribution: Array<{
    region: string;
    orders: number;
    revenue: number;
    customers: number;
  }>;
  productPerformance: Array<{
    category: string;
    items: number;
    revenue: number;
    margin: number;
    growth: number;
  }>;
  customerLifetimeValue: Array<{
    cohort: string;
    ltv: number;
    retention: number;
    churnRate: number;
  }>;
  orderFulfillmentMetrics: Array<{
    stage: string;
    avgTime: number;
    efficiency: number;
  }>;
  revenueBreakdown: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  customerBehaviorPatterns: Array<{
    pattern: string;
    frequency: number;
    impact: number;
  }>;
  seasonalTrends: Array<{
    month: string;
    orders: number;
    revenue: number;
    trend: string;
  }>;
  competitiveAnalysis: Array<{
    metric: string;
    ourValue: number;
    industryAvg: number;
  }>;
}

const AdvancedInsights: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InsightData | null>(null);
  const [selectedView, setSelectedView] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('30days');
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);

  useEffect(() => {
    fetchInsightsData();
  }, [dateRange]);

  const fetchInsightsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/advanced-insights?range=${dateRange}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching advanced insights:', error);
      setData(getMockInsightsData());
    } finally {
      setLoading(false);
    }
  };

  const getMockInsightsData = (): InsightData => ({
    customerSegmentation: [
      { segment: 'VIP Customers', count: 450, revenue: 125000, avgOrderValue: 278, color: '#FFD700' },
      { segment: 'Regular Customers', count: 1200, revenue: 180000, avgOrderValue: 150, color: '#667eea' },
      { segment: 'Occasional Customers', count: 2300, revenue: 115000, avgOrderValue: 50, color: '#ff6b6b' },
      { segment: 'New Customers', count: 890, revenue: 35000, avgOrderValue: 39, color: '#4caf50' },
      { segment: 'At-Risk Customers', count: 560, revenue: 28000, avgOrderValue: 50, color: '#ff9800' },
      { segment: 'Churned Customers', count: 320, revenue: 0, avgOrderValue: 0, color: '#9e9e9e' }
    ],
    timeSeriesAnalysis: [
      { date: '2024-01-01', orders: 450, revenue: 16500, customers: 380, avgOrderValue: 36.67 },
      { date: '2024-01-08', orders: 520, revenue: 19240, customers: 420, avgOrderValue: 37.00 },
      { date: '2024-01-15', orders: 480, revenue: 18240, customers: 390, avgOrderValue: 38.00 },
      { date: '2024-01-22', orders: 610, revenue: 23790, customers: 480, avgOrderValue: 39.00 },
      { date: '2024-01-29', orders: 580, revenue: 22620, customers: 460, avgOrderValue: 39.00 },
      { date: '2024-02-05', orders: 640, revenue: 25600, customers: 510, avgOrderValue: 40.00 },
      { date: '2024-02-12', orders: 590, revenue: 24190, customers: 470, avgOrderValue: 41.00 },
      { date: '2024-02-19', orders: 670, revenue: 27480, customers: 530, avgOrderValue: 41.00 },
      { date: '2024-02-26', orders: 620, revenue: 25420, customers: 490, avgOrderValue: 41.00 },
      { date: '2024-03-04', orders: 710, revenue: 29930, customers: 560, avgOrderValue: 42.15 },
      { date: '2024-03-11', orders: 680, revenue: 28560, customers: 540, avgOrderValue: 42.00 },
      { date: '2024-03-18', orders: 750, revenue: 32250, customers: 590, avgOrderValue: 43.00 },
      { date: '2024-03-25', orders: 720, revenue: 30960, customers: 570, avgOrderValue: 43.00 },
      { date: '2024-04-01', orders: 790, revenue: 34220, customers: 620, avgOrderValue: 43.32 },
      { date: '2024-04-08', orders: 760, revenue: 33440, customers: 600, avgOrderValue: 44.00 },
      { date: '2024-04-15', orders: 820, revenue: 36900, customers: 650, avgOrderValue: 45.00 },
      { date: '2024-04-22', orders: 800, revenue: 36000, customers: 630, avgOrderValue: 45.00 },
      { date: '2024-04-29', orders: 850, revenue: 38250, customers: 670, avgOrderValue: 45.00 },
      { date: '2024-05-06', orders: 830, revenue: 37350, customers: 660, avgOrderValue: 45.00 },
      { date: '2024-05-13', orders: 890, revenue: 40050, customers: 700, avgOrderValue: 45.00 }
    ],
    geographicDistribution: [
      { region: 'Downtown', orders: 3450, revenue: 138000, customers: 2100 },
      { region: 'Midtown', orders: 2890, revenue: 115600, customers: 1800 },
      { region: 'Uptown', orders: 2340, revenue: 93600, customers: 1500 },
      { region: 'Suburbs North', orders: 1980, revenue: 79200, customers: 1200 },
      { region: 'Suburbs South', orders: 1670, revenue: 66800, customers: 1000 },
      { region: 'Suburbs East', orders: 1450, revenue: 58000, customers: 890 },
      { region: 'Suburbs West', orders: 1230, revenue: 49200, customers: 750 }
    ],
    productPerformance: [
      { category: 'Pizza', items: 45, revenue: 125000, margin: 62, growth: 15.3 },
      { category: 'Burgers', items: 38, revenue: 98000, margin: 58, growth: 12.7 },
      { category: 'Asian Cuisine', items: 52, revenue: 87000, margin: 55, growth: 18.9 },
      { category: 'Salads & Healthy', items: 34, revenue: 56000, margin: 68, growth: 22.4 },
      { category: 'Mexican', items: 41, revenue: 72000, margin: 60, growth: 14.2 },
      { category: 'Italian', items: 36, revenue: 68000, margin: 59, growth: 11.8 },
      { category: 'Desserts', items: 28, revenue: 34000, margin: 72, growth: 9.5 },
      { category: 'Beverages', items: 22, revenue: 28000, margin: 75, growth: 8.3 }
    ],
    customerLifetimeValue: [
      { cohort: 'Jan 2024', ltv: 450, retention: 85, churnRate: 15 },
      { cohort: 'Feb 2024', ltv: 420, retention: 82, churnRate: 18 },
      { cohort: 'Mar 2024', ltv: 380, retention: 78, churnRate: 22 },
      { cohort: 'Apr 2024', ltv: 340, retention: 75, churnRate: 25 },
      { cohort: 'May 2024', ltv: 290, retention: 72, churnRate: 28 },
      { cohort: 'Jun 2024', ltv: 250, retention: 68, churnRate: 32 },
      { cohort: 'Jul 2024', ltv: 210, retention: 65, churnRate: 35 },
      { cohort: 'Aug 2024', ltv: 180, retention: 62, churnRate: 38 },
      { cohort: 'Sep 2024', ltv: 150, retention: 58, churnRate: 42 },
      { cohort: 'Oct 2024', ltv: 120, retention: 55, churnRate: 45 },
      { cohort: 'Nov 2024', ltv: 90, retention: 52, churnRate: 48 }
    ],
    orderFulfillmentMetrics: [
      { stage: 'Order Placed', avgTime: 0, efficiency: 100 },
      { stage: 'Restaurant Accepts', avgTime: 3.5, efficiency: 95 },
      { stage: 'Food Preparation', avgTime: 18.2, efficiency: 88 },
      { stage: 'Ready for Pickup', avgTime: 22.8, efficiency: 92 },
      { stage: 'Driver Assigned', avgTime: 25.3, efficiency: 90 },
      { stage: 'Out for Delivery', avgTime: 28.7, efficiency: 94 },
      { stage: 'Delivered', avgTime: 42.5, efficiency: 96 }
    ],
    revenueBreakdown: [
      { source: 'Direct Orders', amount: 285000, percentage: 57 },
      { source: 'Promotional Orders', amount: 95000, percentage: 19 },
      { source: 'Subscription Plans', amount: 65000, percentage: 13 },
      { source: 'Corporate Catering', amount: 35000, percentage: 7 },
      { source: 'Gift Cards', amount: 20000, percentage: 4 }
    ],
    customerBehaviorPatterns: [
      { pattern: 'Weekend Orders', frequency: 3200, impact: 85 },
      { pattern: 'Lunch Rush (11am-2pm)', frequency: 4500, impact: 92 },
      { pattern: 'Dinner Peak (6pm-9pm)', frequency: 5800, impact: 95 },
      { pattern: 'Late Night (9pm-12am)', frequency: 1800, impact: 68 },
      { pattern: 'Repeat Orders (Same Restaurant)', frequency: 2900, impact: 78 },
      { pattern: 'Group Orders (3+ items)', frequency: 2100, impact: 82 },
      { pattern: 'Promo Code Usage', frequency: 3400, impact: 72 },
      { pattern: 'Mobile App Orders', frequency: 6200, impact: 88 }
    ],
    seasonalTrends: [
      { month: 'January', orders: 8900, revenue: 356000, trend: 'stable' },
      { month: 'February', orders: 9200, revenue: 368000, trend: 'up' },
      { month: 'March', orders: 10100, revenue: 404000, trend: 'up' },
      { month: 'April', orders: 10800, revenue: 432000, trend: 'up' },
      { month: 'May', orders: 11500, revenue: 460000, trend: 'up' },
      { month: 'June', orders: 12200, revenue: 488000, trend: 'up' },
      { month: 'July', orders: 11800, revenue: 472000, trend: 'stable' },
      { month: 'August', orders: 11400, revenue: 456000, trend: 'down' },
      { month: 'September', orders: 10900, revenue: 436000, trend: 'down' },
      { month: 'October', orders: 11200, revenue: 448000, trend: 'up' },
      { month: 'November', orders: 12500, revenue: 500000, trend: 'up' },
      { month: 'December', orders: 13800, revenue: 552000, trend: 'up' }
    ],
    competitiveAnalysis: [
      { metric: 'Avg Delivery Time', ourValue: 42.5, industryAvg: 48.2 },
      { metric: 'Customer Satisfaction', ourValue: 4.6, industryAvg: 4.2 },
      { metric: 'Order Accuracy', ourValue: 96.5, industryAvg: 92.8 },
      { metric: 'Repeat Customer Rate', ourValue: 68, industryAvg: 55 },
      { metric: 'Avg Order Value', ourValue: 42, industryAvg: 38 },
      { metric: 'Restaurant Partners', ourValue: 245, industryAvg: 180 }
    ]
  });

  const renderCustomerSegmentation = () => (
    <div className="insight-section">
      <h3>Customer Segmentation Analysis</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data?.customerSegmentation}
            dataKey="count"
            nameKey="segment"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) => `${entry.segment}: ${entry.count}`}
          >
            {data?.customerSegmentation.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="segment-details">
        {data?.customerSegmentation.map((segment) => (
          <div key={segment.segment} className="segment-card">
            <h4>{segment.segment}</h4>
            <p>Count: {segment.count}</p>
            <p>Revenue: ${segment.revenue.toLocaleString()}</p>
            <p>Avg Order: ${segment.avgOrderValue}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeSeriesAnalysis = () => (
    <div className="insight-section">
      <h3>Time Series Analysis</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data?.timeSeriesAnalysis}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            fill="#667eea"
            stroke="#667eea"
            fillOpacity={0.3}
            name="Revenue ($)"
          />
          <Bar yAxisId="left" dataKey="orders" fill="#4caf50" name="Orders" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgOrderValue"
            stroke="#ff6b6b"
            strokeWidth={2}
            name="Avg Order Value ($)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const renderGeographicDistribution = () => (
    <div className="insight-section">
      <h3>Geographic Distribution</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data?.geographicDistribution} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="region" type="category" width={120} />
          <Tooltip />
          <Legend />
          <Bar dataKey="orders" fill="#667eea" name="Orders" />
          <Bar dataKey="customers" fill="#4caf50" name="Customers" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderProductPerformance = () => (
    <div className="insight-section">
      <h3>Product Performance Matrix</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="revenue" name="Revenue" />
          <YAxis dataKey="margin" name="Margin %" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter
            name="Product Categories"
            data={data?.productPerformance}
            fill="#667eea"
          />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="performance-table">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Items</th>
              <th>Revenue</th>
              <th>Margin %</th>
              <th>Growth %</th>
            </tr>
          </thead>
          <tbody>
            {data?.productPerformance.map((product) => (
              <tr key={product.category}>
                <td>{product.category}</td>
                <td>{product.items}</td>
                <td>${product.revenue.toLocaleString()}</td>
                <td>{product.margin}%</td>
                <td className={product.growth > 15 ? 'positive' : 'neutral'}>
                  {product.growth}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomerLifetimeValue = () => (
    <div className="insight-section">
      <h3>Customer Lifetime Value by Cohort</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data?.customerLifetimeValue}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cohort" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="ltv" fill="#FFD700" name="LTV ($)" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="retention"
            stroke="#4caf50"
            strokeWidth={2}
            name="Retention %"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="churnRate"
            stroke="#ff6b6b"
            strokeWidth={2}
            name="Churn Rate %"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const renderOrderFulfillment = () => (
    <div className="insight-section">
      <h3>Order Fulfillment Pipeline</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data?.orderFulfillmentMetrics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="avgTime" fill="#667eea" name="Avg Time (min)" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="efficiency"
            stroke="#4caf50"
            strokeWidth={3}
            name="Efficiency %"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const renderRevenueBreakdown = () => (
    <div className="insight-section">
      <h3>Revenue Source Breakdown</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data?.revenueBreakdown}
            dataKey="amount"
            nameKey="source"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) => `${entry.source}: ${entry.percentage}%`}
          >
            {data?.revenueBreakdown.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={['#667eea', '#4caf50', '#FFD700', '#ff6b6b', '#ff9800'][index]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderCustomerBehavior = () => (
    <div className="insight-section">
      <h3>Customer Behavior Patterns</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data?.customerBehaviorPatterns}>
          <PolarGrid />
          <PolarAngleAxis dataKey="pattern" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Impact Score"
            dataKey="impact"
            stroke="#667eea"
            fill="#667eea"
            fillOpacity={0.6}
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderSeasonalTrends = () => (
    <div className="insight-section">
      <h3>Seasonal Trends Analysis</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data?.seasonalTrends}>
          <defs>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#667eea" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="orders"
            stroke="#667eea"
            fillOpacity={1}
            fill="url(#colorOrders)"
            name="Orders"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#4caf50"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Revenue ($)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const renderCompetitiveAnalysis = () => (
    <div className="insight-section">
      <h3>Competitive Benchmarking</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data?.competitiveAnalysis}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ourValue" fill="#667eea" name="Our Performance" />
          <Bar dataKey="industryAvg" fill="#9e9e9e" name="Industry Average" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading advanced insights...</div>;
  }

  if (!data) {
    return <div className="error">Failed to load insights data</div>;
  }

  return (
    <div className="advanced-insights">
      <div className="insights-header">
        <h2>Advanced Business Insights</h2>
        <div className="controls">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <button onClick={() => setComparisonMode(!comparisonMode)}>
            {comparisonMode ? 'Disable' : 'Enable'} Comparison
          </button>
        </div>
      </div>

      <div className="insights-navigation">
        <button
          className={selectedView === 'overview' ? 'active' : ''}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </button>
        <button
          className={selectedView === 'customers' ? 'active' : ''}
          onClick={() => setSelectedView('customers')}
        >
          Customers
        </button>
        <button
          className={selectedView === 'products' ? 'active' : ''}
          onClick={() => setSelectedView('products')}
        >
          Products
        </button>
        <button
          className={selectedView === 'operations' ? 'active' : ''}
          onClick={() => setSelectedView('operations')}
        >
          Operations
        </button>
        <button
          className={selectedView === 'trends' ? 'active' : ''}
          onClick={() => setSelectedView('trends')}
        >
          Trends
        </button>
      </div>

      <div className="insights-content">
        {selectedView === 'overview' && (
          <>
            {renderTimeSeriesAnalysis()}
            {renderRevenueBreakdown()}
            {renderCompetitiveAnalysis()}
          </>
        )}
        {selectedView === 'customers' && (
          <>
            {renderCustomerSegmentation()}
            {renderCustomerLifetimeValue()}
            {renderCustomerBehavior()}
          </>
        )}
        {selectedView === 'products' && (
          <>
            {renderProductPerformance()}
            {renderGeographicDistribution()}
          </>
        )}
        {selectedView === 'operations' && (
          <>
            {renderOrderFulfillment()}
          </>
        )}
        {selectedView === 'trends' && (
          <>
            {renderSeasonalTrends()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedInsights;
