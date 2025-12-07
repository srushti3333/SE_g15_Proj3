// tests/deliveryLocation.test.js
const DeliveryLocation = require('../models/deliveryLocation');

// ---- Mock Firestore ----
const mockSet = jest.fn();
const mockGet = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockGetSnap = jest.fn();

jest.mock('../config/firebase', () => {
  return {
    db: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: mockSet,
          get: mockGet
        })),
        where: mockWhere
      }))
    }
  };
});

describe('DeliveryLocation Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------------------------------
  // TEST: setLocation()
  // --------------------------------------------------------
  describe('setLocation', () => {
    it('should set rider location successfully', async () => {
      const input = { riderId: 'r1', orderId: 'o1', lat: 12.34, lng: 56.78 };

      mockSet.mockResolvedValueOnce();

      const result = await DeliveryLocation.setLocation(input);

      expect(mockSet).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        riderId: 'r1',
        orderId: 'o1',
        lat: 12.34,
        lng: 56.78
      }), { merge: true });

      expect(result).toBeInstanceOf(DeliveryLocation);
      expect(result.riderId).toBe('r1');
      expect(result.lat).toBe(12.34);
    });

    it('should throw error if riderId missing', async () => {
      await expect(
        DeliveryLocation.setLocation({ lat: 1, lng: 2 })
      ).rejects.toThrow('riderId required');
    });
  });

  // --------------------------------------------------------
  // TEST: getLocationByRiderId()
  // --------------------------------------------------------
  describe('getLocationByRiderId', () => {
    it('should return a location if document exists', async () => {
      const mockData = {
        riderId: 'r1',
        orderId: 'o1',
        lat: 50,
        lng: 75,
        updatedAt: new Date()
      };

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => mockData
      });

      const result = await DeliveryLocation.getLocationByRiderId('r1');

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(DeliveryLocation);
      expect(result.lat).toBe(50);
      expect(result.lng).toBe(75);
    });

    it('should return null if document does not exist', async () => {
      mockGet.mockResolvedValueOnce({
        exists: false
      });

      const result = await DeliveryLocation.getLocationByRiderId('r1');

      expect(result).toBeNull();
    });
  });

  // --------------------------------------------------------
  // TEST: getLocationByOrderId()
  // --------------------------------------------------------
  describe('getLocationByOrderId', () => {
    it('should return a location matching orderId', async () => {
      const mockData = {
        riderId: 'r1',
        orderId: 'o1',
        lat: 99,
        lng: 33,
        updatedAt: new Date()
      };

      // Mock Firestore query chain
      mockWhere.mockReturnValue({
        limit: mockLimit.mockReturnValue({
          get: mockGetSnap.mockResolvedValue({
            empty: false,
            docs: [{ data: () => mockData }]
          })
        })
      });

      const result = await DeliveryLocation.getLocationByOrderId('o1');

      expect(mockWhere).toHaveBeenCalledWith('orderId', '==', 'o1');
      expect(result).toBeInstanceOf(DeliveryLocation);
      expect(result.lat).toBe(99);
    });

    it('should return null if no document found', async () => {
      mockWhere.mockReturnValue({
        limit: mockLimit.mockReturnValue({
          get: mockGetSnap.mockResolvedValue({
            empty: true
          })
        })
      });

      const result = await DeliveryLocation.getLocationByOrderId('o1');

      expect(result).toBeNull();
    });
  });
});
