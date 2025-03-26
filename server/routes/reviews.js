const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'username profilePicture')
            .populate('restaurant', 'name cuisine imageUrl');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reviews for a specific restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const reviews = await Review.find({ restaurant: req.params.restaurantId })
            .populate('user', 'username profilePicture')
            .populate('restaurant', 'name cuisine imageUrl');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reviews by a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.params.userId })
            .populate('user', 'username profilePicture')
            .populate('restaurant', 'name cuisine imageUrl');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new review
router.post('/', verifyToken, async (req, res) => {
    try {
        const { restaurantId, rating, comment } = req.body;

        // Verify restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check if user has already reviewed this restaurant
        const existingReview = await Review.findOne({
            user: req.userId,
            restaurant: restaurantId
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this restaurant' });
        }

        const review = new Review({
            user: req.userId,
            restaurant: restaurantId,
            rating,
            comment
        });

        const savedReview = await review.save();

        // Update restaurant's average rating
        const allReviews = await Review.find({ restaurant: restaurantId });
        const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
        restaurant.rating = averageRating;
        await restaurant.save();

        // Add review to user's reviews
        await User.findByIdAndUpdate(req.userId, {
            $push: { reviews: savedReview._id }
        });

        // Populate user and restaurant details
        const populatedReview = await Review.findById(savedReview._id)
            .populate('user', 'username profilePicture')
            .populate('restaurant', 'name cuisine imageUrl');

        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a review
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Verify user owns the review
        if (review.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        const { rating, comment } = req.body;
        review.rating = rating;
        review.comment = comment;
        review.updatedAt = Date.now();

        const updatedReview = await review.save();

        // Update restaurant's average rating
        const restaurant = await Restaurant.findById(review.restaurant);
        const allReviews = await Review.find({ restaurant: review.restaurant });
        const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
        restaurant.rating = averageRating;
        await restaurant.save();

        // Populate user and restaurant details
        const populatedReview = await Review.findById(updatedReview._id)
            .populate('user', 'username profilePicture')
            .populate('restaurant', 'name cuisine imageUrl');

        res.json(populatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a review
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Verify user owns the review or is admin
        const user = await User.findById(req.userId);
        if (review.user.toString() !== req.userId && !user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await Review.deleteOne({ _id: review._id });

        // Update restaurant's average rating
        const restaurant = await Restaurant.findById(review.restaurant);
        const allReviews = await Review.find({ restaurant: review.restaurant });
        const averageRating = allReviews.length > 0
            ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length
            : 0;
        restaurant.rating = averageRating;
        await restaurant.save();

        // Remove review from user's reviews array
        await User.findByIdAndUpdate(review.user, {
            $pull: { reviews: review._id }
        });

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 