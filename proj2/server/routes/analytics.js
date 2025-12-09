const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get restaurant analytics
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { range } = req.query;

    const ordersRef = db.collection('orders');
    let query = ordersRef.where('restaurantId', '==', restaurantId);

    // Filter by date range
    if (range) {
      const endDate = new Date();
      let startDate = new Date();
      
      switch(range) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      query = query.where('createdAt', '>=', startDate);
    }

    const ordersSnapshot = await query.get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get ratings
    const ratingsSnapshot = await db.collection('ratings')
      .where('restaurantId', '==', restaurantId)
      .get();
    
    const ratings = ratingsSnapshot.docs.map(doc => doc.data());
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    // Get menu items count
    const menuSnapshot = await db.collection('menuItems')
      .where('restaurantId', '==', restaurantId)
      .get();
    
    const totalMenuItems = menuSnapshot.size;

    res.json({
      totalOrders,
      totalRevenue,
      avgRating: avgRating.toFixed(1),
      totalMenuItems,
      ratingDistribution: [],
      menuPopularity: [],
      performanceMetrics: [],
      revenueOverTime: []
    });

  } catch (error) {
    console.error('Error fetching restaurant analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get customer analytics
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { range } = req.query;

    const ordersRef = db.collection('orders');
    let query = ordersRef.where('customerId', '==', customerId);

    if (range) {
      const endDate = new Date();
      let startDate = new Date();
      
      switch(range) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      query = query.where('createdAt', '>=', startDate);
    }

    const ordersSnapshot = await query.get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Get points
    const pointsDoc = await db.collection('points').doc(customerId).get();
    const pointsEarned = pointsDoc.exists ? pointsDoc.data().totalPoints || 0 : 0;

    // Get order history
    const orderHistory = orders.slice(0, 5).map(order => ({
      date: order.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || 'N/A',
      restaurant: order.restaurantName || 'Unknown',
      items: order.items?.length || 0,
      total: order.totalAmount || 0,
      status: order.status || 'unknown'
    }));

    res.json({
      totalOrders,
      totalSpent,
      avgOrderValue,
      pointsEarned,
      orderHistory,
      spendingOverTime: [],
      favoriteRestaurants: []
    });

  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get delivery partner analytics
router.get('/delivery/:deliveryId', async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { range } = req.query;

    const ordersRef = db.collection('orders');
    let query = ordersRef.where('riderId', '==', deliveryId);

    if (range) {
      const endDate = new Date();
      let startDate = new Date();
      
      switch(range) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      query = query.where('createdAt', '>=', startDate);
    }

    const ordersSnapshot = await query.get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalDeliveries = orders.length;
    const deliveryFee = 5; // Default delivery fee
    const totalEarnings = totalDeliveries * deliveryFee;
    const avgEarningsPerDelivery = deliveryFee;
    
    const completedDeliveries = orders.filter(o => o.status === 'delivered').length;
    const completionRate = totalDeliveries > 0 
      ? (completedDeliveries / totalDeliveries * 100).toFixed(1) 
      : 0;

    // Get delivery history
    const deliveryHistory = orders.slice(0, 5).map(order => ({
      date: order.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || 'N/A',
      restaurant: order.restaurantName || 'Unknown',
      customer: order.customerName || 'Customer',
      earnings: deliveryFee,
      status: order.status || 'unknown'
    }));

    res.json({
      totalDeliveries,
      totalEarnings,
      avgEarningsPerDelivery,
      completionRate: parseFloat(completionRate),
      deliveryHistory,
      earningsOverTime: [],
      deliveriesByStatus: []
    });

  } catch (error) {
    console.error('Error fetching delivery analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get orders analytics for restaurant
router.get('/orders/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { range } = req.query;

    const ordersRef = db.collection('orders');
    let query = ordersRef.where('restaurantId', '==', restaurantId);

    if (range) {
      const endDate = new Date();
      let startDate = new Date();
      
      switch(range) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      query = query.where('createdAt', '>=', startDate);
    }

    const ordersSnapshot = await query.get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const completionRate = totalOrders > 0 
      ? (completedOrders / totalOrders * 100).toFixed(1) 
      : 0;

    res.json({
      totalOrders,
      totalRevenue,
      avgOrderValue,
      completionRate: parseFloat(completionRate),
      ordersOverTime: [],
      topItems: [],
      revenueByRestaurant: [],
      ordersByStatus: []
    });

  } catch (error) {
    console.error('Error fetching orders analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get donations analytics for restaurant
router.get('/donations/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { range } = req.query;

    const donationsRef = db.collection('donations');
    let query = donationsRef.where('restaurantId', '==', restaurantId);

    if (range) {
      const endDate = new Date();
      let startDate = new Date();
      
      switch(range) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      query = query.where('createdAt', '>=', startDate);
    }

    const donationsSnapshot = await query.get();
    const donations = donationsSnapshot.docs.map(doc => doc.data());

    const totalMealsDonated = donations.reduce((sum, d) => sum + (d.meals || 0), 0);
    const totalImpact = totalMealsDonated * 10; // $10 per meal
    const avgDonationsPerOrder = donations.length > 0 ? totalMealsDonated / donations.length : 0;
    const participatingRestaurants = 1;

    res.json({
      totalMealsDonated,
      totalImpact,
      avgDonationsPerOrder,
      participatingRestaurants,
      donationsOverTime: [],
      topContributors: [],
      impactByCategory: [],
      monthlyGrowth: []
    });

  } catch (error) {
    console.error('Error fetching donations analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
