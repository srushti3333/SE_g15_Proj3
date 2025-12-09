// Advanced data processing utilities for analytics

export interface DataPoint {
  timestamp: number;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  data: DataPoint[];
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly';
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

export interface SegmentationResult {
  segments: Array<{
    name: string;
    size: number;
    characteristics: Record<string, any>;
  }>;
  totalPopulation: number;
}

export class DataProcessor {
  /**
   * Calculate moving average for time series data
   */
  static calculateMovingAverage(
    data: number[],
    windowSize: number
  ): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result.push(data[i]);
        continue;
      }
      const window = data.slice(i - windowSize + 1, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / windowSize;
      result.push(avg);
    }
    return result;
  }

  /**
   * Calculate exponential moving average
   */
  static calculateEMA(
    data: number[],
    period: number,
    smoothing: number = 2
  ): number[] {
    const multiplier = smoothing / (period + 1);
    const ema: number[] = [data[0]];

    for (let i = 1; i < data.length; i++) {
      const value = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
      ema.push(value);
    }

    return ema;
  }

  /**
   * Detect trends in time series data
   */
  static detectTrend(data: number[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent > 5) return 'up';
    if (changePercent < -5) return 'down';
    return 'stable';
  }

  /**
   * Calculate growth rate between two periods
   */
  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Normalize data to 0-1 range
   */
  static normalizeData(data: number[]): number[] {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    if (range === 0) return data.map(() => 0.5);

    return data.map((value) => (value - min) / range);
  }

  /**
   * Calculate standard deviation
   */
  static calculateStdDev(data: number[]): number {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const squaredDiffs = data.map((value) => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
    return Math.sqrt(variance);
  }

  /**
   * Detect outliers using IQR method
   */
  static detectOutliers(data: number[]): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);

    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.filter((value) => value < lowerBound || value > upperBound);
  }

  /**
   * Calculate correlation coefficient between two datasets
   */
  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  /**
   * Perform linear regression
   */
  static linearRegression(
    x: number[],
    y: number[]
  ): { slope: number; intercept: number; r2: number } {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const ssResidual = y.reduce(
      (sum, val, i) => sum + Math.pow(val - (slope * x[i] + intercept), 2),
      0
    );
    const r2 = 1 - ssResidual / ssTotal;

    return { slope, intercept, r2 };
  }

  /**
   * Forecast future values using simple exponential smoothing
   */
  static forecastExponentialSmoothing(
    data: number[],
    alpha: number,
    periods: number
  ): number[] {
    const forecast: number[] = [data[0]];

    for (let i = 1; i < data.length; i++) {
      forecast.push(alpha * data[i - 1] + (1 - alpha) * forecast[i - 1]);
    }

    for (let i = 0; i < periods; i++) {
      const lastValue = forecast[forecast.length - 1];
      forecast.push(lastValue);
    }

    return forecast.slice(data.length);
  }

  /**
   * Calculate seasonality index
   */
  static calculateSeasonality(data: number[], period: number): number[] {
    const seasonalIndices: number[] = [];

    for (let i = 0; i < period; i++) {
      const values: number[] = [];
      for (let j = i; j < data.length; j += period) {
        values.push(data[j]);
      }
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      seasonalIndices.push(avg);
    }

    const overallAvg =
      seasonalIndices.reduce((sum, val) => sum + val, 0) / seasonalIndices.length;

    return seasonalIndices.map((val) => val / overallAvg);
  }

  /**
   * Perform K-means clustering
   */
  static kMeansClustering(
    data: Array<{ x: number; y: number }>,
    k: number,
    maxIterations: number = 100
  ): Array<{ centroid: { x: number; y: number }; points: Array<{ x: number; y: number }> }> {
    // Initialize centroids randomly
    const centroids = data.slice(0, k).map((point) => ({ ...point }));
    let clusters: Array<Array<{ x: number; y: number }>> = [];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Assign points to nearest centroid
      clusters = Array.from({ length: k }, () => []);

      data.forEach((point) => {
        let minDist = Infinity;
        let clusterIndex = 0;

        centroids.forEach((centroid, i) => {
          const dist = Math.sqrt(
            Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            clusterIndex = i;
          }
        });

        clusters[clusterIndex].push(point);
      });

      // Update centroids
      let changed = false;
      centroids.forEach((centroid, i) => {
        if (clusters[i].length === 0) return;

        const newX =
          clusters[i].reduce((sum, point) => sum + point.x, 0) / clusters[i].length;
        const newY =
          clusters[i].reduce((sum, point) => sum + point.y, 0) / clusters[i].length;

        if (centroid.x !== newX || centroid.y !== newY) {
          changed = true;
          centroid.x = newX;
          centroid.y = newY;
        }
      });

      if (!changed) break;
    }

    return centroids.map((centroid, i) => ({
      centroid,
      points: clusters[i],
    }));
  }

  /**
   * Calculate customer lifetime value
   */
  static calculateCLV(
    avgOrderValue: number,
    purchaseFrequency: number,
    customerLifespan: number,
    profitMargin: number = 0.2
  ): number {
    return avgOrderValue * purchaseFrequency * customerLifespan * profitMargin;
  }

  /**
   * Calculate churn rate
   */
  static calculateChurnRate(
    customersAtStart: number,
    customersAtEnd: number,
    newCustomers: number
  ): number {
    const churnedCustomers = customersAtStart - (customersAtEnd - newCustomers);
    return (churnedCustomers / customersAtStart) * 100;
  }

  /**
   * Calculate retention rate
   */
  static calculateRetentionRate(
    customersAtStart: number,
    customersAtEnd: number,
    newCustomers: number
  ): number {
    const retainedCustomers = customersAtEnd - newCustomers;
    return (retainedCustomers / customersAtStart) * 100;
  }

  /**
   * Calculate conversion rate
   */
  static calculateConversionRate(conversions: number, visitors: number): number {
    if (visitors === 0) return 0;
    return (conversions / visitors) * 100;
  }

  /**
   * Calculate average order value
   */
  static calculateAOV(totalRevenue: number, numberOfOrders: number): number {
    if (numberOfOrders === 0) return 0;
    return totalRevenue / numberOfOrders;
  }

  /**
   * Calculate customer acquisition cost
   */
  static calculateCAC(marketingSpend: number, newCustomers: number): number {
    if (newCustomers === 0) return 0;
    return marketingSpend / newCustomers;
  }

  /**
   * Calculate return on investment
   */
  static calculateROI(gain: number, cost: number): number {
    if (cost === 0) return 0;
    return ((gain - cost) / cost) * 100;
  }

  /**
   * Perform cohort analysis
   */
  static cohortAnalysis(
    orders: Array<{
      customerId: string;
      orderDate: Date;
      amount: number;
    }>
  ): Map<string, { size: number; revenue: number; retention: number[] }> {
    const cohorts = new Map<
      string,
      { size: number; revenue: number; retention: number[] }
    >();

    // Group by cohort (month of first order)
    const customerCohorts = new Map<string, string>();

    orders.forEach((order) => {
      if (!customerCohorts.has(order.customerId)) {
        const cohortKey = `${order.orderDate.getFullYear()}-${String(
          order.orderDate.getMonth() + 1
        ).padStart(2, '0')}`;
        customerCohorts.set(order.customerId, cohortKey);

        if (!cohorts.has(cohortKey)) {
          cohorts.set(cohortKey, { size: 0, revenue: 0, retention: [] });
        }

        const cohort = cohorts.get(cohortKey)!;
        cohort.size++;
        cohort.revenue += order.amount;
      }
    });

    return cohorts;
  }

  /**
   * Calculate RFM (Recency, Frequency, Monetary) scores
   */
  static calculateRFM(
    customers: Array<{
      id: string;
      lastOrderDate: Date;
      orderCount: number;
      totalSpent: number;
    }>
  ): Array<{
    id: string;
    recencyScore: number;
    frequencyScore: number;
    monetaryScore: number;
    rfmScore: number;
  }> {
    const now = new Date();

    // Calculate recency (days since last order)
    const recencies = customers.map((c) =>
      Math.floor((now.getTime() - c.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Score each dimension (1-5, 5 being best)
    const scoreValue = (value: number, values: number[], reverse: boolean = false) => {
      const sorted = [...values].sort((a, b) => a - b);
      const quintile = Math.floor(sorted.length / 5);

      for (let i = 1; i <= 5; i++) {
        const threshold = sorted[quintile * i];
        if (reverse) {
          if (value >= threshold) return 6 - i;
        } else {
          if (value <= threshold) return i;
        }
      }
      return reverse ? 1 : 5;
    };

    return customers.map((customer, i) => {
      const recencyScore = scoreValue(recencies[i], recencies, true);
      const frequencyScore = scoreValue(
        customer.orderCount,
        customers.map((c) => c.orderCount)
      );
      const monetaryScore = scoreValue(
        customer.totalSpent,
        customers.map((c) => c.totalSpent)
      );

      return {
        id: customer.id,
        recencyScore,
        frequencyScore,
        monetaryScore,
        rfmScore: recencyScore + frequencyScore + monetaryScore,
      };
    });
  }

  /**
   * Perform ABC analysis for inventory/product categorization
   */
  static abcAnalysis(
    items: Array<{ id: string; revenue: number }>
  ): Array<{ id: string; revenue: number; category: 'A' | 'B' | 'C' }> {
    const sorted = [...items].sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = sorted.reduce((sum, item) => sum + item.revenue, 0);

    let cumulativeRevenue = 0;
    return sorted.map((item) => {
      cumulativeRevenue += item.revenue;
      const cumulativePercent = (cumulativeRevenue / totalRevenue) * 100;

      let category: 'A' | 'B' | 'C';
      if (cumulativePercent <= 80) {
        category = 'A';
      } else if (cumulativePercent <= 95) {
        category = 'B';
      } else {
        category = 'C';
      }

      return { ...item, category };
    });
  }

  /**
   * Calculate Pareto principle (80/20 rule) analysis
   */
  static paretoAnalysis(
    data: Array<{ name: string; value: number }>
  ): Array<{ name: string; value: number; cumulativePercent: number }> {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, item) => sum + item.value, 0);

    let cumulative = 0;
    return sorted.map((item) => {
      cumulative += item.value;
      return {
        name: item.name,
        value: item.value,
        cumulativePercent: (cumulative / total) * 100,
      };
    });
  }

  /**
   * Calculate market basket analysis (association rules)
   */
  static marketBasketAnalysis(
    transactions: Array<string[]>,
    minSupport: number = 0.1
  ): Array<{ items: string[]; support: number; confidence?: number }> {
    const itemCounts = new Map<string, number>();
    const pairCounts = new Map<string, number>();

    // Count individual items and pairs
    transactions.forEach((transaction) => {
      transaction.forEach((item) => {
        itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
      });

      for (let i = 0; i < transaction.length; i++) {
        for (let j = i + 1; j < transaction.length; j++) {
          const pair = [transaction[i], transaction[j]].sort().join(',');
          pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
        }
      }
    });

    const totalTransactions = transactions.length;
    const frequentItems: Array<{ items: string[]; support: number }> = [];

    // Find frequent itemsets
    itemCounts.forEach((count, item) => {
      const support = count / totalTransactions;
      if (support >= minSupport) {
        frequentItems.push({ items: [item], support });
      }
    });

    pairCounts.forEach((count, pair) => {
      const support = count / totalTransactions;
      if (support >= minSupport) {
        frequentItems.push({ items: pair.split(','), support });
      }
    });

    return frequentItems.sort((a, b) => b.support - a.support);
  }
}

export default DataProcessor;
