const { db } = require('../config/firebase');
const geofire = require('geofire-common');

function isValidCoordinate(location) {
  return (
    location &&
    typeof location.lat === "number" &&
    typeof location.lng === "number" &&
    !isNaN(location.lat) &&
    !isNaN(location.lng)
  );
}

class Restaurant {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.cuisine = data.cuisine;
    this.description = data.description;
    this.rating = data.rating || 0;
    this.deliveryTime = data.deliveryTime || '30-45 min';
    this.isLocalLegend = data.isLocalLegend || false;
    this.menu = data.menu || [];
    this.ownerId = data.ownerId;

    // NEW: location support
    this.location = data.location || null;  // {lat, lng}
    this.geohash = data.geohash || null;

    this.address = data.address;
    this.phone = data.phone;
    this.email = data.email;
    this.isActive = data.isActive !== false; // Default to true
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Create a new restaurant
  static async create(restaurantData) {
    try {
      const restaurantRef = db.collection('restaurants').doc();

      let geohash = null;
      if (isValidCoordinate(restaurantData.location)) {
        geohash = geofire.geohashForLocation([
          restaurantData.location.lat,
          restaurantData.location.lng
        ]);
      }

      const restaurantDoc = {
        id: restaurantRef.id,
        ...restaurantData,
        location: isValidCoordinate(restaurantData.location)
          ? restaurantData.location
          : null,
        geohash,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await restaurantRef.set(restaurantDoc);
      return new Restaurant(restaurantDoc);
    } catch (error) {
      throw new Error(`Failed to create restaurant: ${error.message}`);
    }
  }


  // Get restaurant by ID
  static async findById(id) {
    try {
      const restaurantDoc = await db.collection('restaurants').doc(id).get();
      if (!restaurantDoc.exists) {
        return null;
      }
      return new Restaurant({ id: restaurantDoc.id, ...restaurantDoc.data() });
    } catch (error) {
      throw new Error(`Failed to find restaurant: ${error.message}`);
    }
  }

  // Get restaurant by owner ID
  static async findByOwnerId(ownerId) {
    try {
      const restaurantsSnapshot = await db.collection('restaurants')
        .where('ownerId', '==', ownerId)
        .get();
      
      return restaurantsSnapshot.docs.map(doc => 
        new Restaurant({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Failed to find restaurants by owner: ${error.message}`);
    }
  }

  // Get all active restaurants
  static async findAll() {
    try {
      const restaurantsSnapshot = await db.collection('restaurants')
        .where('isActive', '==', true)
        .get();
      
      return restaurantsSnapshot.docs.map(doc => 
        new Restaurant({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error(`Failed to find restaurants: ${error.message}`);
    }
  }

  // Update restaurant + safely update geohash if location changes
  async update(updateData) {
    try {
      let updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      // Location updated?
      if ("location" in updateData) {
        if (isValidCoordinate(updateData.location)) {
          updatePayload.geohash = geofire.geohashForLocation([
            updateData.location.lat,
            updateData.location.lng
          ]);
        } else {
          updatePayload.location = null;
          updatePayload.geohash = null; // reset
        }
      }

      await db.collection('restaurants').doc(this.id).update(updatePayload);

      Object.assign(this, updatePayload);
      return this;
    } catch (error) {
      throw new Error(`Failed to update restaurant: ${error.message}`);
    }
  }

  // Update menu
  async updateMenu(menuItems) {
    try {
      const restaurantRef = db.collection('restaurants').doc(this.id);
      await restaurantRef.update({
        menu: menuItems,
        updatedAt: new Date()
      });
      
      this.menu = menuItems;
      this.updatedAt = new Date();
      return this;
    } catch (error) {
      throw new Error(`Failed to update menu: ${error.message}`);
    }
  }

  // Delete restaurant
  async delete() {
    try {
      await db.collection('restaurants').doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete restaurant: ${error.message}`);
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      cuisine: this.cuisine,
      description: this.description,
      rating: this.rating,
      deliveryTime: this.deliveryTime,
      isLocalLegend: this.isLocalLegend,
      menu: this.menu,
      ownerId: this.ownerId,
      location: this.location,
      geohash: this.geohash,
      address: this.address,
      phone: this.phone,
      email: this.email,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Restaurant;
