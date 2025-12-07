const request = require('supertest');
const express = require('express');
const subscriptionsRouter = require('../routes/subscriptions');
const Subscription = require('../models/Subscription');

jest.mock('../models/Subscription');

const app = express();
app.use(express.json());
app.use('/subscriptions', subscriptionsRouter);

describe('Subscriptions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /subscriptions/:customerId', () => {
    it('should return customer subscription', async () => {
      const mockSubscription = {
        customerId: 'cust1',
        planType: 'weekly',
        toJSON: () => ({ customerId: 'cust1', planType: 'weekly' })
      };
      Subscription.findByCustomerId.mockResolvedValue(mockSubscription);

      const res = await request(app).get('/subscriptions/cust1');

      expect(res.status).toBe(200);
      expect(res.body.subscription.planType).toBe('weekly');
    });

    it('should return null if no subscription exists', async () => {
      Subscription.findByCustomerId.mockResolvedValue(null);

      const res = await request(app).get('/subscriptions/cust1');

      expect(res.status).toBe(200);
      expect(res.body.subscription).toBeNull();
    });
  });

  describe('POST /subscriptions', () => {
    it('should create weekly subscription', async () => {
      const mockSubscription = {
        customerId: 'cust1',
        planType: 'weekly',
        toJSON: () => ({ customerId: 'cust1', planType: 'weekly' })
      };
      Subscription.create.mockResolvedValue(mockSubscription);

      const res = await request(app)
        .post('/subscriptions')
        .send({
          customerId: 'cust1',
          planType: 'weekly',
          preferences: { cuisine: 'Italian' }
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Subscription created successfully');
      expect(Subscription.create).toHaveBeenCalled();
    });

    it('should create biweekly subscription', async () => {
      const mockSubscription = {
        customerId: 'cust1',
        planType: 'biweekly',
        toJSON: () => ({ customerId: 'cust1', planType: 'biweekly' })
      };
      Subscription.create.mockResolvedValue(mockSubscription);

      const res = await request(app)
        .post('/subscriptions')
        .send({
          customerId: 'cust1',
          planType: 'biweekly'
        });

      expect(res.status).toBe(201);
    });

    it('should create monthly subscription', async () => {
      const mockSubscription = {
        customerId: 'cust1',
        planType: 'monthly',
        toJSON: () => ({ customerId: 'cust1', planType: 'monthly' })
      };
      Subscription.create.mockResolvedValue(mockSubscription);

      const res = await request(app)
        .post('/subscriptions')
        .send({
          customerId: 'cust1',
          planType: 'monthly'
        });

      expect(res.status).toBe(201);
    });

    it('should return 400 for invalid plan type', async () => {
      const res = await request(app)
        .post('/subscriptions')
        .send({
          customerId: 'cust1',
          planType: 'invalid'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /subscriptions/:customerId', () => {
    it('should update subscription preferences', async () => {
      const mockSubscription = {
        customerId: 'cust1',
        planType: 'weekly',
        update: jest.fn().mockResolvedValue({
          toJSON: () => ({ customerId: 'cust1', planType: 'monthly' })
        })
      };
      Subscription.findByCustomerId.mockResolvedValue(mockSubscription);

      const res = await request(app)
        .put('/subscriptions/cust1')
        .send({ planType: 'monthly' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Subscription updated successfully');
      expect(mockSubscription.update).toHaveBeenCalled();
    });

    it('should return 404 if subscription not found', async () => {
      Subscription.findByCustomerId.mockResolvedValue(null);

      const res = await request(app)
        .put('/subscriptions/cust1')
        .send({ planType: 'monthly' });

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /subscriptions/:customerId/meal-plan', () => {
    it('should update meal plan', async () => {
      const mockSubscription = {
        customerId: 'cust1',
        updateMealPlan: jest.fn().mockResolvedValue({
          toJSON: () => ({ customerId: 'cust1', mealPlan: ['meal1', 'meal2'] })
        })
      };
      Subscription.findByCustomerId.mockResolvedValue(mockSubscription);

      const res = await request(app)
        .put('/subscriptions/cust1/meal-plan')
        .send({ mealPlan: ['meal1', 'meal2'] });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Meal plan updated successfully');
      expect(mockSubscription.updateMealPlan).toHaveBeenCalledWith(['meal1', 'meal2']);
    });

    it('should return 404 if subscription not found', async () => {
      Subscription.findByCustomerId.mockResolvedValue(null);

      const res = await request(app)
        .put('/subscriptions/cust1/meal-plan')
        .send({ mealPlan: [] });

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /subscriptions/:customerId/toggle', () => {
    it('should toggle subscription active status', async () => {
      const mockSubscription = {
        customerId: 'cust1',
        active: true,
        toggleActive: jest.fn().mockResolvedValue({
          active: false,
          toJSON: () => ({ customerId: 'cust1', active: false })
        })
      };
      Subscription.findByCustomerId.mockResolvedValue(mockSubscription);

      const res = await request(app).patch('/subscriptions/cust1/toggle');

      expect(res.status).toBe(200);
      expect(mockSubscription.toggleActive).toHaveBeenCalled();
    });
  });

  describe('DELETE /subscriptions/:customerId', () => {
    it('should delete subscription', async () => {
      const mockSubscription = {
        customerId: 'cust1',
        delete: jest.fn().mockResolvedValue()
      };
      Subscription.findByCustomerId.mockResolvedValue(mockSubscription);

      const res = await request(app).delete('/subscriptions/cust1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Subscription deleted successfully');
      expect(mockSubscription.delete).toHaveBeenCalled();
    });
  });

  describe('GET /subscriptions/admin/all-active', () => {
    it('should return all active subscriptions', async () => {
      const mockSubscriptions = [
        { customerId: 'cust1', active: true, toJSON: () => ({ customerId: 'cust1' }) },
        { customerId: 'cust2', active: true, toJSON: () => ({ customerId: 'cust2' }) }
      ];
      Subscription.findAllActive.mockResolvedValue(mockSubscriptions);

      const res = await request(app).get('/subscriptions/admin/all-active');

      expect(res.status).toBe(200);
      expect(res.body.subscriptions).toHaveLength(2);
      expect(res.body.count).toBe(2);
    });
  });
});
