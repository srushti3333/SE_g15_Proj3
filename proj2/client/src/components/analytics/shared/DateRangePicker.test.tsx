import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DateRangePicker from './DateRangePicker';

describe('DateRangePicker', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all three buttons', () => {
    render(<DateRangePicker value="month" onChange={mockOnChange} />);
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
  });

  it('highlights active button', () => {
    render(<DateRangePicker value="month" onChange={mockOnChange} />);
    const monthBtn = screen.getByText('Month');
    expect(monthBtn).toHaveClass('active');
  });

  it('calls onChange when week button is clicked', () => {
    render(<DateRangePicker value="month" onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('Week'));
    expect(mockOnChange).toHaveBeenCalledWith('week');
  });

  it('calls onChange when month button is clicked', () => {
    render(<DateRangePicker value="week" onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('Month'));
    expect(mockOnChange).toHaveBeenCalledWith('month');
  });

  it('calls onChange when year button is clicked', () => {
    render(<DateRangePicker value="month" onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('Year'));
    expect(mockOnChange).toHaveBeenCalledWith('year');
  });
});
