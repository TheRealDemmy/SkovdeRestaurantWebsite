import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AddUser.css';

const EditUser = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        isAdmin: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdmin } = useAuth();
    const { id } = useParams();
    const returnTab = location.state?.returnTab || 'users';

    useEffect(() => {
        if (isAdmin) {
            fetchUser();
        }
    }, [isAdmin, id]);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch user');
            
            setFormData({
                username: data.username,
                email: data.email,
                isAdmin: data.isAdmin
            });
        } catch (err) {
            console.error('Error fetching user:', err);
            setError(err.message || 'An error occurred while fetching user data');
        } finally {
            setIsLoading(false);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateUsername = (username) => {
        return username.length >= 3;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setError('');
        setIsLoading(true);

        try {
            if (!formData.username || !formData.email) {
                throw new Error('Please fill in all required fields');
            }

            if (!validateEmail(formData.email)) {
                throw new Error('Please enter a valid email address');
            }

            if (!validateUsername(formData.username)) {
                throw new Error('Username must be at least 3 characters long');
            }

            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const response = await fetch(`http://localhost:5000/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    isAdmin: formData.isAdmin
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user');
            }

            // Navigate back to admin page with correct tab
            navigate('/admin', { state: { activeTab: returnTab } });
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err.message || 'An error occurred while updating the user');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAdmin) {
        return <div>Access denied. Admin privileges required.</div>;
    }

    if (isLoading && !error) {
        return <div>Loading...</div>;
    }

    return (
        <div className="add-user-page">
            <div className="add-user-container">
                <h1>Edit User</h1>

                <form onSubmit={handleSubmit} className="add-user-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            placeholder="Enter username"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            placeholder="Enter email"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="isAdmin"
                                checked={formData.isAdmin}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            Make this user an admin
                        </label>
                    </div>

                    {error && (
                        <div className="error-message shake">
                            {error}
                        </div>
                    )}

                    <div className="button-group">
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating User...' : 'Update User'}
                        </button>
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={() => navigate('/admin')}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser; 