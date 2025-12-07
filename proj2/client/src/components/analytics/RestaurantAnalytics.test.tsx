import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import RestaurantAnalytics from './RestaurantAnalytics';

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
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => null,
  PolarGrid: () => null,
  PolarAngleAxis: () => null,
  PolarRadiusAxis: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

global.fetch = jest.fn();

describe('RestaurantAnalytics', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    render(<RestaurantAnalytics />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders metric cards with restaurant data', async () => {
    render(<RestaurantAnalytics />);
    await waitFor(() => {
      expect(screen.getByText(/Total Restaurants: 127/)).toBeInTheDocument();
      expect(screen.getByText(/Local Legends: 34/)).toBeInTheDocument();
    });
  });

  it('renders top restaurants section', async () => {
    render(<RestaurantAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('🏆 Top Performing Restaurants')).toBeInTheDocument();
      expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    });
  });

  it('renders charts', async () => {
    render(<RestaurantAnalytics />);
    await waitFor(() => {
      expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('radar-chart')).toHaveLength(1);
    });
  });

  it('renders chart titles', async () => {
    render(<RestaurantAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Rating Distribution')).toBeInTheDocument();
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('Menu Category Popularity')).toBeInTheDocument();
    });
  });

  it('displays local legend badges', async () => {
    render(<RestaurantAnalytics />);
    await waitFor(() => {
      const badges = screen.getAllByText('Local Legend');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
