import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rating } from '@mui/material';
import '../styles/Profile.css';
import defaultImageUrl from '../assets/DefaultImage.jpg';

const ProfileSkeleton = () => (
    <div className="profile-info skeleton">
        <div className="profile-picture-section">
            <div className="profile-picture skeleton-image" />
        </div>

        <div className="info-group">
            <div className="skeleton-text" style={{ width: '100px', height: '20px' }} />
            <div className="skeleton-text" style={{ width: '200px', height: '24px' }} />
        </div>

        <div className="info-group">
            <div className="skeleton-text" style={{ width: '80px', height: '20px' }} />
            <div className="skeleton-text" style={{ width: '250px', height: '24px' }} />
        </div>

        <div className="info-group">
            <div className="skeleton-text" style={{ width: '120px', height: '20px' }} />
            <div className="skeleton-text" style={{ width: '100px', height: '24px' }} />
        </div>
    </div>
);

const ReviewCardSkeleton = () => (
    <div className="review-card skeleton">
        <div className="skeleton-text" style={{ width: '200px', height: '24px', marginBottom: '12px' }} />
        <div className="skeleton-text" style={{ width: '120px', height: '20px', marginBottom: '16px' }} />
        <div className="skeleton-text" style={{ width: '100%', height: '60px', marginBottom: '8px' }} />
        <div className="skeleton-text" style={{ width: '100px', height: '16px' }} />
    </div>
);

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser, isAdmin } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        profilePicture: null
    });
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');

    const isOwnProfile = currentUser && (!id || id === currentUser.id);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = id || currentUser.id;
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!userResponse.ok) throw new Error('User not found');
                const userData = await userResponse.json();
                setProfileUser(userData);

                const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!reviewsResponse.ok) throw new Error('Failed to fetch reviews');
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchUserData();
        }
    }, [id, currentUser]);

    const handleEditClick = () => {
        setEditData({
            username: profileUser.username,
            email: profileUser.email,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            profilePicture: null
        });
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setEditData({
                ...editData,
                profilePicture: file,
                profilePicturePreview: previewUrl
            });
        }
    };

    const handleImageError = (e) => {
        e.target.src = defaultImageUrl;
        e.target.onerror = null;
    };

    const getProfilePictureUrl = (profilePicture) => {
        if (!profilePicture) {
            return defaultImageUrl;
        }
        return `http://localhost:5000${profilePicture}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEditError('');
        setEditSuccess('');

        if (editData.newPassword) {
            if (editData.newPassword.length < 6) {
                setEditError('New password must be at least 6 characters long');
                return;
            }
            if (editData.newPassword !== editData.confirmPassword) {
                setEditError('New passwords do not match');
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const formData = new FormData();
            formData.append('username', editData.username);
            formData.append('email', editData.email);
            if (editData.newPassword) {
                formData.append('currentPassword', editData.currentPassword);
                formData.append('newPassword', editData.newPassword);
            }
            if (editData.profilePicture) {
                formData.append('profilePicture', editData.profilePicture);
            }

            const response = await fetch(`http://localhost:5000/api/users/${currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                throw new Error(data.message || 'Failed to update profile');
            }

            setEditSuccess('Profile updated successfully! Please check your email to confirm the changes.');
            setIsEditing(false);
            window.location.reload();
        } catch (err) {
            setEditError(err.message);
        }
    };

    if (!currentUser) {
        return <div className="profile-page">Please log in to view profiles.</div>;
    }

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <ProfileSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="profile-page">Error: {error}</div>;
    }

    if (!profileUser) {
        return <div className="profile-page">User not found</div>;
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 'No ratings';

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>{isOwnProfile ? 'My Profile' : `${profileUser.username}'s Profile`}</h1>
                    {isOwnProfile && !loading && (
                        <button onClick={handleEditClick} className="edit-button">
                            Edit
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="edit-form">
                        <div className="profile-picture-section">
                            <img 
                                src={editData.profilePicturePreview || getProfilePictureUrl(profileUser.profilePicture)}
                                alt="Profile" 
                                className="profile-picture"
                                onError={handleImageError}
                                crossOrigin="anonymous"
                            />
                            <div className="profile-picture-upload">
                                <label htmlFor="profile-picture-input" className="upload-button">
                                    Change Picture
                                </label>
                                <input
                                    id="profile-picture-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="profile-picture-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={editData.username}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={editData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={editData.currentPassword}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={editData.newPassword}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={editData.confirmPassword}
                                onChange={handleInputChange}
                            />
                        </div>

                        {editError && <div className="error-message">{editError}</div>}
                        {editSuccess && <div className="success-message">{editSuccess}</div>}

                        <div className="button-group">
                            <button type="submit" className="save-button">Save Changes</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-info">
                        <div className="profile-picture-section">
                            <img 
                                src={getProfilePictureUrl(profileUser.profilePicture)}
                                alt="Profile" 
                                className="profile-picture"
                                onError={handleImageError}
                                crossOrigin="anonymous"
                            />
                        </div>

                        <div className="info-group">
                            <label>Username</label>
                            <p>{profileUser.username}</p>
                        </div>

                        <div className="info-group">
                            <label>Email</label>
                            <p>{profileUser.email}</p>
                        </div>

                        {profileUser.isAdmin && (
                            <div className="info-group">
                                <label>Role</label>
                                <p>Admin</p>
                            </div>
                        )}

                        <div className="info-group">
                            <label>Member Since</label>
                            <p>{new Date(profileUser.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="info-group">
                            <label>Reviews</label>
                            <p>{reviews.length} reviews</p>
                        </div>

                        <div className="info-group">
                            <label>Average Rating</label>
                            <p>{averageRating}</p>
                        </div>
                    </div>
                )}

                <div className="reviews-section">
                    <h2>{isOwnProfile ? 'My Reviews' : `Reviews by ${profileUser.username}`}</h2>
                    {loading ? (
                        <div className="reviews-list">
                            {[...Array(3)].map((_, index) => (
                                <ReviewCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : reviews.length === 0 ? (
                        <p>{isOwnProfile ? "You haven't written any reviews yet." : `${profileUser.username} hasn't written any reviews yet.`}</p>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map(review => (
                                <div key={review._id} className="review-card">
                                    <div className="review-header">
                                        <div className="restaurant-info">
                                            <img 
                                                src={review.restaurant.imageUrl ? `http://localhost:5000${review.restaurant.imageUrl}` : defaultImageUrl}
                                                alt={review.restaurant.name}
                                                className="restaurant-image"
                                                onError={(e) => e.target.src = defaultImageUrl}
                                                crossOrigin="anonymous"
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile; 