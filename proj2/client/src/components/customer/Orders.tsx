import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import './Orders.css';
// In the main App.tsx or Orders.tsx
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// --- Tracking Hook ---
import { useRef } from 'react';

// Fix Leaflet default icon issue in TypeScript
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


const Orders: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  // Add state for live delivery tracking
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<[number, number] | null>(null);
  const trackingInterval = useRef<NodeJS.Timer | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [customerLocation, setCustomerLocation] = useState<[number, number] | null>(null);

  // Get customer location on component mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);


  // Polling the backend for live location every 5s if trackingOrder is set
  useEffect(() => {
    const fetchLocation = async () => {
      if (!trackingOrder) return;
      try {
        const res = await api.get(`/delivery/track/${trackingOrder.id}`);
        if (res.data?.location) {
          setDeliveryLocation([res.data.location.lat, res.data.location.lng]);
        } else {
          setDeliveryLocation(null); // rider hasn't sent location yet
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          console.log('Order not found.');
          setDeliveryLocation(null);
        } else if (err.response?.status === 400) {
          console.log('No rider assigned yet.');
          setDeliveryLocation(null);
        } else {
          console.error('Failed to fetch delivery location', err);
        }
      }
    };

    if (trackingOrder) {
      // Clear any previous interval
      if (trackingInterval.current) clearInterval(trackingInterval.current);

      fetchLocation(); // fetch immediately
      trackingInterval.current = setInterval(fetchLocation, 5000);
    }

    // Cleanup
    return () => {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
        trackingInterval.current = null;
      }
    };
  }, [trackingOrder]);

  useEffect(() => {
    if (mapRef.current && trackingOrder && deliveryLocation &&
        trackingOrder.restaurantAddress?.lat && trackingOrder.deliveryAddress?.lat) {
      const bounds = L.latLngBounds([
        [trackingOrder.restaurantAddress.lat, trackingOrder.restaurantAddress.lng],
        deliveryLocation,
        [trackingOrder.deliveryAddress.lat, trackingOrder.deliveryAddress.lng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [trackingOrder, deliveryLocation]);
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['customerOrders', user?.id],
    queryFn: async () => {
      const response = await api.get(`/orders/customer?customerId=${user?.id}`);
      return response.data.orders;
    },
    enabled: !!user
  });

  const rateOrderMutation = useMutation({
    mutationFn: async ({ orderId, rating, review }: { orderId: string; rating: number; review: string }) => {
      const response = await api.post(`/orders/${orderId}/rate`, {
        rating,
        review,
        customerId: user?.id
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      setShowRatingModal(false);
      setRatingOrder(null);
      setRating(5);
      setReview('');
      alert('Rating submitted successfully!');
    },
    onError: (error: any) => {
      alert('Failed to submit rating: ' + (error.response?.data?.error || 'Unknown error'));
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async (order: any) => {
      const response = await api.post('/orders', {
        customerId: user?.id,
        restaurantId: order.restaurantId,
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryAddress: order.deliveryAddress
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      alert('Order placed successfully! 🎉');
    },
    onError: (error: any) => {
      alert('Failed to reorder: ' + (error.response?.data?.error || 'Unknown error'));
    }
  });

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">📦</div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  const activeOrders = orders?.filter((order: any) => 
    ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status)
  ) || [];
  
  const completedOrders = orders?.filter((order: any) => 
    ['delivered', 'cancelled'].includes(order.status)
  ) || [];

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const handleRateOrder = (order: any) => {
    setRatingOrder(order);
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setRatingOrder(null);
    setRating(5);
    setReview('');
  };

  const submitRating = () => {
    if (ratingOrder) {
      rateOrderMutation.mutate({
        orderId: ratingOrder.id,
        rating,
        review
      });
    }
  };

  const handleReorder = (order: any) => {
    if (window.confirm(`Reorder ${order.items.length} items for $${order.totalAmount.toFixed(2)}?`)) {
      reorderMutation.mutate(order);
    }
  };

  return (
    <div className="orders">
      <h1>Your Orders</h1>
      
      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="orders-section">
          <h2>Active Orders ({activeOrders.length})</h2>
          <div className="orders-list">
            {activeOrders.map((order: any) => (
              <div key={order.id} className="order-card active">
                <div className="order-header">
                  <h3>Order #{order.id.slice(-6)}</h3>
                  <span className={`status status-${order.status}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="order-details">
                  <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                  <p><strong>Items:</strong> {order.items.length} item(s)</p>
                  <p><strong>Ordered:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="order-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleViewDetails(order)}
                  >
                    View Details
                  </button>
                  {['out_for_delivery'].includes(order.status) && (
                    <button 
                    className="btn btn-info"
                    onClick={() => setTrackingOrder(order)}
                    >
                      Track Order
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order History */}
      {completedOrders.length > 0 && (
        <div className="orders-section">
          <h2>Order History ({completedOrders.length})</h2>
          <div className="orders-list">
            {completedOrders.map((order: any) => (
              <div
                key={order.id}
                className={`order-card ${
                  order.status === 'cancelled' ? 'cancelled' : 'completed'
                }`}
              >
                <div className="order-header">
                  <h3>Order #{order.id.slice(-6)}</h3>
                  <span className={`status status-${order.status}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="order-details">
                  <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                  <p><strong>Items:</strong> {order.items.length} item(s)</p>
                  <p><strong>Ordered:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  {order.deliveredAt && (
                    <p><strong>Delivered:</strong> {order.deliveredAt._seconds ? 
                      new Date(order.deliveredAt._seconds * 1000).toLocaleDateString() : 
                      new Date(order.deliveredAt).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="order-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleViewDetails(order)}
                  >
                    View Details
                  </button>
                  {order.status === 'delivered' && (
                    <button 
                      className="btn btn-success reorder-btn"
                      onClick={() => handleReorder(order)}
                      disabled={reorderMutation.isPending}
                    >
                      {reorderMutation.isPending ? 'Ordering...' : '🔄 Reorder'}
                    </button>
                  )}
                  {order.status === 'delivered' && !order.ratings?.customer && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleRateOrder(order)}
                    >
                      Rate Order
                    </button>
                  )}
                  {order.status === 'delivered' && order.ratings?.customer && (
                    <div className="rating-display">
                      <span className="rating-stars">
                        {'★'.repeat(order.ratings.customer.rating)}{'☆'.repeat(5 - order.ratings.customer.rating)}
                      </span>
                      <span className="rating-text">Rated</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Start your food adventure by placing your first order!</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details #{selectedOrder.id.slice(-6)}</h2>
              <button className="close-btn" onClick={closeOrderDetails}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-info">
                <div className="info-section">
                  <h3>Order Information</h3>
                  <p><strong>Status:</strong> <span className={`status status-${selectedOrder.status}`}>
                    {selectedOrder.status.replace('_', ' ').toUpperCase()}
                  </span></p>
                  <p><strong>Total Amount:</strong> ${selectedOrder.totalAmount.toFixed(2)}</p>
                  <p><strong>Ordered:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  {selectedOrder.deliveredAt && (
                    <p><strong>Delivered:</strong> {selectedOrder.deliveredAt._seconds ? 
                      new Date(selectedOrder.deliveredAt._seconds * 1000).toLocaleString() : 
                      new Date(selectedOrder.deliveredAt).toLocaleString()}</p>
                  )}
                </div>

                <div className="info-section">
                  <h3>Items Ordered</h3>
                  <div className="items-list">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="item-row">
                        <span className="item-quantity">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.deliveryAddress && (
                  <div className="info-section">
                    <h3>Delivery Address</h3>
                    <p>
                      {selectedOrder.deliveryAddress.street}<br/>
                      {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingOrder && (
        <div className="modal-overlay" onClick={() => setTrackingOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tracking Order #{trackingOrder.id.slice(-6)}</h2>
              <button className="close-btn" onClick={() => setTrackingOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              {deliveryLocation ? (
                <MapContainer
                  center={deliveryLocation}
                  zoom={13}
                  style={{ height: '400px', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  {/* Rider Current Location */}
                  <Marker position={deliveryLocation}>
                    <Popup>Rider Current Location</Popup>
                  </Marker>

                  {/* Restaurant Location */}
                  {trackingOrder?.restaurantAddress?.lat && (
                    <Marker position={[trackingOrder.restaurantAddress.lat, trackingOrder.restaurantAddress.lng]}>
                      <Popup>Restaurant</Popup>
                    </Marker>
                  )}

                  {/* Customer Delivery Address */}
                  {/* {trackingOrder?.deliveryAddress?.lat && (
                    <Marker position={[trackingOrder.deliveryAddress.lat, trackingOrder.deliveryAddress.lng]}>
                      <Popup>Your Location</Popup>
                    </Marker>
                  )} */}
                  {/* Customer Location (from browser) */}
                  {customerLocation && (
                    <Marker position={customerLocation}>
                      <Popup>Your Location</Popup>
                    </Marker>
                  )}


                  {/* Optional: Polyline from rider to customer */}
                  {deliveryLocation && customerLocation && (
                    <Polyline
                      positions={[deliveryLocation, customerLocation]}
                      color="blue"
                    />
                  )}

                </MapContainer>
              ) : (
                <p>Loading delivery location...</p>
              )}
            </div>
          </div>
        </div>
      )}




      {/* Rating Modal */}
      {showRatingModal && ratingOrder && (
        <div className="modal-overlay" onClick={closeRatingModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rate Your Order #{ratingOrder.id.slice(-6)}</h2>
              <button className="close-btn" onClick={closeRatingModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="rating-form">
                <div className="rating-section">
                  <label>Rating:</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star ${star <= rating ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="rating-text">{rating} star{rating !== 1 ? 's' : ''}</span>
                </div>

                <div className="review-section">
                  <label htmlFor="review">Review (optional):</label>
                  <textarea
                    id="review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience with this order..."
                    rows={4}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={closeRatingModal}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={submitRating}
                    disabled={rateOrderMutation.isPending}
                  >
                    {rateOrderMutation.isPending ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
