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
    cuisine: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
    },
    openingHours: {
        type: String,
        default: null
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    imageUrl: {
        type: String,
        default: '/DefaultImage.jpg'
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for featured restaurants
restaurantSchema.index({ isFeatured: 1 });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant; 