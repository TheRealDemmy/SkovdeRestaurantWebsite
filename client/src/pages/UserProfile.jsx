import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Rating } from '@mui/material';
import '../styles/UserProfile.css';

const UserProfile = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await fetch(`http://localhost:5000/api/users/${id}`);
                if (!userResponse.ok) throw new Error('User not found');
                const userData = await userResponse.json();
                setUser(userData);

                const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/user/${id}`);
                if (!reviewsResponse.ok) throw new Error('Failed to fetch reviews');
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    if (loading) return <div className="user-profile-page">Loading...</div>;
    if (error) return <div className="user-profile-page">Error: {error}</div>;
    if (!user) return <div className="user-profile-page">User not found</div>;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 'No ratings';

    return (
        <div className="user-profile-page">
            <div className="profile-header">
                <img 
                    src={user.profilePicture || '/DefaultImage.jpg'} 
                    alt={user.username}
                    className="profile-picture"
                    onError={(e) => e.target.src = '/DefaultImage.jpg'}
                />
                <div className="profile-info">
                    <h1>{user.username}</h1>
                    <p className="member-since">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                    <div className="review-stats">
                        <div className="stat">
                            <span className="stat-value">{reviews.length}</span>
                            <span className="stat-label">Reviews</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{averageRating}</span>
                            <span className="stat-label">Avg Rating</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="reviews-section">
                <h2>Reviews by {user.username}</h2>
                {reviews.length > 0 ? (
                    <div className="reviews-list">
                        {reviews.map((review) => (
                            <div key={review._id} className="review-card">
                                <div className="review-header">
                                    <div className="restaurant-info">
                                        <img 
                                            src={review.restaurant.imageUrl || '/DefaultImage.jpg'} 
                                            alt={review.restaurant.name}
                                            className="restaurant-image"
                                            onError={(e) => e.target.src = '/DefaultImage.jpg'}
                                        />
                                        <div>
                                            <h3>{review.restaurant.name}</h3>
                                            <p className="cuisine">{review.restaurant.cuisine}</p>
                                        </div>
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
                    <p className="no-reviews">{user.username} hasn't written any reviews yet.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile; 