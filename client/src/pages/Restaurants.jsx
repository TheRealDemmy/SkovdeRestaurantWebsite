import React, { useState, useEffect } from 'react';
import { Rating } from '@mui/material';
import { Box, TextField, IconButton, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import '../styles/Restaurants.css';
import defaultImageUrl from '../assets/DefaultImage.jpg';

const RestaurantCard = ({ restaurant, handleImageError, handleRestaurantClick }) => (
    <div 
        className="restaurant-card"
        onClick={() => handleRestaurantClick(restaurant._id)}
    >
        <div className="restaurant-image-container">
            <img 
                src={restaurant.imageUrl ? `http://localhost:5000${restaurant.imageUrl}` : defaultImageUrl}
                alt={restaurant.name}
                onError={handleImageError}
                crossOrigin="anonymous"
            />
        </div>
        <div className="restaurant-info">
            <h3 className="restaurant-name">{restaurant.name}</h3>
            <div className="restaurant-rating">
                <Rating value={restaurant.rating || 0} precision={0.5} readOnly size="small" />
                <span className="rating-text">{restaurant.rating?.toFixed(1) || 'No ratings'}</span>
            </div>
            <div className="restaurant-tags">
                <span className="tag price-tag">{restaurant.price}</span>
                <span className="tag cuisine-tag">{restaurant.cuisine}</span>
            </div>
        </div>
    </div>
);

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const restaurantsPerPage = 9;

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/restaurants');
                if (!response.ok) {
                    throw new Error('Failed to fetch restaurants');
                }
                const data = await response.json();
                setRestaurants(data);
                setTotalPages(Math.ceil(data.length / restaurantsPerPage));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
        setPage(1); // Reset to first page when searching
    };

    const filteredRestaurants = restaurants.filter(restaurant => {
        const searchLower = searchQuery.toLowerCase();
        return (
            restaurant.name.toLowerCase().includes(searchLower) ||
            restaurant.cuisine.toLowerCase().includes(searchLower)
        );
    });

    const paginatedRestaurants = filteredRestaurants.slice(
        (page - 1) * restaurantsPerPage,
        page * restaurantsPerPage
    );

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleRestaurantClick = (restaurantId) => {
        window.location.href = `/restaurant/${restaurantId}`;
    };

    const handleImageError = (e) => {
        e.target.src = defaultImageUrl;
        e.target.onerror = null;
    };

    if (loading) {
        return <div className="restaurants-page">Loading...</div>;
    }

    if (error) {
        return <div className="restaurants-page">Error: {error}</div>;
    }

    return (
        <div className="restaurants-page">
            <div className="restaurants-container">
                <h1>Our Restaurants</h1>
                
                <div className="search-container">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', maxWidth: 500 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search by name or cuisine..."
                            value={searchQuery}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                        />
                    </Box>
                </div>

                {filteredRestaurants.length === 0 ? (
                    <div className="no-results">
                        <p>No restaurants found matching your search.</p>
                    </div>
                ) : (
                    <>
                        <div className="restaurants-grid">
                            {filteredRestaurants.map(restaurant => (
                                <RestaurantCard 
                                    key={restaurant._id}
                                    restaurant={restaurant}
                                    handleImageError={handleImageError}
                                    handleRestaurantClick={handleRestaurantClick}
                                />
                            ))}
                        </div>

                        <div className="pagination-container">
                            <Pagination
                                count={Math.ceil(filteredRestaurants.length / restaurantsPerPage)}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Restaurants; 