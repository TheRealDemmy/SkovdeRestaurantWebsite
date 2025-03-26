import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.css';

const Admin = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'users');
    const [users, setUsers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin, activeTab]);

    // Clear the location state after using it
    useEffect(() => {
        if (location.state?.activeTab) {
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('token');

        try {
            if (activeTab === 'users') {
                const response = await fetch('http://localhost:5000/api/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
                setUsers(data);
            } else {
                const response = await fetch('http://localhost:5000/api/restaurants', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to fetch restaurants');
                setRestaurants(data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        const token = localStorage.getItem('token');
        const endpoint = activeTab === 'users' ? 'users' : 'restaurants';

        try {
            const response = await fetch(`http://localhost:5000/api/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete item');
            }

            // Refresh data after deletion
            fetchData();
        } catch (err) {
            console.error('Error deleting item:', err);
            setError(err.message || 'An error occurred while deleting the item');
        }
    };

    const handleEditUser = (userId) => {
        navigate(`/admin/users/edit/${userId}`, { state: { returnTab: 'users' } });
    };

    const handleEditRestaurant = (restaurantId) => {
        navigate(`/admin/restaurants/edit/${restaurantId}`, { state: { returnTab: 'restaurants' } });
    };

    const handleAdd = () => {
        if (activeTab === 'users') {
            navigate('/admin/users/add');
        } else {
            navigate('/admin/restaurants/add');
        }
    };

    const handleFeature = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/restaurants/${id}/feature`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to feature restaurant');
            }

            // Refresh data
            fetchData();
        } catch (err) {
            console.error('Error featuring restaurant:', err);
            setError(err.message || 'An error occurred while featuring the restaurant');
        }
    };

    const handlePromote = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/users/${id}/promote`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to promote user');
            }

            // Refresh data
            fetchData();
        } catch (err) {
            console.error('Error promoting user:', err);
            setError(err.message || 'An error occurred while promoting the user');
        }
    };

    if (!isAdmin) {
        return <div>Access denied. Admin privileges required.</div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <div className="admin-tabs">
                    <button
                        className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'restaurants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('restaurants')}
                    >
                        Restaurants
                    </button>
                </div>

                <button className="add-button" onClick={handleAdd}>
                    Add {activeTab === 'users' ? 'User' : 'Restaurant'}
                </button>

                {error && <div className="error-message">{error}</div>}

                {isLoading ? (
                    <div className="loading">Loading...</div>
                ) : activeTab === 'users' ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Reviews</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                                    <td>{user.reviews?.length || 0}</td>
                                    <td>
                                        <button
                                            className="action-button edit-button"
                                            onClick={() => handleEditUser(user._id)}
                                        >
                                            Edit
                                        </button>
                                        {!user.isAdmin && (
                                            <button
                                                className="action-button promote-button"
                                                onClick={() => handlePromote(user._id)}
                                            >
                                                Promote
                                            </button>
                                        )}
                                        <button
                                            className="action-button view-button"
                                            onClick={() => navigate(`/profile/${user._id}`)}
                                        >
                                            Profile
                                        </button>
                                        <button
                                            className="action-button delete-button"
                                            onClick={() => handleDelete(user._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Cuisine</th>
                                <th>Price</th>
                                <th>Address</th>
                                <th>Rating</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {restaurants.map(restaurant => (
                                <tr key={restaurant._id}>
                                    <td>{restaurant.name}</td>
                                    <td>{restaurant.cuisine}</td>
                                    <td>{restaurant.price}</td>
                                    <td>{restaurant.address}</td>
                                    <td>{restaurant.rating?.toFixed(1) || 'N/A'}</td>
                                    <td>{restaurant.isFeatured ? 'Yes' : 'No'}</td>
                                    <td>
                                        <button
                                            className="action-button edit-button"
                                            onClick={() => handleEditRestaurant(restaurant._id)}
                                        >
                                            Edit
                                        </button>
                                        {!restaurant.isFeatured && (
                                            <button
                                                className="action-button feature-button"
                                                onClick={() => handleFeature(restaurant._id)}
                                            >
                                                Feature
                                            </button>
                                        )}
                                        <button
                                            className="action-button view-button"
                                            onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                                        >
                                            View
                                        </button>
                                        <button
                                            className="action-button delete-button"
                                            onClick={() => handleDelete(restaurant._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Admin; 