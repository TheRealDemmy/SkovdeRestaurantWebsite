const express = require('express');
const router = express.Router();

// Basic route
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to Skövde Restaurant API' });
});

module.exports = router; 