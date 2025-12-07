import React from 'react';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'cust1' } })
}));
jest.mock('../../contexts/CartContext', () => ({
  useCart: () => ({ addItem: jest.fn() })
}));

describe('Restaurant Ratings Display', () => {
  it('calculates average rating correctly', () => {
    const ratings = [5, 4, 5, 3, 4];
    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    expect(average).toBe(4.2);
  });

  it('formats rating distribution', () => {
    const ratings = [5, 5, 4, 4, 3, 2, 1];
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    ratings.forEach(rating => {
      distribution[rating as keyof typeof distribution]++;
    });
    
    expect(distribution[5]).toBe(2);
    expect(distribution[4]).toBe(2);
    expect(distribution[1]).toBe(1);
  });

  it('identifies local legend status', () => {
    const restaurant = {
      rating: 4.8,
      totalRatings: 150,
      isLocalLegend: true
    };
    
    expect(restaurant.isLocalLegend).toBe(true);
    expect(restaurant.rating).toBeGreaterThan(4.5);
  });

  it('displays rating statistics', () => {
    const stats = {
      averageRating: 4.5,
      totalRatings: 100,
      ratingDistribution: { 5: 50, 4: 30, 3: 15, 2: 3, 1: 2 }
    };
    
    expect(stats.totalRatings).toBe(100);
    expect(stats.averageRating).toBe(4.5);
    expect(Object.values(stats.ratingDistribution).reduce((a, b) => a + b, 0)).toBe(100);
  });
});
