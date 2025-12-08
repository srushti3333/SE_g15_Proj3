import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import OrdersAnalytics from './OrdersAnalytics';
import RestaurantAnalytics from './RestaurantAnalytics';
import DonationAnalytics from './DonationAnalytics';
import './AdminDashboard.css';

type TabType = 'orders' | 'restaurants' | 'donations';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('restaurants');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'orders':
        return <OrdersAnalytics restaurantId={user?.id} />;
      case 'restaurants':
        return <RestaurantAnalytics />;
      case 'donations':
        return <DonationAnalytics restaurantId={user?.id} />;
      default:
        return <RestaurantAnalytics />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Advanced Analytics Dashboard</h1>
        <p className="subtitle">Monitor performance and insights across Hungry Wolf</p>
      </div>

      <div className="analytics-tabs">
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders
        </button>
        <button
          className={`tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          🍽️ Restaurant
        </button>
        <button
          className={`tab-btn ${activeTab === 'donations' ? 'active' : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          💝 Donations
        </button>
      </div>

      <div className="analytics-content">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default AdminDashboard;