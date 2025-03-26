import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Rating } from '@mui/material';

const MapComponent = ({ restaurants, onMapLoad }) => {
    // Memoize the markers to prevent unnecessary re-renders
    const markers = useMemo(() => {
        return restaurants.map(restaurant => (
            <Marker 
                key={restaurant._id} 
                position={[58.3915, 13.8452]} // Using Skövde coordinates for now
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
        ));
    }, [restaurants]);

    useEffect(() => {
        onMapLoad();
    }, [onMapLoad]);

    return (
        <MapContainer
            center={[58.3915, 13.8452]} // Skövde coordinates
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false} // Disable zoom control to reduce initial load
            attributionControl={false} // Disable attribution control to reduce initial load
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
                minZoom={3}
            />
            {markers}
        </MapContainer>
    );
};

export default MapComponent; 