// Comprehensive analytics helper functions and utilities

export interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export class AnalyticsHelpers {
  /**
   * Format currency values
   */
  static formatCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format large numbers with abbreviations (K, M, B)
   */
  static formatLargeNumber(num: number): string {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Format percentage values
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Calculate percentage change
   */
  static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Compare two metrics and return detailed comparison
   */
  static compareMetrics(current: number, previous: number): MetricComparison {
    const change = current - previous;
    const changePercent = this.calculatePercentageChange(current, previous);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 5) {
      trend = changePercent > 0 ? 'up' : 'down';
    }

    return {
      current,
      previous,
      change,
      changePercent,
      trend,
    };
  }

  /**
   * Get date range for common periods
   */
  static getDateRange(period: string): DateRange {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        return { start, end, label: 'Today' };

      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        return { start, end, label: 'Yesterday' };

      case '7days':
        start.setDate(start.getDate() - 7);
        return { start, end, label: 'Last 7 Days' };

      case '30days':
        start.setDate(start.getDate() - 30);
        return { start, end, label: 'Last 30 Days' };

      case '90days':
        start.setDate(start.getDate() - 90);
        return { start, end, label: 'Last 90 Days' };

      case 'thisMonth':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return { start, end, label: 'This Month' };

      case 'lastMonth':
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        return { start, end, label: 'Last Month' };

      case 'thisYear':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        return { start, end, label: 'This Year' };

      case 'lastYear':
        start.setFullYear(start.getFullYear() - 1, 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setFullYear(end.getFullYear() - 1, 11, 31);
        end.setHours(23, 59, 59, 999);
        return { start, end, label: 'Last Year' };

      default:
        start.setDate(start.getDate() - 30);
        return { start, end, label: 'Last 30 Days' };
    }
  }

  /**
   * Group data by time interval
   */
  static groupByTimeInterval(
    data: Array<{ date: Date; value: number }>,
    interval: 'hour' | 'day' | 'week' | 'month'
  ): Array<{ date: string; value: number }> {
    const grouped = new Map<string, number>();

    data.forEach((item) => {
      let key: string;

      switch (interval) {
        case 'hour':
          key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(item.date.getDate()).padStart(2, '0')} ${String(
            item.date.getHours()
          ).padStart(2, '0')}:00`;
          break;

        case 'day':
          key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(item.date.getDate()).padStart(2, '0')}`;
          break;

        case 'week':
          const weekStart = new Date(item.date);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = `${weekStart.getFullYear()}-W${String(
            Math.ceil(weekStart.getDate() / 7)
          ).padStart(2, '0')}`;
          break;

        case 'month':
          key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(
            2,
            '0'
          )}`;
          break;
      }

      grouped.set(key, (grouped.get(key) || 0) + item.value);
    });

    return Array.from(grouped.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate percentile
   */
  static calculatePercentile(data: number[], percentile: number): number {
    const sorted = [...data].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * Calculate quartiles
   */
  static calculateQuartiles(data: number[]): {
    q1: number;
    q2: number;
    q3: number;
    iqr: number;
  } {
    const q1 = this.calculatePercentile(data, 25);
    const q2 = this.calculatePercentile(data, 50);
    const q3 = this.calculatePercentile(data, 75);
    const iqr = q3 - q1;

    return { q1, q2, q3, iqr };
  }

  /**
   * Generate color palette for charts
   */
  static generateColorPalette(count: number): string[] {
    const baseColors = [
      '#667eea',
      '#4caf50',
      '#ff6b6b',
      '#ffd700',
      '#ff9800',
      '#2196f3',
      '#9c27b0',
      '#00bcd4',
      '#8bc34a',
      '#ff5722',
    ];

    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    const colors: string[] = [...baseColors];
    while (colors.length < count) {
      const hue = (colors.length * 137.5) % 360;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }

    return colors;
  }

  /**
   * Calculate moving sum
   */
  static calculateMovingSum(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result.push(data.slice(0, i + 1).reduce((sum, val) => sum + val, 0));
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        result.push(window.reduce((sum, val) => sum + val, 0));
      }
    }
    return result;
  }

  /**
   * Calculate cumulative sum
   */
  static calculateCumulativeSum(data: number[]): number[] {
    let sum = 0;
    return data.map((value) => {
      sum += value;
      return sum;
    });
  }

  /**
   * Calculate year-over-year growth
   */
  static calculateYoYGrowth(
    currentYear: number[],
    previousYear: number[]
  ): number[] {
    return currentYear.map((current, i) => {
      const previous = previousYear[i] || 0;
      return this.calculatePercentageChange(current, previous);
    });
  }

  /**
   * Calculate month-over-month growth
   */
  static calculateMoMGrowth(data: number[]): number[] {
    return data.map((current, i) => {
      if (i === 0) return 0;
      return this.calculatePercentageChange(current, data[i - 1]);
    });
  }

  /**
   * Smooth data using Savitzky-Golay filter
   */
  static smoothData(data: number[], windowSize: number = 5): number[] {
    if (windowSize % 2 === 0) windowSize++;
    const halfWindow = Math.floor(windowSize / 2);

    return data.map((_, i) => {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length, i + halfWindow + 1);
      const window = data.slice(start, end);
      return window.reduce((sum, val) => sum + val, 0) / window.length;
    });
  }

  /**
   * Detect anomalies using Z-score method
   */
  static detectAnomalies(data: number[], threshold: number = 3): number[] {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );

    return data
      .map((value, index) => ({
        value,
        index,
        zScore: Math.abs((value - mean) / stdDev),
      }))
      .filter((item) => item.zScore > threshold)
      .map((item) => item.index);
  }

  /**
   * Calculate confidence interval
   */
  static calculateConfidenceInterval(
    data: number[],
    confidence: number = 0.95
  ): { lower: number; upper: number; mean: number } {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );

    const zScore = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.645;
    const marginOfError = zScore * (stdDev / Math.sqrt(data.length));

    return {
      mean,
      lower: mean - marginOfError,
      upper: mean + marginOfError,
    };
  }

  /**
   * Calculate weighted average
   */
  static calculateWeightedAverage(
    values: number[],
    weights: number[]
  ): number {
    if (values.length !== weights.length) {
      throw new Error('Values and weights arrays must have the same length');
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = values.reduce(
      (sum, value, i) => sum + value * weights[i],
      0
    );

    return weightedSum / totalWeight;
  }

  /**
   * Calculate compound annual growth rate (CAGR)
   */
  static calculateCAGR(
    beginningValue: number,
    endingValue: number,
    years: number
  ): number {
    if (beginningValue === 0 || years === 0) return 0;
    return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
  }

  /**
   * Calculate run rate (annualized)
   */
  static calculateRunRate(
    revenue: number,
    periodInMonths: number
  ): number {
    if (periodInMonths === 0) return 0;
    return (revenue / periodInMonths) * 12;
  }

  /**
   * Calculate burn rate
   */
  static calculateBurnRate(
    startingBalance: number,
    endingBalance: number,
    months: number
  ): number {
    if (months === 0) return 0;
    return (startingBalance - endingBalance) / months;
  }

  /**
   * Calculate runway (months)
   */
  static calculateRunway(
    currentBalance: number,
    monthlyBurnRate: number
  ): number {
    if (monthlyBurnRate === 0) return Infinity;
    return currentBalance / monthlyBurnRate;
  }

  /**
   * Calculate net promoter score (NPS)
   */
  static calculateNPS(
    promoters: number,
    passives: number,
    detractors: number
  ): number {
    const total = promoters + passives + detractors;
    if (total === 0) return 0;

    const promoterPercent = (promoters / total) * 100;
    const detractorPercent = (detractors / total) * 100;

    return promoterPercent - detractorPercent;
  }

  /**
   * Calculate customer satisfaction score (CSAT)
   */
  static calculateCSAT(
    satisfiedCustomers: number,
    totalResponses: number
  ): number {
    if (totalResponses === 0) return 0;
    return (satisfiedCustomers / totalResponses) * 100;
  }

  /**
   * Calculate customer effort score (CES)
   */
  static calculateCES(scores: number[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Format date for display
   */
  static formatDate(
    date: Date,
    format: 'short' | 'medium' | 'long' = 'medium'
  ): string {
    let options: Intl.DateTimeFormatOptions;
    
    if (format === 'short') {
      options = { month: 'numeric', day: 'numeric', year: '2-digit' };
    } else if (format === 'long') {
      options = { month: 'long', day: 'numeric', year: 'numeric' };
    } else {
      options = { month: 'short', day: 'numeric', year: 'numeric' };
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  /**
   * Format time duration
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours < 24) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }

  /**
   * Generate random data for testing
   */
  static generateRandomData(
    count: number,
    min: number,
    max: number,
    trend: 'up' | 'down' | 'stable' = 'stable'
  ): number[] {
    const data: number[] = [];
    let current = (min + max) / 2;

    for (let i = 0; i < count; i++) {
      const randomChange = (Math.random() - 0.5) * (max - min) * 0.1;

      if (trend === 'up') {
        current += Math.abs(randomChange);
      } else if (trend === 'down') {
        current -= Math.abs(randomChange);
      } else {
        current += randomChange;
      }

      current = Math.max(min, Math.min(max, current));
      data.push(Math.round(current));
    }

    return data;
  }

  /**
   * Export data to CSV format
   */
  static exportToCSV(
    data: Array<Record<string, any>>,
    filename: string
  ): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || '')).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  /**
   * Calculate market share
   */
  static calculateMarketShare(
    ourRevenue: number,
    totalMarketRevenue: number
  ): number {
    if (totalMarketRevenue === 0) return 0;
    return (ourRevenue / totalMarketRevenue) * 100;
  }

  /**
   * Calculate penetration rate
   */
  static calculatePenetrationRate(
    customers: number,
    totalMarket: number
  ): number {
    if (totalMarket === 0) return 0;
    return (customers / totalMarket) * 100;
  }
}

export default AnalyticsHelpers;
