import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Rating } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const MapComponent = ({ restaurants, onMapLoad }) => {
    // Memoize the markers to prevent unnecessary re-renders
    const markers = useMemo(() => {
        return restaurants.map(restaurant => {
            // Check if restaurant has coordinates
            if (!restaurant.coordinates || !Array.isArray(restaurant.coordinates) || restaurant.coordinates.length !== 2) {
                console.warn(`Restaurant ${restaurant.name} has no valid coordinates`);
                return null;
            }

            return (
                <Marker 
                    key={restaurant._id} 
                    position={restaurant.coordinates}
                    icon={new L.Icon.Default()}
                >
                    <Popup>
                        <div className="map-popup">
                            <h3>{restaurant.name}</h3>
                            <p>{restaurant.address}</p>
                            <div className="map-rating">
                                <Rating value={restaurant.rating || 0} precision={0.5} readOnly size="small" />
                                <span>{restaurant.rating?.toFixed(1) || 'No ratings'}</span>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            );
        }).filter(Boolean); // Remove null markers
    }, [restaurants]);

    useEffect(() => {
        onMapLoad();
    }, [onMapLoad]);

    // Calculate the center of the map based on restaurant coordinates
    const mapCenter = useMemo(() => {
        if (!restaurants.length) return [58.3915, 13.8452]; // Default to Skövde coordinates

        const validCoordinates = restaurants
            .filter(r => r.coordinates && Array.isArray(r.coordinates) && r.coordinates.length === 2)
            .map(r => r.coordinates);

        if (validCoordinates.length === 0) return [58.3915, 13.8452];

        const sum = validCoordinates.reduce((acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]], [0, 0]);
        return [sum[0] / validCoordinates.length, sum[1] / validCoordinates.length];
    }, [restaurants]);

    return (
        <div className="map-container">
            <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                attributionControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    maxZoom={19}
                    minZoom={3}
                />
                {markers}
            </MapContainer>
        </div>
    );
};

export default MapComponent; 