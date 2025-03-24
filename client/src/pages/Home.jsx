import React, { useState } from 'react';
import { Box, TextField, IconButton, Rating } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../styles/Home.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const restaurants = [
        { 
            name: "Sushi Master", 
            rating: 4.8, 
            image: "/src/assets/SushiMaster.jpg",
            location: [58.3915, 13.8452],
            address: "Storgatan 123, Skövde"
        },
        { 
            name: "Pizza Express", 
            rating: 4.2, 
            image: "/src/assets/PizzaExpress.jpg",
            location: [58.3920, 13.8460],
            address: "Kungsgatan 45, Skövde"
        },
        { 
            name: "Thai Delight", 
            rating: 4.6, 
            image: "/src/assets/ThaiDelight.jpg",
            location: [58.3905, 13.8445],
            address: "Drottninggatan 67, Skövde"
        },
        { 
            name: "Burger House", 
            rating: 4.3, 
            image: "/src/assets/BurgerHouse.jpg",
            location: [58.3930, 13.8470],
            address: "Västra Torggatan 89, Skövde"
        },
        { 
            name: "Mediterranean", 
            rating: 4.7, 
            image: "/src/assets/Mediterranean.jpg",
            location: [58.3910, 13.8465],
            address: "Östra Torggatan 34, Skövde"
        },
        { 
            name: "Café Corner", 
            rating: 4.4, 
            image: "/src/assets/CafeCorner.jpg",
            location: [58.3925, 13.8455],
            address: "Kyrkogatan 12, Skövde"
        }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        // Handle search functionality
        console.log('Searching for:', searchQuery);
    };

    return (
        <div className="home-page">
            <div className="wrapper1">
                <div className="initial-home-container">
                    <h1 className="welcome-title">Welcome to Elin's Longhouse</h1>
                    <p className="welcome-text">
                        Discover the best restaurants in Skövde. From cozy cafes to fine dining, 
                        find your perfect spot for any occasion.
                    </p>
                    <div className="search-container">
                        <TextField
                            className="search-input"
                            placeholder="Search for restaurants..."
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <IconButton className="search-button" onClick={handleSearch}>
                                        <SearchIcon />
                                    </IconButton>
                                ),
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="wrapper2">
                <div className="featured-section">
                    <h2 className="featured-title">Featured</h2>
                    <div className="featured-restaurant">
                        <div className="restaurant-image">
                            <img src="/src/assets/BombayMasala.jpg" alt="Bombay Masala" />
                        </div>
                        <div className="restaurant-info">
                            <h3 className="restaurant-name">Bombay Masala</h3>
                            <div className="restaurant-rating">
                                <Rating value={4.5} precision={0.5} readOnly />
                                <span className="rating-text">4.5</span>
                            </div>
                            <p className="restaurant-description">
                                Experience authentic Indian cuisine in the heart of Skövde. 
                                Our chefs prepare traditional dishes using the finest ingredients 
                                and time-honored cooking methods.
                            </p>
                            <div className="restaurant-tags">
                                <span className="restaurant-tag">$$ (Medium)</span>
                                <span className="restaurant-tag">Indian Cuisine</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="wrapper1">
                <div className="restaurant-grid">
                    {restaurants.map((restaurant, index) => (
                        <div key={index} className="restaurant-box">
                            <img src={restaurant.image} alt={restaurant.name} />
                            <div className="restaurant-box-overlay">
                                <h3 className="restaurant-box-name">{restaurant.name}</h3>
                                <div className="restaurant-box-rating">
                                    <Rating value={restaurant.rating} precision={0.5} readOnly size="small" />
                                    <span className="rating-text">{restaurant.rating}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="wrapper2">
                <div className="map-section">
                    <h2 className="map-title">Find Restaurants Near You</h2>
                    <div className="map-container">
                        <MapContainer
                            center={[58.3915, 13.8452]}
                            zoom={14}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {restaurants.map((restaurant, index) => (
                                <Marker key={index} position={restaurant.location}>
                                    <Popup>
                                        <div className="map-popup">
                                            <h3>{restaurant.name}</h3>
                                            <p>{restaurant.address}</p>
                                            <div className="map-rating">
                                                <Rating value={restaurant.rating} precision={0.5} readOnly size="small" />
                                                <span>{restaurant.rating}</span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 