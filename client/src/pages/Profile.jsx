import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
    const { user, isAdmin } = useAuth();
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

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch(`http://localhost:5000/api/reviews/user/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Authentication failed. Please log in again.');
                    }
                    throw new Error('Failed to fetch reviews');
                }

                const data = await response.json();
                setReviews(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchReviews();
        }
    }, [user]);

    const handleEditClick = () => {
        setEditData({
            username: user.username,
            email: user.email,
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
            // Create a preview URL for the selected image
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEditError('');
        setEditSuccess('');

        // Validate password if trying to change it
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

            const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
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
        } catch (err) {
            setEditError(err.message);
        }
    };

    if (!user) {
        return <div className="profile-page">Please log in to view your profile.</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    {!loading && (
                        <button onClick={handleEditClick} className="edit-button">
                            Edit
                        </button>
                    )}
                </div>

                {loading ? (
                    <ProfileSkeleton />
                ) : isEditing ? (
                    <form onSubmit={handleSubmit} className="edit-form">
                        <div className="profile-picture-section">
                            <img 
                                src={editData.profilePicturePreview || (user.profilePicture ? `http://localhost:5000${user.profilePicture}` : defaultImageUrl)}
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
                                src={user.profilePicture ? `http://localhost:5000${user.profilePicture}` : defaultImageUrl}
                                alt="Profile" 
                                className="profile-picture"
                                onError={handleImageError}
                                crossOrigin="anonymous"
                            />
                        </div>

                        <div className="info-group">
                            <label>Username</label>
                            <p>{user.username}</p>
                        </div>

                        <div className="info-group">
                            <label>Email</label>
                            <p>{user.email}</p>
                        </div>

                        {isAdmin && (
                            <div className="info-group">
                                <label>Role</label>
                                <p>Admin</p>
                            </div>
                        )}

                        <div className="info-group">
                            <label>Reviews</label>
                            <p>{reviews.length} reviews</p>
                        </div>
                    </div>
                )}

                <div className="reviews-section">
                    <h2>My Reviews</h2>
                    {loading ? (
                        <div className="reviews-list">
                            {[...Array(3)].map((_, index) => (
                                <ReviewCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : reviews.length === 0 ? (
                        <p>You haven't written any reviews yet.</p>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map(review => (
                                <div key={review._id} className="review-card">
                                    <h3>{review.restaurant.name}</h3>
                                    <div className="rating">
                                        {[...Array(5)].map((_, index) => (
                                            <span key={index} className={`star ${index < review.rating ? 'filled' : ''}`}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p>{review.text}</p>
                                    <small>{new Date(review.createdAt).toLocaleDateString()}</small>
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