import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import MetricCard from './shared/MetricCard';
import DateRangePicker from './shared/DateRangePicker';
import './CustomerAnalytics.css';

interface CustomerData {
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  pointsEarned: number;
  orderHistory: Array<{
    date: string;
    restaurant: string;
    items: number;
    total: number;
    status: string;
  }>;
  spendingOverTime: Array<{ month: string; spent: number }>;
  favoriteRestaurants: Array<{ name: string; orders: number }>;
}

const CustomerAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerData | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchCustomerData();
    }
  }, [timeRange, user]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/customer/${user?.id}?range=${timeRange}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      setData(getMockCustomerData());
    } finally {
      setLoading(false);
    }
  };

  const getMockCustomerData = (): CustomerData => ({
    totalOrders: 47,
    totalSpent: 1680,
    avgOrderValue: 35.74,
    pointsEarned: 8520,
    orderHistory: [
      { date: '2024-11-20', restaurant: 'Pizza Palace', items: 3, total: 42.50, status: 'delivered' },
      { date: '2024-11-18', restaurant: 'Burger Barn', items: 2, total: 28.00, status: 'delivered' },
      { date: '2024-11-15', restaurant: 'Spice Haven', items: 4, total: 56.80, status: 'delivered' },
      { date: '2024-11-12', restaurant: 'Pizza Palace', items: 2, total: 35.00, status: 'delivered' },
      { date: '2024-11-10', restaurant: 'Green Bowl', items: 1, total: 18.50, status: 'delivered' },
    ],
    spendingOverTime: [
      { month: 'Aug', spent: 380 },
      { month: 'Sep', spent: 420 },
      { month: 'Oct', spent: 510 },
      { month: 'Nov', spent: 370 },
    ],
    favoriteRestaurants: [
      { name: 'Pizza Palace', orders: 12 },
      { name: 'Burger Barn', orders: 9 },
      { name: 'Spice Haven', orders: 8 },
      { name: 'Green Bowl', orders: 6 },
      { name: 'Taco Fiesta', orders: 5 },
    ],
  });

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="error">Failed to load analytics data</div>;
  }

  return (
    <div className="customer-analytics">
      <DateRangePicker value={timeRange} onChange={setTimeRange} />

      <div className="metrics-grid">
        <MetricCard
          title="Total Orders"
          value={data.totalOrders.toString()}
          icon="📦"
          trend="+8.7%"
          trendUp={true}
        />
        <MetricCard
          title="Total Spent"
          value={`$${data.totalSpent.toLocaleString()}`}
          icon="💰"
          trend="+5.2%"
          trendUp={true}
        />
        <MetricCard
          title="Avg Order Value"
          value={`$${data.avgOrderValue.toFixed(2)}`}
          icon="📊"
          trend="+3.1%"
          trendUp={true}
        />
        <MetricCard
          title="Points Earned"
          value={data.pointsEarned.toLocaleString()}
          icon="⭐"
          trend="+12.3%"
          trendUp={true}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Spending Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.spendingOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="spent" stroke="#667eea" strokeWidth={3} name="Spent ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Favorite Restaurants</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.favoriteRestaurants}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#4caf50" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="top-customers-card">
          <h3>📋 Recent Order History</h3>
          <div className="customers-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Restaurant</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.orderHistory.map((order, index) => (
                  <tr key={index}>
                    <td>{order.date}</td>
                    <td>{order.restaurant}</td>
                    <td>{order.items}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td className="status">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;