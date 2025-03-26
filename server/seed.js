require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');

const sampleRestaurants = [
    {
        name: "Bombay Masala",
        description: "Authentic Indian cuisine in the heart of Skövde",
        cuisine: "Indian",
        price: "$$",
        rating: 4.5,
        image: "https://example.com/bombay-masala.jpg",
        address: "123 Restaurant Street, Skövde",
        phone: "+46 123 456 789",
        email: "info@bombaymasala.se",
        openingHours: "Mon-Sun: 11:00-22:00"
    },
    {
        name: "Sushi Master",
        description: "Fresh and delicious Japanese sushi",
        cuisine: "Japanese",
        price: "$$$",
        rating: 4.8,
        image: "https://example.com/sushi-master.jpg",
        address: "456 Food Avenue, Skövde",
        phone: "+46 987 654 321",
        email: "contact@sushimaster.se",
        openingHours: "Tue-Sun: 12:00-21:00"
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing restaurants
        await Restaurant.deleteMany({});
        console.log('Cleared existing restaurants');

        // Insert sample restaurants
        const createdRestaurants = await Restaurant.insertMany(sampleRestaurants);
        console.log('Sample restaurants inserted:', createdRestaurants.map(r => r.name).join(', '));

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 