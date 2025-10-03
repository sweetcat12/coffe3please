const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products grouped by category
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ available: true });
    
    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedProducts
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get Product Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product (Admin only - you can add auth middleware later)
// @access  Public (should be protected later)
router.post('/', async (req, res) => {
  try {
    const { name, description, category, price } = req.body;

    // Validation
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, description, and category'
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price: price || 0
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/products/seed
// @desc    Seed database with initial products
// @access  Public (should be protected/removed in production)
router.post('/seed', async (req, res) => {
  try {
    // Clear existing products
    await Product.deleteMany({});

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
      { name: "Milky Mango", description: "Rich caramel flavor", category: "NON COFFEE", price: 105 },
      { name: "Cookies and Cream", description: "Rich caramel flavor", category: "NON COFFEE", price: 115 },
      
      // HOT COFFEE
      { name: "Caramel Macchiato", description: "Espresso with chocolate and steamed milk", category: "HOT COFFEE", price: 110 },
      { name: "Spanish Latte", description: "Vanilla and caramel perfection", category: "HOT COFFEE", price: 120 },
      { name: "Choco Mocha", description: "Velvety microfoam with espresso", category: "HOT COFFEE", price: 115 },
      { name: "Caramel Latte", description: "Equal parts espresso and steamed milk", category: "HOT COFFEE", price: 110 },
      { name: "Salted Caramel Latte", description: "Equal parts espresso and steamed milk", category: "HOT COFFEE", price: 125 },
      
      // BLENDED DRINK
      { name: "Matcha Frappe", description: "Buttery and flaky", category: "BLENDED DRINK", price: 140 },
      { name: "Strawberry Matcha Frappe", description: "Fresh baked with real blueberries", category: "BLENDED DRINK", price: 150 },
      { name: "Coffee Choco", description: "Warm and gooey", category: "BLENDED DRINK", price: 135 },
      { name: "Cookies and Cream", description: "Warm and gooey", category: "BLENDED DRINK", price: 145 }
    ];

    const createdProducts = await Product.insertMany(products);

    res.status(201).json({
      success: true,
      message: 'Products seeded successfully',
      count: createdProducts.length,
      data: createdProducts
    });
  } catch (error) {
    console.error('Seed Products Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;