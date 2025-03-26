const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a user can only review a restaurant once
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
reviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 