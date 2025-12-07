const request = require('supertest');
const express = require('express');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});


jest.mock('../config/firebase', () => {
  const set = jest.fn();
  const update = jest.fn();
  const get = jest.fn();
  const where = jest.fn();
  const orderBy = jest.fn();
  const limit = jest.fn();

  return {
    db: {
      collection: jest.fn(() => ({
        doc: jest.fn((id) => ({
          id,
          set,
          update,
          get
        })),
        where: jest.fn(() => ({
          get
        })),
        get
      })),
    },
  };
});

jest.mock('../models/User', () => ({
  findFreeRiders: jest.fn()
}));

jest.mock('../models/Rating', () => ({
  updateRestaurantRating: jest.fn()
}));

jest.mock('../routes/quests', () => ({
  updateQuestProgress: jest.fn()
}));

jest.mock('../models/deliveryLocation');

const ratings = require('../models/Rating');
const users = require('../models/User');
const deliveryLocation = require('../models/deliveryLocation');
const { updateQuestProgress } = require('../routes/quests');
const { db } = require('../config/firebase');

const ordersRouter = require('../routes/orders');

const app = express();
app.use(express.json());
app.use('/orders', ordersRouter);

beforeEach(() => jest.clearAllMocks());


// ------------------------------------------------------------
// 1. CREATE ORDER
// ------------------------------------------------------------

test("POST /orders - should create order successfully", async () => {
  const mockSet = db.collection().doc().set;
  mockSet.mockResolvedValue();

  const body = {
    restaurantId: "rest1",
    items: [{ id: "i1" }],
    totalAmount: 30,
    deliveryAddress: { street: "123" },
    customerId: "c1"
  };

  const res = await request(app).post("/orders").send(body);

  expect(res.status).toBe(201);
  expect(mockSet).toHaveBeenCalledTimes(1);
  expect(updateQuestProgress).toHaveBeenCalled();
});

test("POST /orders - should return validation error", async () => {
  const res = await request(app).post("/orders").send({});

  expect(res.status).toBe(400);
});

test("POST /orders - quest update failure should not fail order", async () => {
  const mockSet = db.collection().doc().set;
  mockSet.mockResolvedValue();

  updateQuestProgress.mockRejectedValue(new Error("Quest error"));

  const res = await request(app).post("/orders").send({
    restaurantId: "r1",
    items: [{}],
    totalAmount: 50,
    deliveryAddress: { a: 1 },
    customerId: "c1"
  });

  expect(res.status).toBe(201);
  expect(mockSet).toHaveBeenCalled();
});


// ------------------------------------------------------------
// 2. GET CUSTOMER ORDERS
// ------------------------------------------------------------

test("GET /orders/customer - should return customer orders", async () => {
  const mockGet = db.collection().get;

  mockGet.mockResolvedValue({
    docs: [
      { id: "o1", data: () => ({ customerId: "c1", createdAt: new Date(), updatedAt: new Date() }) }
    ]
  });

  const res = await request(app).get("/orders/customer?customerId=c1");

  expect(res.status).toBe(200);
  expect(res.body.orders.length).toBe(1);
});

test("GET /orders/customer - missing customerId", async () => {
  const res = await request(app).get("/orders/customer");

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Customer ID required");
});


// ------------------------------------------------------------
// 3. GET RESTAURANT ORDERS
// ------------------------------------------------------------

test("GET /orders/restaurant - should return restaurant orders", async () => {
  const mockGet = db.collection().get;

  mockGet.mockResolvedValue({
    docs: [{ id: "o1", data: () => ({ restaurantId: "r1" }) }]
  });

  const res = await request(app).get("/orders/restaurant?restaurantId=r1");

  expect(res.status).toBe(200);
  expect(res.body.orders).toHaveLength(1);
});

test("GET /orders/restaurant - missing restaurantId", async () => {
  const res = await request(app).get("/orders/restaurant");

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("Restaurant ID required");
});


// ------------------------------------------------------------
// 4. GET DELIVERY PARTNER ORDERS
// ------------------------------------------------------------

test("GET /orders/delivery - should return empty array", async () => {
  const res = await request(app).get("/orders/delivery");

  expect(res.status).toBe(200);
  expect(res.body.orders).toEqual([]);
});


// ------------------------------------------------------------
// 5. GET ORDER BY ID
// ------------------------------------------------------------

test("GET /orders/:id - return order successfully", async () => {
  const mockGet = db.collection().doc().get;

  mockGet.mockResolvedValue({
    exists: true,
    id: "o1",
    data: () => ({ customerId: "c1", status: "pending" })
  });

  const res = await request(app).get("/orders/o1");

  expect(res.status).toBe(200);
  expect(res.body.order.id).toBe("o1");
});

test("GET /orders/:id - not found", async () => {
  const mockGet = db.collection().doc().get;
  mockGet.mockResolvedValue({ exists: false });

  const res = await request(app).get("/orders/unknown");

  expect(res.status).toBe(404);
});

test("GET /orders/:id - should include live location", async () => {
  const mockOrderGet = db.collection().doc().get;
  const mockLocGet = db.collection().doc().get;

  mockOrderGet
    .mockResolvedValueOnce({       // first call: order
      exists: true,
      id: "o1",
      data: () => ({
        customerId: "c1",
        status: "pending",
        deliveryPartnerId: "rider1"
      })
    })
    .mockResolvedValueOnce({       // second call: location
      exists: true,
      data: () => ({
        lat: 10,
        lng: 20
      })
    });

  const res = await request(app).get("/orders/o1");

  expect(res.status).toBe(200);
  expect(res.body.liveLocation.lat).toBe(10);
});


// ------------------------------------------------------------
// 6. UPDATE ORDER STATUS
// ------------------------------------------------------------

test("PUT /orders/:id/status - valid status update", async () => {
  const mockUpdate = db.collection().doc().update;
  mockUpdate.mockResolvedValue();

  const res = await request(app)
    .put("/orders/o1/status")
    .send({ status: "delivered" });

  expect(res.status).toBe(200);
  expect(mockUpdate).toHaveBeenCalled();
});

test("PUT /orders/:id/status - invalid status", async () => {
  const res = await request(app)
    .put("/orders/o1/status")
    .send({ status: "invalidStatus" });

  expect(res.status).toBe(400);
});


// ------------------------------------------------------------
// 7. ASSIGN DELIVERY PARTNER
// ------------------------------------------------------------

test("PUT /orders/:id/assign-delivery - works", async () => {
  const mockUpdate = db.collection().doc().update;
  mockUpdate.mockResolvedValue();

  const res = await request(app)
    .put("/orders/o1/assign-delivery")
    .send({ deliveryPartnerId: "riderX" });

  expect(res.status).toBe(200);
  expect(mockUpdate).toHaveBeenCalled();
});

test("PUT /orders/:id/assign-delivery - missing partnerId", async () => {
  const res = await request(app)
    .put("/orders/o1/assign-delivery")
    .send({});

  expect(res.status).toBe(400);
});


// ------------------------------------------------------------
// 8. RATE ORDER
// ------------------------------------------------------------

test("POST /orders/:id/rate - success", async () => {
  const mockOrderGet = db.collection().doc().get;
  const mockUpdate = db.collection().doc().update;

  mockOrderGet.mockResolvedValue({
    exists: true,
    data: () => ({
      customerId: "c1",
      status: "delivered",
      restaurantId: "r1"
    })
  });

  mockUpdate.mockResolvedValue();
  ratings.updateRestaurantRating.mockResolvedValue({ averageRating: 4.5 });

  const res = await request(app)
    .post("/orders/o1/rate")
    .send({ rating: 5, review: "Great", customerId: "c1" });

  expect(res.status).toBe(200);
  expect(mockUpdate).toHaveBeenCalled();
  expect(ratings.updateRestaurantRating).toHaveBeenCalled();
});

test("POST /orders/:id/rate - order not found", async () => {
  const mockGet = db.collection().doc().get;
  mockGet.mockResolvedValue({ exists: false });

  const res = await request(app)
    .post("/orders/x/rate")
    .send({ rating: 5, customerId: "c1" });

  expect(res.status).toBe(404);
});

test("POST /orders/:id/rate - wrong customer", async () => {
  const mockGet = db.collection().doc().get;
  mockGet.mockResolvedValue({
    exists: true,
    data: () => ({ customerId: "other", status: "delivered" })
  });

  const res = await request(app)
    .post("/orders/o1/rate")
    .send({ rating: 5, customerId: "c1" });

  expect(res.status).toBe(403);
});

test("POST /orders/:id/rate - not delivered", async () => {
  const mockGet = db.collection().doc().get;
  mockGet.mockResolvedValue({
    exists: true,
    data: () => ({ customerId: "c1", status: "pending" })
  });

  const res = await request(app)
    .post("/orders/o1/rate")
    .send({ rating: 5, customerId: "c1" });

  expect(res.status).toBe(400);
});

test("POST /orders/:id/rate - already rated", async () => {
  const mockGet = db.collection().doc().get;

  mockGet.mockResolvedValue({
    exists: true,
    data: () => ({
      customerId: "c1",
      status: "delivered",
      ratings: { customer: { rating: 5 } }
    })
  });

  const res = await request(app)
    .post("/orders/o1/rate")
    .send({ rating: 4, customerId: "c1" });

  expect(res.status).toBe(400);
});
