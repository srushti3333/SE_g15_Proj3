const Order = require('../models/Order');
const DeliveryLocation = require('../models/deliveryLocation');
const { db } = require('../config/firebase');

// ---- Mock Firebase ----
jest.mock('../config/firebase', () => {
  const setMock = jest.fn();
  const updateMock = jest.fn();
  const getMock = jest.fn();
  const whereMock = jest.fn();
  const orderByMock = jest.fn();
  const limitMock = jest.fn();

  const mockCollection = jest.fn(() => ({
    doc: jest.fn((id) => ({
      id,
      set: setMock,
      update: updateMock,
      get: getMock,
    })),
    where: whereMock.mockReturnThis(),
    orderBy: orderByMock.mockReturnThis(),
    limit: limitMock.mockReturnThis(),
    get: getMock,
  }));

  return {
    db: {
      collection: mockCollection,
    },
  };
});

// ---- Mock DeliveryLocation ----
jest.mock('../models/deliveryLocation');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Order Model', () => {
  test('create() should create an order', async () => {
    const mockSet = db.collection().doc().set;

    const data = {
      customerId: 'c1',
      restaurantId: 'r1',
      items: [],
      totalAmount: 120,
      deliveryAddress: 'Street 1'
    };

    const order = await Order.create(data);

    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(order.customerId).toBe('c1');
    expect(order.status).toBe('pending');
  });

  test('findById() should return order if exists', async () => {
    const mockGet = db.collection().doc().get;

    mockGet.mockResolvedValue({
      exists: true,
      id: 'o1',
      data: () => ({
        customerId: 'c1',
        restaurantId: 'r1'
      })
    });

    const order = await Order.findById('o1');

    expect(order).not.toBeNull();
    expect(order.id).toBe('o1');
  });

  test('findById() should return null if order not found', async () => {
    const mockGet = db.collection().doc().get;
    mockGet.mockResolvedValue({ exists: false });

    const result = await Order.findById('unknown');
    expect(result).toBeNull();
  });

  test('findByCustomerId() should return matching orders', async () => {
    const mockGet = db.collection().get;

    mockGet.mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ customerId: 'c1' }) },
        { id: '2', data: () => ({ customerId: 'c1' }) }
      ]
    });

    const orders = await Order.findByCustomerId('c1');
    expect(orders).toHaveLength(2);
  });

  test('assignDeliveryPartner() should update order', async () => {
    const order = new Order({
      id: 'o1',
      deliveryPartnerId: null
    });

    const mockUpdate = db.collection().doc().update;

    mockUpdate.mockResolvedValue();

    await order.assignDeliveryPartner('rider123');

    expect(mockUpdate).toHaveBeenCalled();
    expect(order.deliveryPartnerId).toBe('rider123');
  });

  test('updateStatus() should update status correctly', async () => {
    const order = new Order({ id: 'o1', status: 'pending' });
    const mockUpdate = db.collection().doc().update;

    await order.updateStatus('delivered');

    expect(mockUpdate).toHaveBeenCalled();
    expect(order.status).toBe('delivered');
    expect(order.deliveredAt).not.toBeNull();
  });

  test('addRating() should update ratings', async () => {
    const order = new Order({ id: 'o1', ratings: {} });
    const mockUpdate = db.collection().doc().update;

    await order.addRating('customer', { rating: 5, review: 'Great!' });

    expect(mockUpdate).toHaveBeenCalled();
    expect(order.ratings.customer.rating).toBe(5);
  });

  test('getDeliveryPartnerLocation() should return location', async () => {
    DeliveryLocation.getLocationByRiderId.mockResolvedValue({
      lat: 10,
      lng: 20
    });

    const order = new Order({ deliveryPartnerId: 'rider1' });

    const loc = await order.getDeliveryPartnerLocation();

    expect(loc.lat).toBe(10);
    expect(DeliveryLocation.getLocationByRiderId).toHaveBeenCalledWith('rider1');
  });

  test('getPendingOrders() should return pending list', async () => {
    const mockGet = db.collection().get;

    mockGet.mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ status: 'pending' }) },
        { id: '2', data: () => ({ status: 'pending' }) }
      ]
    });

    const results = await Order.getPendingOrders();

    expect(results).toHaveLength(2);
  });
});
