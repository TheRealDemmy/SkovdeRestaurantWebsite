import React, { useState, useEffect, Suspense, lazy, useMemo, useRef } from 'react';
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
    <div className="featured-restaurant skeleton">
        <div className="skeleton-image">
            <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
        </div>
        <div className="featured-info">
            <Skeleton variant="text" width="80%" height={40} animation="wave" />
            <Skeleton variant="text" width="40%" height={24} animation="wave" />
            <Skeleton variant="text" width="60%" height={24} animation="wave" />
            <Skeleton variant="text" width="40%" height={24} animation="wave" />
        </div>
    </div>
);

const RestaurantGrid = ({ restaurants, loading, handleImageError, handleRestaurantClick }) => {
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
                <div 
                    key={restaurant._id} 
                    className="restaurant-box"
                    onClick={() => handleRestaurantClick(restaurant._id)}
                    style={{ cursor: 'pointer' }}
                >
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
                        <div className="restaurant-box-tags">
                            <span className="tag price-tag">{restaurant.price}</span>
                            <span className="tag cuisine-tag">{restaurant.cuisine}</span>
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
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);

    // Memoize featured restaurant
    const featuredRestaurant = useMemo(() => {
        return restaurants.find(r => r.isFeatured);
    }, [restaurants]);

    // Memoize filtered restaurants for search results only
    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
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

    // Handle click outside search results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setShowSearchResults(true);
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        setShowSearchResults(true);
    };

    const handleRestaurantClick = (restaurantId) => {
        window.location.href = `/restaurant/${restaurantId}`;
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
                    <form onSubmit={handleSearch} className="search-container" ref={searchRef}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search restaurants..."
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            className="search-input"
                            InputProps={{
                                endAdornment: (
                                    <IconButton type="submit" className="search-button">
                                        <SearchIcon />
                                    </IconButton>
                                ),
                            }}
                        />
                        {showSearchResults && searchQuery && (
                            <div className="search-results-dropdown">
                                {searchResults.length > 0 ? (
                                    searchResults.map(restaurant => (
                                        <div
                                            key={restaurant._id}
                                            className="search-result-item"
                                            onClick={() => handleRestaurantClick(restaurant._id)}
                                        >
                                            <img
                                                src={restaurant.imageUrl ? `http://localhost:5000${restaurant.imageUrl}` : defaultImageUrl}
                                                alt={restaurant.name}
                                                onError={handleImageError}
                                            />
                                            <div className="search-result-info">
                                                <h4>{restaurant.name}</h4>
                                                <p>{restaurant.cuisine}</p>
                                                <div className="search-result-rating">
                                                    <Rating value={restaurant.rating || 0} precision={0.5} readOnly size="small" />
                                                    <span>{restaurant.rating?.toFixed(1) || 'No ratings'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-results">No restaurants found</div>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <div className="wrapper2">
                <div className="featured-section">
                    <h2 className="featured-title">Featured Restaurant</h2>
                    {loading ? (
                        <FeaturedRestaurantSkeleton />
                    ) : featuredRestaurant ? (
                        <div 
                            className="featured-restaurant"
                            onClick={() => handleRestaurantClick(featuredRestaurant._id)}
                        >
                            <div className="featured-image">
                                <img 
                                    src={featuredRestaurant.imageUrl ? `http://localhost:5000${featuredRestaurant.imageUrl}` : defaultImageUrl}
                                    alt={featuredRestaurant.name}
                                    onError={handleImageError}
                                />
                            </div>
                            <div className="featured-info">
                                <h3 className="featured-name">{featuredRestaurant.name}</h3>
                                <div className="featured-rating">
                                    <Rating value={featuredRestaurant.rating || 0} precision={0.5} readOnly />
                                    <span className="rating-text">{featuredRestaurant.rating?.toFixed(1) || 'No ratings'}</span>
                                </div>
                                <div className="featured-details">
                                    <span className="featured-price">{featuredRestaurant.price}</span>
                                    <span className="featured-cuisine">{featuredRestaurant.cuisine}</span>
                                </div>
                                <p className="featured-address">{featuredRestaurant.address}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="no-featured">No featured restaurant available</p>
                    )}
                </div>

                <RestaurantGrid 
                    restaurants={restaurants.filter(r => !r.isFeatured)}
                    loading={loading}
                    handleImageError={handleImageError}
                    handleRestaurantClick={handleRestaurantClick}
                />
            </div>

            <div className="wrapper1">
                <div className="map-section">
                    <h2 className="map-title">Find Restaurants Near You</h2>
                    <Suspense fallback={<div className="map-loading">Loading map...</div>}>
                        <MapComponent restaurants={restaurants} onMapLoad={() => setMapLoaded(true)} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default Home; 