import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';

jest.mock('./OrdersAnalytics', () => () => <div>OrdersAnalytics Component</div>);
jest.mock('./CustomerAnalytics', () => () => <div>CustomerAnalytics Component</div>);
jest.mock('./RestaurantAnalytics', () => () => <div>RestaurantAnalytics Component</div>);
jest.mock('./DonationAnalytics', () => () => <div>DonationAnalytics Component</div>);

describe('AdminDashboard', () => {
  it('renders dashboard header', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('📊 Advanced Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monitor performance and insights across Hungry Wolf')).toBeInTheDocument();
  });

  it('renders all tab buttons', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('📦 Orders')).toBeInTheDocument();
    expect(screen.getByText('👥 Customers')).toBeInTheDocument();
    expect(screen.getByText('🍽️ Restaurants')).toBeInTheDocument();
    expect(screen.getByText('💝 Donations')).toBeInTheDocument();
  });

  it('displays OrdersAnalytics by default', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('OrdersAnalytics Component')).toBeInTheDocument();
  });

  it('switches to CustomerAnalytics when customers tab is clicked', () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('👥 Customers'));
    expect(screen.getByText('CustomerAnalytics Component')).toBeInTheDocument();
  });

  it('switches to RestaurantAnalytics when restaurants tab is clicked', () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('🍽️ Restaurants'));
    expect(screen.getByText('RestaurantAnalytics Component')).toBeInTheDocument();
  });

  it('switches to DonationAnalytics when donations tab is clicked', () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('💝 Donations'));
    expect(screen.getByText('DonationAnalytics Component')).toBeInTheDocument();
  });

  it('highlights active tab', () => {
    render(<AdminDashboard />);
    const ordersTab = screen.getByText('📦 Orders');
    expect(ordersTab).toHaveClass('active');
  });
});
