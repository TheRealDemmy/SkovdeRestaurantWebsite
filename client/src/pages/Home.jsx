import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { Box, TextField, IconButton, Rating, CircularProgress, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../styles/Home.css';
import { getAllRestaurants } from '../services/restaurantService';
import defaultImageUrl from '../assets/DefaultImage.jpg';

// Lazy load the map component
const MapComponent = lazy(() => import('../components/MapComponent'));

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const RestaurantSkeleton = () => (
    <div className="restaurant-box skeleton">
        <div className="skeleton-image">
            <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
        </div>
        <div className="restaurant-box-overlay skeleton-overlay">
            <Skeleton variant="text" width="70%" height={28} animation="wave" />
            <div className="restaurant-box-rating">
                <Skeleton variant="text" width={100} height={24} animation="wave" />
            </div>
        </div>
    </div>
);

const FeaturedRestaurantSkeleton = () => (
    <div className="restaurant-card skeleton">
        <div className="skeleton-image">
            <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
        </div>
        <div className="restaurant-info">
            <Skeleton variant="text" width="80%" height={40} animation="wave" />
            <Skeleton variant="text" width="40%" height={24} animation="wave" />
            <Skeleton variant="text" width="100%" height={80} animation="wave" />
            <div className="restaurant-tags">
                <Skeleton variant="text" width={80} height={32} animation="wave" />
                <Skeleton variant="text" width={100} height={32} animation="wave" />
            </div>
        </div>
    </div>
);

const RestaurantGrid = ({ restaurants, loading, handleImageError }) => {
    if (loading) {
        return (
            <div className="restaurant-grid">
                {Array(6).fill(null).map((_, index) => (
                    <RestaurantSkeleton key={index} />
                ))}
            </div>
        );
    }

    return (
        <div className="restaurant-grid">
            {restaurants.map(restaurant => (
                <div key={restaurant._id} className="restaurant-box">
                    <div className="image-container">
                        <img 
                            src={restaurant.imageUrl ? `http://localhost:5000${restaurant.imageUrl}` : defaultImageUrl}
                            alt={restaurant.name}
                            onError={handleImageError}
                            loading="lazy"
                            decoding="async"
                            crossOrigin="anonymous"
                        />
                    </div>
                    <div className="restaurant-box-overlay">
                        <h3 className="restaurant-box-name">{restaurant.name}</h3>
                        <div className="restaurant-box-rating">
                            <Rating value={restaurant.rating || 0} precision={0.5} readOnly size="small" />
                            <span className="rating-text">{restaurant.rating?.toFixed(1) || 'No ratings'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);

    // Memoize featured restaurant
    const featuredRestaurant = useMemo(() => {
        return restaurants.find(r => r.isFeatured);
    }, [restaurants]);

    // Memoize filtered restaurants
    const filteredRestaurants = useMemo(() => {
        if (!searchQuery) return restaurants;
        const query = searchQuery.toLowerCase();
        return restaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(query) ||
            restaurant.cuisine.toLowerCase().includes(query)
        );
    }, [restaurants, searchQuery]);

    useEffect(() => {
        let mounted = true;

        const fetchRestaurants = () => {
            setLoading(true);
            setError(null);
            
            getAllRestaurants()
                .then(data => {
                    if (!mounted) return;
                    if (!data || !Array.isArray(data)) {
                        throw new Error('Invalid data received from server');
                    }
                    setRestaurants(data);
                })
                .catch(error => {
                    if (!mounted) return;
                    console.error('Error fetching restaurants:', error);
                    setError(error.response?.data?.message || 'Failed to load restaurants. Please try again later.');
                })
                .finally(() => {
                    if (!mounted) return;
                    setLoading(false);
                });
        };

        fetchRestaurants();
        return () => {
            mounted = false;
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // No need to do anything here as filteredRestaurants is memoized
    };

    const handleImageError = (e) => {
        e.target.src = defaultImageUrl;
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="home-page">
            <div className="wrapper1">
                <div className="initial-home-container">
                    <h1 className="welcome-title">Welcome to Elin's Longhouse</h1>
                    <p className="welcome-text">
                        Discover the best restaurants in Skövde. From cozy cafes to fine dining, 
                        find your perfect spot for any occasion.
                    </p>
                    <div className="search-container">
                        <TextField
                            className="search-input"
                            placeholder="Search for restaurants..."
                            variant="outlined"
                            fullWidth
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <IconButton className="search-button" onClick={handleSearch}>
                                        <SearchIcon />
                                    </IconButton>
                                ),
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="wrapper2">
                <div className="featured-section">
                    <h2 className="featured-title">Featured Restaurant</h2>
                    <div className="featured-restaurant">
                        {loading ? (
                            <FeaturedRestaurantSkeleton />
                        ) : featuredRestaurant ? (
                            <div className="restaurant-card">
                                <div className="restaurant-image-container">
                                    <img 
                                        src={featuredRestaurant.imageUrl ? `http://localhost:5000${featuredRestaurant.imageUrl}` : defaultImageUrl}
                                        alt={featuredRestaurant.name} 
                                        className="restaurant-image"
                                        onError={handleImageError}
                                        crossOrigin="anonymous"
                                    />
                                </div>
                                <div className="restaurant-info">
                                    <h3 className="restaurant-name">{featuredRestaurant.name}</h3>
                                    <div className="restaurant-rating">
                                        <Rating value={featuredRestaurant.rating || 0} precision={0.5} readOnly />
                                        <span className="rating-text">{featuredRestaurant.rating?.toFixed(1) || 'No ratings'}</span>
                                    </div>
                                    <p className="restaurant-address">{featuredRestaurant.address}</p>
                                    <p className="restaurant-description">{featuredRestaurant.description}</p>
                                    <div className="restaurant-tags">
                                        <span className="tag price-tag">{featuredRestaurant.price}</span>
                                        <span className="tag cuisine-tag">{featuredRestaurant.cuisine}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p>No featured restaurant at the moment.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="wrapper1">
                <RestaurantGrid 
                    restaurants={filteredRestaurants}
                    loading={loading}
                    handleImageError={handleImageError}
                />
            </div>

            <div className="wrapper2">
                <div className="map-section">
                    <h2 className="map-title">Find Restaurants Near You</h2>
                    <div className="map-container">
                        <Suspense fallback={
                            <div className="map-loading">
                                <CircularProgress />
                                <p>Loading map...</p>
                            </div>
                        }>
                            <MapComponent 
                                restaurants={restaurants}
                                onMapLoad={() => setMapLoaded(true)}
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 