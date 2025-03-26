const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/restaurants/');  // Add ./ to make it relative to project root
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

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

// Middleware to verify admin status
const verifyAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;

        const user = await User.findById(decoded.userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token or insufficient privileges.' });
    }
};

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.query.featured === 'true') {
            query.isFeatured = true;
        }
        
        const restaurants = await Restaurant.find(query)
            .sort({ createdAt: -1 });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single restaurant
router.get('/:id', async (req, res) => {
    try {
        console.log(`Attempting to fetch restaurant with id: ${req.params.id}`);
        const restaurant = await Restaurant.findById(req.params.id);
        if (restaurant) {
            console.log('Restaurant found:', restaurant.name);
            res.json(restaurant);
        } else {
            console.log('Restaurant not found');
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new restaurant (admin only)
router.post('/', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const restaurantData = {
            name: req.body.name,
            description: req.body.description,
            cuisine: req.body.cuisine,
            price: req.body.price,
            address: req.body.address,
            phone: req.body.phone,
            email: req.body.email || null,
            openingHours: req.body.openingHours || null,
            isFeatured: req.body.isFeatured === 'true'
        };

        // Only set imageUrl if an image was uploaded
        if (req.file) {
            restaurantData.imageUrl = `/uploads/restaurants/${req.file.filename}`;
        }

        const restaurant = new Restaurant(restaurantData);
        const newRestaurant = await restaurant.save();
        
        console.log('Restaurant created successfully:', newRestaurant.name);
        res.status(201).json(newRestaurant);
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update a restaurant (admin only)
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const updates = { ...req.body };
        
        // Only update imageUrl if a new image was uploaded
        if (req.file) {
            updates.imageUrl = `/uploads/restaurants/${req.file.filename}`;
        }

        // Convert isFeatured string to boolean if it exists
        if (updates.isFeatured) {
            updates.isFeatured = updates.isFeatured === 'true';
        }

        // Handle optional fields
        if (updates.email === '') updates.email = null;
        if (updates.openingHours === '') updates.openingHours = null;

        Object.assign(restaurant, updates);
        const updatedRestaurant = await restaurant.save();
        
        res.json(updatedRestaurant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete restaurant
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Delete all reviews for this restaurant
        await Review.deleteMany({ restaurant: restaurant._id });

        // Delete the restaurant
        await Restaurant.deleteOne({ _id: restaurant._id });

        res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle featured status
router.put('/:id/feature', verifyAdmin, async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // If we're featuring this restaurant, unfeature all others first
        if (!restaurant.isFeatured) {
            await Restaurant.updateMany(
                { _id: { $ne: restaurant._id } },
                { $set: { isFeatured: false } }
            );
        }

        restaurant.isFeatured = !restaurant.isFeatured;
        await restaurant.save();

        res.json({ 
            message: `Restaurant ${restaurant.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            isFeatured: restaurant.isFeatured
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 