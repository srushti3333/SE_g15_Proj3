const request = require('supertest');
const express = require('express');
const wishlistRouter = require('../routes/wishlist');
const Wishlist = require('../models/Wishlist');

jest.mock('../models/Wishlist');

const app = express();
app.use(express.json());
app.use('/wishlist', wishlistRouter);

describe('Wishlist API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /wishlist/:customerId', () => {
    it('should return customer wishlist', async () => {
      const mockWishlist = {
        customerId: 'cust1',
        items: [],
        toJSON: () => ({ customerId: 'cust1', items: [] })
      };
      Wishlist.findByCustomerId.mockResolvedValue(mockWishlist);

      const res = await request(app).get('/wishlist/cust1');

      expect(res.status).toBe(200);
      expect(res.body.wishlist.customerId).toBe('cust1');
      expect(Wishlist.findByCustomerId).toHaveBeenCalledWith('cust1');
    });

    it('should return 400 for invalid customerId', async () => {
      const res = await request(app).get('/wishlist/');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /wishlist/:customerId/add', () => {
    it('should add restaurant to wishlist', async () => {
      const mockWishlist = {
        addItem: jest.fn().mockResolvedValue({
          toJSON: () => ({ customerId: 'cust1', items: [{ type: 'restaurant', itemId: 'rest1' }] })
        })
      };
      Wishlist.findByCustomerId.mockResolvedValue(mockWishlist);

      const res = await request(app)
        .post('/wishlist/cust1/add')
        .send({
          type: 'restaurant',
          itemId: 'rest1',
          name: 'Test Restaurant',
          details: { cuisine: 'Italian' }
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Item added to wishlist');
      expect(mockWishlist.addItem).toHaveBeenCalled();
    });

    it('should add menu item to wishlist', async () => {
      const mockWishlist = {
        addItem: jest.fn().mockResolvedValue({
          toJSON: () => ({ customerId: 'cust1', items: [{ type: 'menuItem', itemId: 'item1' }] })
        })
      };
      Wishlist.findByCustomerId.mockResolvedValue(mockWishlist);

      const res = await request(app)
        .post('/wishlist/cust1/add')
        .send({
          type: 'menuItem',
          itemId: 'item1',
          name: 'Pizza',
          details: { price: 12.99 }
        });

      expect(res.status).toBe(200);
      expect(mockWishlist.addItem).toHaveBeenCalled();
    });

    it('should return 400 for invalid type', async () => {
      const res = await request(app)
        .post('/wishlist/cust1/add')
        .send({
          type: 'invalid',
          itemId: 'item1',
          name: 'Test'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /wishlist/:customerId/remove', () => {
    it('should remove item from wishlist', async () => {
      const mockWishlist = {
        removeItem: jest.fn().mockResolvedValue({
          toJSON: () => ({ customerId: 'cust1', items: [] })
        })
      };
      Wishlist.findByCustomerId.mockResolvedValue(mockWishlist);

      const res = await request(app)
        .delete('/wishlist/cust1/remove')
        .send({ itemId: 'rest1', type: 'restaurant' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Item removed from wishlist');
      expect(mockWishlist.removeItem).toHaveBeenCalledWith('rest1', 'restaurant');
    });
  });

  describe('DELETE /wishlist/:customerId/clear', () => {
    it('should clear entire wishlist', async () => {
      const mockWishlist = {
        clearAll: jest.fn().mockResolvedValue({
          toJSON: () => ({ customerId: 'cust1', items: [] })
        })
      };
      Wishlist.findByCustomerId.mockResolvedValue(mockWishlist);

      const res = await request(app).delete('/wishlist/cust1/clear');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Wishlist cleared');
      expect(mockWishlist.clearAll).toHaveBeenCalled();
    });
  });
});
