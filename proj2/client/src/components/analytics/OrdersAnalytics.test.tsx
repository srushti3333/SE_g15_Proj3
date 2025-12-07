import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OrdersAnalytics from './OrdersAnalytics';

jest.mock('./shared/MetricCard', () => ({ title, value }: any) => (
  <div data-testid="metric-card">{title}: {value}</div>
));
jest.mock('./shared/DateRangePicker', () => ({ value }: any) => (
  <div data-testid="date-picker">{value}</div>
));
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

global.fetch = jest.fn();

describe('OrdersAnalytics', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    render(<OrdersAnalytics />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders metric cards with mock data', async () => {
    render(<OrdersAnalytics />);
    await waitFor(() => {
      expect(screen.getByText(/Total Orders: 1,247/)).toBeInTheDocument();
      expect(screen.getByText(/Total Revenue: \$45,620/)).toBeInTheDocument();
    });
  });

  it('renders charts', async () => {
    render(<OrdersAnalytics />);
    await waitFor(() => {
      expect(screen.getAllByTestId('line-chart')).toHaveLength(1);
      expect(screen.getAllByTestId('pie-chart')).toHaveLength(1);
      expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0);
    });
  });

  it('renders chart titles', async () => {
    render(<OrdersAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Orders & Revenue Over Time')).toBeInTheDocument();
      expect(screen.getByText('Orders by Status')).toBeInTheDocument();
      expect(screen.getByText('Top Selling Menu Items')).toBeInTheDocument();
    });
  });
});
