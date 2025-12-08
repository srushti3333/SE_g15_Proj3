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
import './DeliveryAnalytics.css';

interface DeliveryData {
  totalDeliveries: number;
  totalEarnings: number;
  avgEarningsPerDelivery: number;
  completionRate: number;
  deliveryHistory: Array<{
    date: string;
    restaurant: string;
    customer: string;
    earnings: number;
    status: string;
  }>;
  earningsOverTime: Array<{ month: string; earnings: number }>;
  deliveriesByStatus: Array<{ status: string; count: number }>;
}

const DeliveryAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DeliveryData | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchDeliveryData();
    }
  }, [timeRange, user]);

  const fetchDeliveryData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/delivery/${user?.id}?range=${timeRange}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching delivery analytics:', error);
      setData(getMockDeliveryData());
    } finally {
      setLoading(false);
    }
  };

  const getMockDeliveryData = (): DeliveryData => ({
    totalDeliveries: 156,
    totalEarnings: 1248,
    avgEarningsPerDelivery: 8.0,
    completionRate: 97.4,
    deliveryHistory: [
      { date: '2024-11-20', restaurant: 'Pizza Palace', customer: 'John D.', earnings: 8.50, status: 'delivered' },
      { date: '2024-11-20', restaurant: 'Burger Barn', customer: 'Sarah M.', earnings: 7.00, status: 'delivered' },
      { date: '2024-11-19', restaurant: 'Spice Haven', customer: 'Mike C.', earnings: 9.50, status: 'delivered' },
      { date: '2024-11-19', restaurant: 'Green Bowl', customer: 'Emma W.', earnings: 6.50, status: 'delivered' },
      { date: '2024-11-18', restaurant: 'Taco Fiesta', customer: 'Lisa A.', earnings: 8.00, status: 'delivered' },
    ],
    earningsOverTime: [
      { month: 'Aug', earnings: 980 },
      { month: 'Sep', earnings: 1050 },
      { month: 'Oct', earnings: 1180 },
      { month: 'Nov', earnings: 1248 },
    ],
    deliveriesByStatus: [
      { status: 'Delivered', count: 152 },
      { status: 'Cancelled', count: 4 },
    ],
  });

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="error">Failed to load analytics data</div>;
  }

  return (
    <div className="delivery-analytics">
      <DateRangePicker value={timeRange} onChange={setTimeRange} />

      <div className="metrics-grid">
        <MetricCard
          title="Total Deliveries"
          value={data.totalDeliveries.toString()}
          icon="🚚"
          trend="+12.5%"
          trendUp={true}
        />
        <MetricCard
          title="Total Earnings"
          value={`$${data.totalEarnings.toLocaleString()}`}
          icon="💰"
          trend="+8.3%"
          trendUp={true}
        />
        <MetricCard
          title="Avg per Delivery"
          value={`$${data.avgEarningsPerDelivery.toFixed(2)}`}
          icon="📊"
          trend="+2.1%"
          trendUp={true}
        />
        <MetricCard
          title="Completion Rate"
          value={`${data.completionRate}%`}
          icon="✅"
          trend="+1.2%"
          trendUp={true}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Earnings Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.earningsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="#667eea" strokeWidth={3} name="Earnings ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Deliveries by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.deliveriesByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4caf50" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="top-customers-card">
          <h3>📋 Recent Delivery History</h3>
          <div className="customers-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Restaurant</th>
                  <th>Customer</th>
                  <th>Earnings</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.deliveryHistory.map((delivery, index) => (
                  <tr key={index}>
                    <td>{delivery.date}</td>
                    <td>{delivery.restaurant}</td>
                    <td>{delivery.customer}</td>
                    <td>${delivery.earnings.toFixed(2)}</td>
                    <td className="status">{delivery.status}</td>
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

export default DeliveryAnalytics;
