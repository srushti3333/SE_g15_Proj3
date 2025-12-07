const request = require('supertest');
const express = require('express');
const ratingsRouter = require('../routes/ratings');
const Rating = require('../models/Rating');

jest.mock('../models/Rating');

const app = express();
app.use(express.json());
app.use('/ratings', ratingsRouter);

describe('Ratings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /ratings/restaurant/:restaurantId', () => {
    it('should return all ratings for a restaurant', async () => {
      const mockRatings = [
        { orderId: 'order1', rating: 5, review: 'Great!' },
        { orderId: 'order2', rating: 4, review: 'Good' }
      ];
      Rating.getRestaurantRatings.mockResolvedValue(mockRatings);

      const res = await request(app).get('/ratings/restaurant/rest1');

      expect(res.status).toBe(200);
      expect(res.body.ratings).toHaveLength(2);
      expect(res.body.count).toBe(2);
      expect(Rating.getRestaurantRatings).toHaveBeenCalledWith('rest1');
    });

    it('should return empty array if no ratings', async () => {
      Rating.getRestaurantRatings.mockResolvedValue([]);

      const res = await request(app).get('/ratings/restaurant/rest1');

      expect(res.status).toBe(200);
      expect(res.body.ratings).toHaveLength(0);
    });
  });

  describe('GET /ratings/restaurant/:restaurantId/stats', () => {
    it('should return rating statistics', async () => {
      const mockStats = {
        averageRating: 4.5,
        totalRatings: 10,
        ratingDistribution: { 5: 5, 4: 3, 3: 2, 2: 0, 1: 0 }
      };
      Rating.getRestaurantRatingStats.mockResolvedValue(mockStats);

      const res = await request(app).get('/ratings/restaurant/rest1/stats');

      expect(res.status).toBe(200);
      expect(res.body.averageRating).toBe(4.5);
      expect(res.body.totalRatings).toBe(10);
      expect(Rating.getRestaurantRatingStats).toHaveBeenCalledWith('rest1');
    });

    it('should handle restaurant with no ratings', async () => {
      const mockStats = {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
      Rating.getRestaurantRatingStats.mockResolvedValue(mockStats);

      const res = await request(app).get('/ratings/restaurant/rest1/stats');

      expect(res.status).toBe(200);
      expect(res.body.totalRatings).toBe(0);
    });
  });

  describe('POST /ratings/restaurant/:restaurantId/recalculate', () => {
    it('should recalculate restaurant rating', async () => {
      const mockResult = {
        averageRating: 4.5,
        totalRatings: 10
      };
      Rating.updateRestaurantRating.mockResolvedValue(mockResult);

      const res = await request(app).post('/ratings/restaurant/rest1/recalculate');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Restaurant rating recalculated successfully');
      expect(res.body.averageRating).toBe(4.5);
      expect(Rating.updateRestaurantRating).toHaveBeenCalledWith('rest1');
    });

    it('should handle errors during recalculation', async () => {
      Rating.updateRestaurantRating.mockRejectedValue(new Error('Calculation failed'));

      const res = await request(app).post('/ratings/restaurant/rest1/recalculate');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Calculation failed');
    });
  });
});
