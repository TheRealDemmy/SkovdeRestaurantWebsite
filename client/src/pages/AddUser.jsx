import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AddUser.css';

const AddUser = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        isAdmin: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
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
            if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
                throw new Error('Please fill in all fields');
            }

            if (!validateEmail(formData.email)) {
                throw new Error('Please enter a valid email address');
            }

            if (!validateUsername(formData.username)) {
                throw new Error('Username must be at least 3 characters long');
            }

            if (!validatePassword(formData.password)) {
                throw new Error('Password must be at least 6 characters long');
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const response = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    isAdmin: formData.isAdmin
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create user');
            }

            // Clear form
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                isAdmin: false
            });

            // Redirect back to admin page
            navigate('/admin');
        } catch (err) {
            console.error('Error creating user:', err);
            setError(err.message || 'An error occurred while creating the user');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAdmin) {
        return <div>Access denied. Admin privileges required.</div>;
    }

    return (
        <div className="add-user-page">
            <div className="add-user-container">
                <h1>Add New User</h1>

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
                            placeholder="Choose a username"
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

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            placeholder="Enter password"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            placeholder="Confirm password"
                            autoComplete="new-password"
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
                            {isLoading ? 'Creating User...' : 'Create User'}
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

export default AddUser; 