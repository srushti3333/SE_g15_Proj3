import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';

describe('MetricCard', () => {
  it('renders title and value', () => {
    render(<MetricCard title="Total Orders" value="1,247" icon="📦" />);
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('1,247')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<MetricCard title="Revenue" value="$45,620" icon="💰" />);
    expect(screen.getByText('💰')).toBeInTheDocument();
  });

  it('renders trend with up arrow when trendUp is true', () => {
    render(<MetricCard title="Orders" value="100" icon="📦" trend="+12.5%" trendUp={true} />);
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('renders trend with down arrow when trendUp is false', () => {
    render(<MetricCard title="Orders" value="100" icon="📦" trend="-2.1%" trendUp={false} />);
    expect(screen.getByText('-2.1%')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  it('does not render trend when not provided', () => {
    render(<MetricCard title="Orders" value="100" icon="📦" />);
    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
  });
});
