import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { wishlistApi } from '../../services/wishlist-api';
import './RestaurantList.css';

const RestaurantList: React.FC = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radius, setRadius] = useState<number | null>(null); // null = no radius, show all
  const [radiusKm, setRadiusKm] = useState<number>(5); // default 5 km

  
  // Utility to calculate distance in km between two coordinates
  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  interface Restaurant {
    id: string;
    name: string;
    location?: { lat: number; lng: number };
    cuisine?: string;
    rating?: number;
    totalRatings?: number;
    description?: string;
    deliveryTime?: string; // fallback
    isLocalLegend?: boolean;
    menu?: MenuItem[];
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  }

  interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
  }

  interface RestaurantWithDistance extends Restaurant {
    distanceKm?: number | null;
  }

  const { data: restaurants, isLoading, isError, refetch } = useQuery<RestaurantWithDistance[], Error>({
    queryKey: ['restaurants', coords, radiusKm],
    queryFn: async () => {
      const response = await api.get('/customer/restaurants', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const allRestaurants: Restaurant[] = response.data.restaurants;

      const restaurantsWithDistance: RestaurantWithDistance[] = allRestaurants.map((r) => {
        const distanceKm = coords.lat != null && coords.lng != null && r.location
          ? getDistanceKm(coords.lat, coords.lng, r.location.lat, r.location.lng)
          : null;

        console.log(`Restaurant: ${r.name}, Distance: ${distanceKm?.toFixed(2) ?? 'N/A'} km`);

        return { ...r, distanceKm };
      });

      console.log('User coords:', coords);
      
      
      restaurantsWithDistance.forEach(r => {
        console.log('Restaurant object:', r);
        console.log(`${r.name}: ${r.distanceKm?.toFixed(2) ?? 'N/A'} km`);
      });


      // If radiusKm is set, filter by distance, else return all
      if (radiusKm && coords.lat != null && coords.lng != null) {
        return restaurantsWithDistance.filter(
          (r) => r.distanceKm != null && r.distanceKm <= radiusKm
        );
      }

      return restaurantsWithDistance;
    },
    enabled: true,
    refetchOnWindowFocus: false,
  });


  // Fetch ratings for selected restaurant
  const { data: restaurantRatings, isLoading: ratingsLoading } = useQuery({
    queryKey: ['ratings', selectedRestaurant?.id],
    queryFn: async () => {
      if (!selectedRestaurant?.id) return null;
      const response = await api.get(`/ratings/restaurant/${selectedRestaurant.id}`);
      return response.data;
    },
    enabled: !!selectedRestaurant
  });

  // Fetch rating statistics
  const { data: ratingStats } = useQuery({
    queryKey: ['rating-stats', selectedRestaurant?.id],
    queryFn: async () => {
      if (!selectedRestaurant?.id) return null;
      const response = await api.get(`/ratings/restaurant/${selectedRestaurant.id}/stats`);
      return response.data;
    },
    enabled: !!selectedRestaurant
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: (item: any) => wishlistApi.addItem(user!.id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      alert('Added to wishlist! ❤️');
    },
    onError: () => {
      alert('Failed to add to wishlist. Please try again.');
    }
  });

  // utility to estimate delivery time based on distance
  const estimateDeliveryTime = (distanceKm: number | null) => {
    if (distanceKm == null) return '30-45 min'; // default
    if (distanceKm <= 1) return '10-15 min';
    if (distanceKm <= 3) return '15-25 min';
    if (distanceKm <= 5) return '25-35 min';
    return '35-50 min';
  };


  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      setCoords({ lat: null, lng: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        console.warn("Location error:", err.message);
        setLocationError("Location access denied. Showing all restaurants.");
        setCoords({ lat: null, lng: null });
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Handle restaurant parameter from URL
  useEffect(() => {
    const restaurantId = searchParams.get('restaurant');
    if (restaurantId && restaurants) {
      const restaurant = restaurants.find((r: any) => r.id === restaurantId);
      if (restaurant) {
        setSelectedRestaurant(restaurant);
      }
    }
  }, [searchParams, restaurants]);

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setRadius(value > 0 ? value : null);
    refetch();
  };

  const handleAddToCart = (menuItem: any) => {
    addItem({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name
    });
  };

  const handleAddRestaurantToWishlist = (restaurant: any) => {
    addToWishlistMutation.mutate({
      type: 'restaurant',
      itemId: restaurant.id,
      name: restaurant.name,
      details: {
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        description: restaurant.description
      }
    });
  };

  const handleAddMenuItemToWishlist = (menuItem: any) => {
    addToWishlistMutation.mutate({
      type: 'menuItem',
      itemId: menuItem.id,
      name: menuItem.name,
      details: {
        price: menuItem.price,
        description: menuItem.description,
        restaurantName: selectedRestaurant.name
      }
    });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🍽️</div>
        <p>Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div className="restaurant-list">
      
      {locationError && (
        <div className="location-warning">
          ⚠ {locationError}
        </div>
      )}

      <h1>Restaurants</h1>

      {/* Radius input */}
      {coords.lat && coords.lng && (
        <div className="radius-input">
          <label>
            Search nearby (km):
            <input
              type="number"
              min={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            />
          </label>
          <button onClick={() => refetch()}>Search</button>
        </div>
      )}
      
      {!selectedRestaurant ? (
        <div className="restaurants-grid">
          {restaurants?.map((restaurant: any) => (
            <div className="restaurant-card">
              <div className="restaurant-header">
                <h3>{restaurant.name}</h3>
                {restaurant.isLocalLegend && <span className="local-legend-badge">🏆 Local Legend</span>}
              </div>

              <p className="restaurant-cuisine">{restaurant.cuisine}</p>
              
              {restaurant.address && (
                <p className="restaurant-address">
                  📍 {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
                </p>
              )}

              <div className="restaurant-rating">
                <span className="rating">⭐ {restaurant.rating}</span>
                {restaurant.totalRatings > 0 && <span className="rating-count">({restaurant.totalRatings} reviews)</span>}
                <span className="delivery-time">
                  ⏱ {estimateDeliveryTime(restaurant.distanceKm)}
                  {restaurant.distanceKm != null && ` — ${restaurant.distanceKm.toFixed(1)} km away`}
                </span>
              </div>

              <p>{restaurant.description || 'Delicious food awaits you!'}</p>
              
              <div className="restaurant-actions">
                <button onClick={() => setSelectedRestaurant(restaurant)} className="btn btn-primary">View Menu</button>
                <button
                  onClick={() => handleAddRestaurantToWishlist(restaurant)}
                  className="btn btn-wishlist"
                  disabled={addToWishlistMutation.isPending}
                >
                  ❤️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="menu-view">
          <div className="menu-header">
            <button 
              onClick={() => setSelectedRestaurant(null)}
              className="back-btn"
            >
              ← Back to Restaurants
            </button>
            <div className="restaurant-info">
              <h2>{selectedRestaurant.name}</h2>
              {selectedRestaurant.isLocalLegend && (
                <span className="local-legend-badge">🏆 Local Legend - Extra Points!</span>
              )}
              {ratingStats && (
                <div className="rating-summary">
                  <span className="rating-stars">⭐ {ratingStats.averageRating}</span>
                  <span className="rating-count">({ratingStats.totalRatings} reviews)</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="menu-items">
            <h3>Menu</h3>
            {selectedRestaurant.menu?.map((item: any) => (
              <div key={item.id} className="menu-item">
                <div className="menu-item-info">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <span className="price">${item.price}</span>
                </div>
                <div className="menu-item-actions">
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="btn btn-primary"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => handleAddMenuItemToWishlist(item)}
                    className="btn btn-wishlist"
                    title="Add to wishlist"
                    disabled={addToWishlistMutation.isPending}
                  >
                    ❤️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Ratings Section */}
          <div className="restaurant-ratings-section">
            <h3>Customer Reviews</h3>
            
            {ratingStats && ratingStats.totalRatings > 0 && (
              <div className="rating-stats">
                <div className="rating-overview">
                  <div className="average-rating">
                    <span className="rating-number">{ratingStats.averageRating}</span>
                    <div className="rating-stars">
                      {'⭐'.repeat(Math.round(ratingStats.averageRating))}
                    </div>
                    <span className="total-reviews">{ratingStats.totalRatings} reviews</span>
                  </div>
                  
                  <div className="rating-distribution">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="distribution-bar">
                        <span className="star-label">{star} ⭐</span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ 
                              width: `${ratingStats.totalRatings > 0 
                                ? (ratingStats.ratingDistribution[star] / ratingStats.totalRatings * 100) 
                                : 0}%` 
                            }}
                          />
                        </div>
                        <span className="count">{ratingStats.ratingDistribution[star]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {ratingsLoading ? (
              <div className="ratings-loading">Loading reviews...</div>
            ) : restaurantRatings && restaurantRatings.ratings.length > 0 ? (
              <div className="ratings-list">
                {restaurantRatings.ratings.map((rating: any) => (
                  <div key={rating.orderId} className="rating-card">
                    <div className="rating-header">
                      <div className="rating-stars">
                        {'⭐'.repeat(rating.rating)}
                      </div>
                      <small className="rating-date">
                        {new Date(rating.ratedAt?.toDate?.() || rating.ratedAt).toLocaleDateString()}
                      </small>
                    </div>
                    {rating.review && (
                      <p className="rating-review">{rating.review}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-ratings">
                <p>No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;


