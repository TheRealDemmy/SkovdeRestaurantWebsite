import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rating, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/Restaurant.css';
import defaultImageUrl from '../assets/DefaultImage.jpg';

const Restaurant = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: ''
    });
    const [formError, setFormError] = useState(null);  // New state for form-specific errors

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/restaurants/${id}`);
                if (!response.ok) throw new Error('Restaurant not found');
                const data = await response.json();
                setRestaurant(data);
                
                const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/restaurant/${id}`);
                if (!reviewsResponse.ok) throw new Error('Failed to fetch reviews');
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantData();
    }, [id]);

    const handleImageError = (e) => {
        e.target.src = defaultImageUrl;
        e.target.onerror = null;
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setFormError('Please log in to submit a review');
            return;
        }

        // Validate rating
        if (newReview.rating === 0) {
            setFormError('Please select a rating before submitting your review');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    restaurantId: id,
                    userId: user._id,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit review');
            }

            // If successful, clear the form and fetch updated reviews
            setNewReview({ rating: 0, comment: '' });
            setFormError(null);
            
            const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/restaurant/${id}`);
            if (!reviewsResponse.ok) {
                console.error('Failed to fetch updated reviews');
                return;
            }
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData);
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!user.isAdmin) return;

        try {
            const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete review');
            }

            // If successful, fetch updated reviews
            setFormError(null);
            
            const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/restaurant/${id}`);
            if (!reviewsResponse.ok) {
                console.error('Failed to fetch updated reviews');
                return;
            }
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData);
        } catch (err) {
            setFormError(err.message);
        }
    };

    if (loading) return <div className="restaurant-page">Loading...</div>;
    if (!restaurant) return <div className="restaurant-page">Restaurant not found</div>;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 'No ratings yet';

    return (
        <div className="restaurant-page">
            <div className="restaurant-header">
                <img 
                    src={restaurant.imageUrl ? `http://localhost:5000${restaurant.imageUrl}` : defaultImageUrl} 
                    alt={restaurant.name}
                    className="restaurant-image"
                    onError={handleImageError}
                    crossOrigin="anonymous"
                />
                <div className="restaurant-info">
                    <h1>{restaurant.name}</h1>
                    <p className="cuisine">{restaurant.cuisine}</p>
                    <p className="address">{restaurant.address}</p>
                    <div className="rating-summary">
                        <Rating value={Number(averageRating)} readOnly precision={0.5} />
                        <span>({reviews.length} reviews)</span>
                    </div>
                    <p className="description">{restaurant.description}</p>
                </div>
            </div>

            {isAuthenticated && (
                <div className="review-form-container">
                    <h2>Write a Review</h2>
                    <form onSubmit={handleReviewSubmit} className="review-form">
                        <div className="rating-input">
                            <Rating
                                value={newReview.rating}
                                onChange={(_, value) => {
                                    setNewReview({ ...newReview, rating: value });
                                    setFormError(null); // Clear error when rating is selected
                                }}
                                precision={0.5}
                            />
                            {formError && formError.includes('rating') && (
                                <p className="rating-error">Please select a rating</p>
                            )}
                        </div>
                        <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Share your experience..."
                            required
                        />
                        {formError && !formError.includes('rating') && (
                            <p className="form-error">{formError}</p>
                        )}
                        <button type="submit" className="submit-review">Submit Review</button>
                    </form>
                </div>
            )}

            <div className="reviews-section">
                <h2>Reviews</h2>
                {reviews.length > 0 ? (
                    <div className="reviews-list">
                        {reviews.map((review) => (
                            <div key={review._id} className="review-card">
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <img 
                                            src={review.user.profilePicture ? `http://localhost:5000${review.user.profilePicture}` : defaultImageUrl} 
                                            alt={review.user.username}
                                            className="reviewer-image"
                                            onError={handleImageError}
                                            crossOrigin="anonymous"
                                        />
                                        <Link to={`/profile/${review.user._id}`} className="reviewer-name">
                                            {review.user.username}
                                        </Link>
                                    </div>
                                    <div className="review-actions">
                                        <Rating value={review.rating} readOnly precision={0.5} />
                                        {user.isAdmin && (
                                            <IconButton 
                                                onClick={() => handleDeleteReview(review._id)}
                                                className="delete-review-button"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </div>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                                <span className="review-date">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-reviews">No reviews yet. Be the first to review!</p>
                )}
            </div>
        </div>
    );
};

export default Restaurant; 