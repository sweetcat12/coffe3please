const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const products = [
  // ICED COFFEE
  { name: "Caramel Macchiato", description: "Rich and bold single shot", category: "ICED COFFEE", price: 120 },
  { name: "Spanish Latte", description: "Twice the intensity", category: "ICED COFFEE", price: 130 },
  { name: "Choco Mocha", description: "Espresso with hot water", category: "ICED COFFEE", price: 125 },
  { name: "Caramel Latte", description: "Espresso with steamed milk and foam", category: "ICED COFFEE", price: 120 },
  { name: "Salted Caramel Latte", description: "Smooth espresso with steamed milk", category: "ICED COFFEE", price: 135 },
  
  // NON COFFEE
  { name: "Milky Matcha", description: "Smooth and refreshing", category: "NON COFFEE", price: 110 },
  { name: "Blueberry Milk", description: "Sweet vanilla notes", category: "NON COFFEE", price: 100 },
  { name: "Strawberry Cream", description: "Rich caramel flavor", category: "NON COFFEE", price: 105 },
  { name: "Milky Mango", description: "Tropical mango goodness", category: "NON COFFEE", price: 105 },
  { name: "Cookies and Cream", description: "Sweet cookies flavor", category: "NON COFFEE", price: 115 },
  
  // HOT COFFEE
  { name: "Caramel Macchiato", description: "Espresso with chocolate and steamed milk", category: "HOT COFFEE", price: 110 },
  { name: "Spanish Latte", description: "Vanilla and caramel perfection", category: "HOT COFFEE", price: 120 },
  { name: "Choco Mocha", description: "Velvety microfoam with espresso", category: "HOT COFFEE", price: 115 },
  { name: "Caramel Latte", description: "Equal parts espresso and steamed milk", category: "HOT COFFEE", price: 110 },
  { name: "Salted Caramel Latte", description: "Sweet and salty perfection", category: "HOT COFFEE", price: 125 },
  
  // BLENDED DRINK
  { name: "Matcha Frappe", description: "Smooth matcha blend", category: "BLENDED DRINK", price: 140 },
  { name: "Strawberry Matcha Frappe", description: "Fruity matcha fusion", category: "BLENDED DRINK", price: 150 },
  { name: "Coffee Choco", description: "Rich chocolate coffee", category: "BLENDED DRINK", price: 135 },
  { name: "Cookies and Cream", description: "Creamy cookie delight", category: "BLENDED DRINK", price: 145 }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} products seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();