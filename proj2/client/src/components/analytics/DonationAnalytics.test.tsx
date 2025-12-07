import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DonationAnalytics from './DonationAnalytics';

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
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

global.fetch = jest.fn();

describe('DonationAnalytics', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    render(<DonationAnalytics />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders impact banner', async () => {
    render(<DonationAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Social Impact Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/3,847 meals/)).toBeInTheDocument();
    });
  });

  it('renders metric cards with donation data', async () => {
    render(<DonationAnalytics />);
    await waitFor(() => {
      expect(screen.getByText(/Total Meals Donated: 3,847/)).toBeInTheDocument();
      expect(screen.getByText(/Total Impact Value: \$38,470/)).toBeInTheDocument();
    });
  });

  it('renders top contributors section', async () => {
    render(<DonationAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('🏆 Top Contributing Restaurants')).toBeInTheDocument();
      expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    });
  });

  it('renders charts', async () => {
    render(<DonationAnalytics />);
    await waitFor(() => {
      expect(screen.getAllByTestId('area-chart')).toHaveLength(1);
      expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0);
    });
  });

  it('renders chart titles', async () => {
    render(<DonationAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Meals Donated Over Time')).toBeInTheDocument();
      expect(screen.getByText('Monthly Growth Trend')).toBeInTheDocument();
      expect(screen.getByText('Impact by Category')).toBeInTheDocument();
    });
  });

  it('displays local legend badges for contributors', async () => {
    render(<DonationAnalytics />);
    await waitFor(() => {
      const badges = screen.getAllByText('Local Legend');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
