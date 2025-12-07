import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CustomerAnalytics from './CustomerAnalytics';

jest.mock('./shared/MetricCard', () => ({ title, value }: any) => (
  <div data-testid="metric-card">{title}: {value}</div>
));
jest.mock('./shared/DateRangePicker', () => ({ value }: any) => (
  <div data-testid="date-picker">{value}</div>
));
jest.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
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

describe('CustomerAnalytics', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    render(<CustomerAnalytics />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders metric cards with customer data', async () => {
    render(<CustomerAnalytics />);
    await waitFor(() => {
      expect(screen.getByText(/Total Customers: 3,542/)).toBeInTheDocument();
      expect(screen.getByText(/Active Customers: 2,847/)).toBeInTheDocument();
    });
  });

  it('renders top customers table', async () => {
    render(<CustomerAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('🏆 Top Customers by Orders & Points')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });
  });

  it('renders charts', async () => {
    render(<CustomerAnalytics />);
    await waitFor(() => {
      expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('pie-chart')).toHaveLength(1);
    });
  });

  it('renders chart titles', async () => {
    render(<CustomerAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Customer Activity Trend')).toBeInTheDocument();
      expect(screen.getByText('Customer Segments')).toBeInTheDocument();
      expect(screen.getByText('Points Distribution')).toBeInTheDocument();
    });
  });
});
