import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rating, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from '../styles/RestaurantProfile.module.css';
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
    const [formError, setFormError] = useState(null);

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

    if (loading) return <div className={styles.restaurantPage}>Loading...</div>;
    if (!restaurant) return <div className={styles.restaurantPage}>Restaurant not found</div>;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 'No ratings yet';

    return (
        <div className={styles.restaurantPage}>
            <div className={styles.restaurantHeader}>
                <img 
                    src={restaurant.imageUrl ? `http://localhost:5000${restaurant.imageUrl}` : defaultImageUrl} 
                    alt={restaurant.name}
                    className={styles.restaurantImage}
                    onError={handleImageError}
                    crossOrigin="anonymous"
                />
                <div className={styles.restaurantInfo}>
                    <h1>{restaurant.name}</h1>
                    <p className={styles.cuisine}>{restaurant.cuisine}</p>
                    <p className={styles.address}>{restaurant.address}</p>
                    <div className={styles.ratingSummary}>
                        <Rating value={Number(averageRating)} readOnly precision={0.5} />
                        <span>({reviews.length} reviews)</span>
                    </div>
                    <p className={styles.description}>{restaurant.description}</p>
                </div>
            </div>

            {isAuthenticated && (
                <div className={styles.reviewFormContainer}>
                    <h2>Write a Review</h2>
                    <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                        <div className={styles.ratingInput}>
                            <Rating
                                value={newReview.rating}
                                onChange={(_, value) => {
                                    setNewReview({ ...newReview, rating: value });
                                    setFormError(null);
                                }}
                                precision={0.5}
                            />
                            {formError && formError.includes('rating') && (
                                <p className={styles.ratingError}>Please select a rating</p>
                            )}
                        </div>
                        <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Share your experience..."
                            required
                        />
                        {formError && !formError.includes('rating') && (
                            <p className={styles.formError}>{formError}</p>
                        )}
                        <button type="submit" className={styles.submitReview}>Submit Review</button>
                    </form>
                </div>
            )}

            <div className={styles.reviewsSection}>
                <h2>Reviews</h2>
                {reviews.length > 0 ? (
                    <div className={styles.reviewsList}>
                        {reviews.map((review) => (
                            <div key={review._id} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <div className={styles.reviewerInfo}>
                                        <img 
                                            src={review.user.profilePicture ? `http://localhost:5000${review.user.profilePicture}` : defaultImageUrl} 
                                            alt={review.user.username}
                                            className={styles.reviewerImage}
                                            onError={handleImageError}
                                            crossOrigin="anonymous"
                                        />
                                        <Link to={`/profile/${review.user._id}`} className={styles.reviewerName}>
                                            {review.user.username}
                                        </Link>
                                    </div>
                                    <div className={styles.reviewActions}>
                                        <Rating value={review.rating} readOnly precision={0.5} />
                                        {user.isAdmin && (
                                            <IconButton 
                                                onClick={() => handleDeleteReview(review._id)}
                                                className={styles.deleteReviewButton}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </div>
                                </div>
                                <p className={styles.reviewComment}>{review.comment}</p>
                                <span className={styles.reviewDate}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noReviews}>No reviews yet. Be the first to review!</p>
                )}
            </div>
        </div>
    );
};

export default Restaurant; 