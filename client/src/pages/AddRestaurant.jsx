import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../styles/AddRestaurant.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component to handle map clicks
const LocationMarker = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
};

const AddRestaurant = () => {
    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        price: '',
        address: '',
        phone: '',
        email: '',
        description: '',
        openingHours: '',
        isFeatured: false,
        coordinates: null
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        return phoneRegex.test(phone);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleLocationSelect = (latlng) => {
        setFormData(prev => ({
            ...prev,
            coordinates: [latlng.lat, latlng.lng]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setError('');
        setIsLoading(true);

        try {
            if (!formData.name || !formData.cuisine || !formData.price || !formData.address || !formData.phone || !formData.coordinates) {
                throw new Error('Please fill in all required fields and select a location on the map');
            }

            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    if (key === 'coordinates') {
                        formDataToSend.append(key, JSON.stringify(formData[key]));
                    } else {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            });
            if (image) {
                formDataToSend.append('image', image);
            }

            const response = await fetch('http://localhost:5000/api/restaurants', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create restaurant');
            }

            navigate('/admin', { state: { activeTab: 'restaurants' } });
        } catch (err) {
            console.error('Error creating restaurant:', err);
            setError(err.message || 'An error occurred while creating the restaurant');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isAdmin) {
        return <div>Access denied. Admin privileges required.</div>;
    }

    return (
        <div className="add-restaurant-page">
            <div className="add-restaurant-container">
                <h1>Add New Restaurant</h1>

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
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
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
                            required
                            disabled={isLoading}
                            placeholder="Enter email"
                        />
                    </div>

                    <div className="form-group map-container">
                        <label>Location on Map *</label>
                        <div className="map-wrapper">
                            <MapContainer
                                center={[58.3913, 13.8452]} // Skövde coordinates
                                zoom={13}
                                style={{ height: '400px', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker onLocationSelect={handleLocationSelect} />
                                {formData.coordinates && (
                                    <Marker 
                                        position={formData.coordinates}
                                        icon={new L.Icon.Default()}
                                    />
                                )}
                            </MapContainer>
                        </div>
                        <p className="map-instructions">Click on the map to select the restaurant location</p>
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
                            placeholder="e.g., Mon-Fri: 11:00-22:00"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">Restaurant Image</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isLoading}
                        />
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                    </div>     

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Restaurant'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddRestaurant; 