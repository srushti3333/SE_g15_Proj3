// models/deliveryLocation.js
const { db } = require('../config/firebase');

class DeliveryLocation {
  constructor(data) {
    this.riderId = data.riderId;
    this.orderId = data.orderId || null;
    this.lat = data.lat;
    this.lng = data.lng;
    this.updatedAt = data.updatedAt ? data.updatedAt.toDate?.() || data.updatedAt : new Date();
  }

  static async setLocation({ riderId, orderId, lat, lng }) {
    try {
      if (!riderId) throw new Error('riderId required');
      const docRef = db.collection('delivery_locations').doc(riderId);
      const payload = {
        riderId,
        orderId: orderId || null,
        lat,
        lng,
        updatedAt: new Date()
      };
      await docRef.set(payload, { merge: true });
      return new DeliveryLocation(payload);
    } catch (err) {
      throw new Error(`Failed to set delivery location: ${err.message}`);
    }
  }

  static async getLocationByRiderId(riderId) {
    try {
      const doc = await db.collection('delivery_locations').doc(riderId).get();
      if (!doc.exists) return null;
      return new DeliveryLocation({ ...doc.data() });
    } catch (err) {
      throw new Error(`Failed to get delivery location: ${err.message}`);
    }
  }

  static async getLocationByOrderId(orderId) {
    try {
      const snap = await db.collection('delivery_locations')
        .where('orderId', '==', orderId)
        .limit(1)
        .get();
      if (snap.empty) return null;
      const doc = snap.docs[0];
      return new DeliveryLocation({ ...doc.data() });
    } catch (err) {
      throw new Error(`Failed to get delivery location by orderId: ${err.message}`);
    }
  }
}

module.exports = DeliveryLocation;
