import React from 'react';
import { render, screen, within } from '@testing-library/react';
import DeliveryHome from './DeliveryHome';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

// Mock useAuth
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock react-query's useQuery
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

// Mock api module
jest.mock('../../services/api');

describe('DeliveryHome Component', () => {
  const mockUser = {
    id: 'user123',
    email: 'rider@example.com',
    role: 'delivery',
    profile: { name: 'John Doe' },
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'deliveryOrders') {
        return { data: [
          { id: 'o1', status: 'ready', totalAmount: 50, items: [1,2], assignedAt: Date.now(), updatedAt: Date.now(), restaurantId: 'r1' },
          { id: 'o2', status: 'out_for_delivery', totalAmount: 30, items: [1], assignedAt: Date.now(), updatedAt: Date.now(), restaurantId: 'r2' },
          { id: 'o3', status: 'delivered', totalAmount: 20, items: [2], assignedAt: Date.now(), updatedAt: Date.now(), restaurantId: 'r3' }
        ] };
      }
      if (queryKey[0] === 'availableOrders') {
        return { data: [
          { id: 'a1', status: 'ready', totalAmount: 40, items: [1,2,3], updatedAt: Date.now(), restaurantId: 'r4' }
        ] };
      }
      return { data: [] };
    });
  });

  it('renders welcome message with user name', () => {
    render(<DeliveryHome />);
    expect(screen.getByText(/Welcome, John Doe/i)).toBeInTheDocument();
  });

  it('displays assigned orders stats', () => {
    render(<DeliveryHome />);

    const ordersOverview = screen.getByRole('region', { name: /orders overview/i });

    // Assigned Orders
    const assignedCard = within(ordersOverview).getByText('Assigned Orders').closest('.stat-card') as HTMLElement;
    expect(within(assignedCard!).getByText('3')).toBeInTheDocument();

    // Pending Pickup
    const pendingCard = within(ordersOverview).getByText('Pending Pickup').closest('.stat-card') as HTMLElement;
    expect(within(pendingCard!).getByText('1')).toBeInTheDocument();

    // Out for Delivery
    const activeCard = within(ordersOverview).getByText('Out for Delivery').closest('.stat-card') as HTMLElement;
    expect(within(activeCard!).getByText('1')).toBeInTheDocument();

    // Total Earnings
    const earningsCard = within(ordersOverview).getByText('Total Earnings').closest('.stat-card') as HTMLElement;
    expect(within(earningsCard!).getByText('$2.00')).toBeInTheDocument();
  });

  it('renders available orders section', () => {
    render(<DeliveryHome />);
    expect(screen.getByText(/Available Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/See Order/i)).toBeInTheDocument();
  });

  it('renders assigned orders section', () => {
    render(<DeliveryHome />);
    expect(screen.getByText(/Your Assigned Orders/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Order #/i).length).toBeGreaterThan(0);
  });

  it('shows no orders message when no assigned or available orders', () => {
    (useQuery as jest.Mock).mockImplementation(() => ({ data: [] }));
    render(<DeliveryHome />);
    expect(screen.getByText(/No orders available/i)).toBeInTheDocument();
  });
});
