const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');

// @route   GET /api/products/best-sellers
// @desc    Get top 3 products with most reviews (best sellers)
// @access  Public
router.get('/best-sellers', async (req, res) => {
  try {
    console.log('📊 Fetching best sellers...');
    
    // Get all feedback and count reviews per product
    const feedbackStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$productId',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 3 }
    ]);

    console.log(`Found ${feedbackStats.length} products with feedback`);

    // If no feedback exists, return empty array
    if (!feedbackStats || feedbackStats.length === 0) {
      console.log('⚠️ No feedback found, returning empty array');
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Get product details for top 3
    const productIds = feedbackStats.map(stat => stat._id);
    const products = await Product.find({ _id: { $in: productIds } });

    console.log(`Found ${products.length} products in database`);

    // Combine product data with stats
    const bestSellers = feedbackStats
      .map(stat => {
        const product = products.find(p => p._id.toString() === stat._id.toString());
        
        // Skip if product not found
        if (!product) {
          console.log(`⚠️ Product not found for ID: ${stat._id}`);
          return null;
        }
        
        return {
          id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          reviewCount: stat.reviewCount,
          averageRating: parseFloat(stat.averageRating.toFixed(1))
        };
      })
      .filter(item => item !== null); // Remove null entries

    console.log(`✅ Returning ${bestSellers.length} best sellers`);

    res.status(200).json({
      success: true,
      data: bestSellers
    });
  } catch (error) {
    console.error('❌ Get Best Sellers Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(200).json({
      success: true,
      data: [],
      error: 'Failed to fetch best sellers'
    });
  }
});

// @route   GET /api/products/top-rated
// @desc    Get top 3 highest-rated products (min 3 reviews)
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    console.log('⭐ Fetching top-rated products...');
    
    const topRatedStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$productId',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $match: { reviewCount: { $gte: 3 } } },
      { $sort: { averageRating: -1, reviewCount: -1 } },
      { $limit: 3 }
    ]);

    console.log(`Found ${topRatedStats.length} top-rated products`);

    if (!topRatedStats || topRatedStats.length === 0) {
      console.log('⚠️ No products with 3+ reviews found');
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const productIds = topRatedStats.map(stat => stat._id);
    const products = await Product.find({ _id: { $in: productIds } });

    const topRated = topRatedStats
      .map(stat => {
        const product = products.find(p => p._id.toString() === stat._id.toString());
        if (!product) return null;
        
        return {
          id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          reviewCount: stat.reviewCount,
          averageRating: parseFloat(stat.averageRating.toFixed(1))
        };
      })
      .filter(item => item !== null);

    console.log(`✅ Returning ${topRated.length} top-rated products`);

    res.status(200).json({
      success: true,
      data: topRated
    });
  } catch (error) {
    console.error('❌ Get Top Rated Error:', error.message);
    res.status(200).json({
      success: true,
      data: [],
      error: 'Failed to fetch top-rated products'
    });
  }
});

// @route   GET /api/products/top-products
// @desc    Get top 3 products (combination of best sellers + highest rated)
// @access  Public
router.get('/top-products', async (req, res) => {
  try {
    console.log('🏆 Fetching top products...');
    
    const productStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$productId',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $match: { reviewCount: { $gte: 2 } } }
    ]);

    console.log(`Found ${productStats.length} products with 2+ reviews`);

    if (!productStats || productStats.length === 0) {
      console.log('⚠️ No products with 2+ reviews found');
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const maxReviews = Math.max(...productStats.map(p => p.reviewCount));
    
    const scoredProducts = productStats.map(stat => {
      const normalizedReviews = stat.reviewCount / maxReviews;
      const normalizedRating = stat.averageRating / 5;
      const combinedScore = (normalizedReviews * 0.5) + (normalizedRating * 0.5);

      return {
        productId: stat._id,
        reviewCount: stat.reviewCount,
        averageRating: stat.averageRating,
        combinedScore
      };
    });

    const topProducts = scoredProducts
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 3);

    const productIds = topProducts.map(p => p.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const result = topProducts
      .map(stat => {
        const product = products.find(p => p._id.toString() === stat.productId.toString());
        if (!product) return null;
        
        return {
          id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          reviewCount: stat.reviewCount,
          averageRating: parseFloat(stat.averageRating.toFixed(1))
        };
      })
      .filter(item => item !== null);

    console.log(`✅ Returning ${result.length} top products`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Get Top Products Error:', error.message);
    res.status(200).json({
      success: true,
      data: [],
      error: 'Failed to fetch top products'
    });
  }
});

// @route   GET /api/products
// @desc    Get all products grouped by category
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('📦 Fetching all products...');
    
    const products = await Product.find({ available: true });
    
    console.log(`Found ${products.length} products`);
    
    const groupedProducts = products.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category
      });
      return acc;
    }, {});

    console.log(`✅ Grouped into ${Object.keys(groupedProducts).length} categories`);

    res.status(200).json({
      success: true,
      data: groupedProducts
    });
  } catch (error) {
    console.error('❌ Get Products Error:', error.message);
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

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
    console.error('❌ Get Product Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Public (should be protected later)
router.post('/', async (req, res) => {
  try {
    const { name, description, category, price } = req.body;

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

    console.log(`✅ Product created: ${product.name}`);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Create Product Error:', error.message);
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
    console.log('🌱 Seeding products...');
    
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

    console.log(`✅ Seeded ${createdProducts.length} products successfully`);

    res.status(201).json({
      success: true,
      message: 'Products seeded successfully',
      count: createdProducts.length,
      data: createdProducts
    });
  } catch (error) {
    console.error('❌ Seed Products Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;