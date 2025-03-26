import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AddRestaurant.css';

const EditRestaurant = () => {
    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        price: '',
        address: '',
        phone: '',
        email: '',
        description: '',
        openingHours: '',
        isFeatured: false
    });
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdmin } = useAuth();
    const { id } = useParams();
    const returnTab = location.state?.returnTab || 'restaurants';

    useEffect(() => {
        if (isAdmin) {
            fetchRestaurant();
        }
    }, [isAdmin, id]);

    const fetchRestaurant = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/restaurants/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch restaurant');
            
            setFormData({
                name: data.name,
                cuisine: data.cuisine,
                price: data.price,
                address: data.address,
                phone: data.phone || '',
                email: data.email || '',
                description: data.description || '',
                openingHours: data.openingHours || '',
                isFeatured: data.isFeatured
            });
            if (data.image) {
                setPreviewUrl(`http://localhost:5000${data.image}`);
            }
        } catch (err) {
            console.error('Error fetching restaurant:', err);
            setError(err.message || 'An error occurred while fetching restaurant data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image size should be less than 5MB');
                return;
            }
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                setError('Only JPEG, JPG and PNG images are allowed');
                return;
            }
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
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
            if (!formData.name || !formData.cuisine || !formData.price || !formData.address) {
                throw new Error('Please fill in all required fields (Name, Cuisine Type, Price Range, and Address)');
            }

            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });
            if (image) {
                formDataToSend.append('image', image);
            }

            const response = await fetch(`http://localhost:5000/api/restaurants/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update restaurant');
            }

            // Navigate back to admin page with correct tab
            navigate('/admin', { state: { activeTab: returnTab } });
        } catch (err) {
            console.error('Error updating restaurant:', err);
            setError(err.message || 'An error occurred while updating the restaurant');
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
        <div className="add-restaurant-page">
            <div className="add-restaurant-container">
                <h1>Edit Restaurant</h1>

                <form onSubmit={handleSubmit} className="add-restaurant-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="name">Restaurant Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            placeholder="Enter restaurant name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cuisine">Cuisine Type *</label>
                        <input
                            type="text"
                            id="cuisine"
                            name="cuisine"
                            value={formData.cuisine}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            placeholder="Enter cuisine type"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">Price Range *</label>
                        <select
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        >
                            <option value="">Select price range</option>
                            <option value="$">$ (Budget)</option>
                            <option value="$$">$$ (Moderate)</option>
                            <option value="$$$">$$$ (Expensive)</option>
                            <option value="$$$$">$$$$ (Luxury)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address *</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            placeholder="Enter restaurant address"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Enter phone number"
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
                            disabled={isLoading}
                            placeholder="Enter email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Enter restaurant description"
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="openingHours">Opening Hours</label>
                        <input
                            type="text"
                            id="openingHours"
                            name="openingHours"
                            value={formData.openingHours}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="e.g., Mon-Fri: 9:00 AM - 10:00 PM"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">Restaurant Image</label>
                        <div className="image-upload-container">
                            {previewUrl && (
                                <div className="image-preview">
                                    <img src={previewUrl} alt="Restaurant preview" />
                                </div>
                            )}
                            <input
                                type="file"
                                id="image"
                                name="image"
                                onChange={handleImageChange}
                                disabled={isLoading}
                                accept="image/jpeg,image/jpg,image/png"
                            />
                            <small>Max size: 5MB. Allowed formats: JPEG, JPG, PNG</small>
                        </div>
                    </div>

                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            Feature this restaurant
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
                            {isLoading ? 'Updating Restaurant...' : 'Update Restaurant'}
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

export default EditRestaurant; 