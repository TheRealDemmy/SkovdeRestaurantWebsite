import React, { useState, useEffect } from 'react';
import { Rating } from '@mui/material';
import { Box, TextField, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styles from '../styles/Restaurants.module.css';
import defaultImageUrl from '../assets/DefaultImage.jpg';

const RestaurantCard = ({ restaurant, handleImageError, handleRestaurantClick }) => (
    <div 
        className={styles.restaurantCard}
        onClick={() => handleRestaurantClick(restaurant._id)}
    >
        <div className={styles.restaurantImageContainer}>
            <img 
                src={restaurant.imageUrl ? `http://localhost:5000${restaurant.imageUrl}` : defaultImageUrl}
                alt={restaurant.name}
                onError={handleImageError}
                crossOrigin="anonymous"
            />
        </div>
        <div className={styles.restaurantInfo}>
            <h3 className={styles.restaurantName}>{restaurant.name}</h3>
            <div className={styles.restaurantRating}>
                <Rating value={restaurant.rating || 0} precision={0.5} readOnly size="small" />
                <span className={styles.ratingText}>{restaurant.rating?.toFixed(1) || 'No ratings'}</span>
            </div>
            <div className={styles.restaurantTags}>
                <span className={`${styles.tag} ${styles.priceTag}`}>{restaurant.price}</span>
                <span className={`${styles.tag} ${styles.cuisineTag}`}>{restaurant.cuisine}</span>
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
                if (!response.ok) throw new Error('Failed to fetch restaurants');
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

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleImageError = (e) => {
        e.target.src = defaultImageUrl;
    };

    const handleRestaurantClick = (restaurantId) => {
        window.location.href = `/restaurant/${restaurantId}`;
    };

    const filteredRestaurants = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedRestaurants = filteredRestaurants.slice(
        (page - 1) * restaurantsPerPage,
        page * restaurantsPerPage
    );

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.restaurantsPage}>
            <div className={styles.restaurantsContainer}>
                <h1>Our Restaurants</h1>
                
                <div className={styles.searchContainer}>
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
                    <div className={styles.noResults}>
                        <p>No restaurants found matching your search.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.restaurantsGrid}>
                            {paginatedRestaurants.map(restaurant => (
                                <RestaurantCard 
                                    key={restaurant._id}
                                    restaurant={restaurant}
                                    handleImageError={handleImageError}
                                    handleRestaurantClick={handleRestaurantClick}
                                />
                            ))}
                        </div>
                        {filteredRestaurants.length > restaurantsPerPage && (
                            <div className={styles.pagination}>
                                <Pagination 
                                    count={Math.ceil(filteredRestaurants.length / restaurantsPerPage)}
                                    page={page}
                                    onChange={(_, value) => setPage(value)}
                                    color="primary"
                                    size="large"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Restaurants; 