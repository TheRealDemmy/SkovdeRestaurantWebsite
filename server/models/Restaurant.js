const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        postalCode: String,
        country: String
    },
    cuisine: {
        type: String,
        required: true
    },
    priceRange: {
        type: String,
        enum: ['$', '$$', '$$$', '$$$$'],
        required: true
    },
    openingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    contact: {
        phone: String,
        email: String,
        website: String
    },
    images: [{
        type: String  // URLs to images
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    features: [{
        type: String  // e.g., ['WiFi', 'Parking', 'Outdoor Seating']
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Restaurant', restaurantSchema); 