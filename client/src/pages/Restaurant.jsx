import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rating } from '@mui/material';
import '../styles/Restaurant.css';

const Restaurant = () => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: ''
    });

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
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantData();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setError('Please log in to submit a review');
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
                    userId: user.id,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (!response.ok) throw new Error('Failed to submit review');

            const newReviewData = await response.json();
            setReviews([...reviews, newReviewData]);
            setNewReview({ rating: 0, comment: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="restaurant-page">Loading...</div>;
    if (error) return <div className="restaurant-page">Error: {error}</div>;
    if (!restaurant) return <div className="restaurant-page">Restaurant not found</div>;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 'No ratings yet';

    return (
        <div className="restaurant-page">
            <div className="restaurant-header">
                <img 
                    src={restaurant.imageUrl || '/DefaultImage.jpg'} 
                    alt={restaurant.name}
                    className="restaurant-image"
                    onError={(e) => e.target.src = '/DefaultImage.jpg'}
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
                                onChange={(_, value) => setNewReview({ ...newReview, rating: value })}
                                precision={0.5}
                            />
                        </div>
                        <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Share your experience..."
                            required
                        />
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
                                            src={review.user.profilePicture || '/DefaultImage.jpg'} 
                                            alt={review.user.username}
                                            className="reviewer-image"
                                            onError={(e) => e.target.src = '/DefaultImage.jpg'}
                                        />
                                        <span className="reviewer-name">{review.user.username}</span>
                                    </div>
                                    <Rating value={review.rating} readOnly precision={0.5} />
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