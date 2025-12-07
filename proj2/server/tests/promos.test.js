const request = require('supertest');
const express = require('express');
const promosRouter = require('../routes/promos');
const Promo = require('../models/Promo');

jest.mock('../models/Promo');

const app = express();
app.use(express.json());
app.use('/promos', promosRouter);

describe('Promos API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /promos/active', () => {
    it('should return all active promos', async () => {
      const mockPromos = [
        { id: '1', title: 'Promo 1', active: true, toJSON: () => ({ id: '1', title: 'Promo 1' }) },
        { id: '2', title: 'Promo 2', active: true, toJSON: () => ({ id: '2', title: 'Promo 2' }) }
      ];
      Promo.findAllActive.mockResolvedValue(mockPromos);

      const res = await request(app).get('/promos/active');

      expect(res.status).toBe(200);
      expect(res.body.promos).toHaveLength(2);
      expect(res.body.count).toBe(2);
    });
  });

  describe('GET /promos/restaurant/:restaurantId', () => {
    it('should return promos for a specific restaurant', async () => {
      const mockPromos = [
        { id: '1', restaurantId: 'rest1', toJSON: () => ({ id: '1', restaurantId: 'rest1' }) }
      ];
      Promo.findByRestaurantId.mockResolvedValue(mockPromos);

      const res = await request(app).get('/promos/restaurant/rest1');

      expect(res.status).toBe(200);
      expect(res.body.promos).toHaveLength(1);
      expect(Promo.findByRestaurantId).toHaveBeenCalledWith('rest1');
    });
  });

  describe('POST /promos', () => {
    it('should create a new promo', async () => {
      const newPromo = {
        restaurantId: 'rest1',
        restaurantName: 'Test Restaurant',
        title: 'New Promo',
        description: 'Test description for promo',
        discountPercent: 20,
        code: 'TEST20',
        validUntil: new Date().toISOString()
      };
      const mockPromo = { ...newPromo, id: '1', toJSON: () => ({ ...newPromo, id: '1' }) };
      Promo.create.mockResolvedValue(mockPromo);

      const res = await request(app).post('/promos').send(newPromo);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Promo created successfully');
      expect(res.body.promo.id).toBe('1');
    });

    it('should return 400 for invalid promo data', async () => {
      const res = await request(app).post('/promos').send({ title: 'No' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /promos/:promoId', () => {
    it('should update an existing promo', async () => {
      const mockPromo = {
        id: '1',
        update: jest.fn().mockResolvedValue({ id: '1', title: 'Updated', toJSON: () => ({ id: '1', title: 'Updated' }) })
      };
      Promo.findById.mockResolvedValue(mockPromo);

      const res = await request(app).put('/promos/1').send({ title: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Promo updated successfully');
      expect(mockPromo.update).toHaveBeenCalled();
    });

    it('should return 404 if promo not found', async () => {
      Promo.findById.mockResolvedValue(null);

      const res = await request(app).put('/promos/999').send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /promos/:promoId/deactivate', () => {
    it('should deactivate a promo', async () => {
      const mockPromo = {
        id: '1',
        deactivate: jest.fn().mockResolvedValue()
      };
      Promo.findById.mockResolvedValue(mockPromo);

      const res = await request(app).patch('/promos/1/deactivate');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Promo deactivated successfully');
      expect(mockPromo.deactivate).toHaveBeenCalled();
    });
  });

  describe('DELETE /promos/:promoId', () => {
    it('should delete a promo', async () => {
      const mockPromo = {
        id: '1',
        delete: jest.fn().mockResolvedValue()
      };
      Promo.findById.mockResolvedValue(mockPromo);

      const res = await request(app).delete('/promos/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Promo deleted successfully');
      expect(mockPromo.delete).toHaveBeenCalled();
    });
  });
});
