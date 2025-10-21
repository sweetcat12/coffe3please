const express = require('express');
const router = express.Router();
const Passport = require('../models/Passport');
const User = require('../models/User');
const Product = require('../models/Product');

// @route   GET /api/passport/:userId
// @desc    Get passport data for a user with category progress
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find or create passport
    let passport = await Passport.findOne({ userId }).populate('userId', 'name email');

    if (!passport) {
      // Create new passport if doesn't exist
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      passport = await Passport.create({
        userId,
        reviewedProducts: [],
        badges: [],
        stats: {
          totalReviews: 0,
          currentStreak: 0,
          longestStreak: 0,
          categoriesExplored: new Map()
        },
        rank: 'Newbie'
      });

      await passport.populate('userId', 'name email');
    }

    // Get all products to calculate category progress
    const allProducts = await Product.find();
    
    // Group products by category
    const productsByCategory = {};
    allProducts.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = [];
      }
      productsByCategory[product.category].push(product._id.toString());
    });

    // Calculate category progress
    const categoryProgress = {};
    const reviewedProductIds = passport.reviewedProducts.map(rp => rp.productId.toString());

    Object.keys(productsByCategory).forEach(category => {
      const totalInCategory = productsByCategory[category].length;
      const reviewedInCategory = productsByCategory[category].filter(
        productId => reviewedProductIds.includes(productId)
      ).length;
      
      categoryProgress[category] = {
        total: totalInCategory,
        reviewed: reviewedInCategory,
        percentage: totalInCategory > 0 ? Math.round((reviewedInCategory / totalInCategory) * 100) : 0
      };
    });

    // Calculate overall completion
    const totalProducts = allProducts.length;
    const completionPercentage = totalProducts > 0 
      ? Math.round((passport.stats.totalReviews / totalProducts) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        passport,
        categoryProgress,
        totalProducts,
        completionPercentage
      }
    });
  } catch (error) {
    console.error('Get Passport Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/passport/leaderboard/top
// @desc    Get top users on leaderboard
// @access  Public
router.get('/leaderboard/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Change the populate to include both username and name
    const passports = await Passport.find()
      .populate('userId', 'username name email') // Add name field
      .sort({ 'stats.totalReviews': -1 })
      .limit(limit);

    const leaderboard = passports.map((passport, index) => ({
      rank: index + 1,
      userId: passport.userId._id,
      username: passport.userId.username || passport.userId.name, // Try username first, fall back to name
      userEmail: passport.userId.email,
      totalReviews: passport.stats.totalReviews,
      currentRank: passport.rank,
      currentStreak: passport.stats.currentStreak
    }));

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/passport/:userId/review
// @desc    Update passport after a review (called from feedback route)
// @access  Private
router.put('/:userId/review', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, category } = req.body;

    let passport = await Passport.findOne({ userId });

    if (!passport) {
      // Create passport if it doesn't exist
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      passport = await Passport.create({
        userId,
        reviewedProducts: [],
        badges: [],
        stats: {
          totalReviews: 0,
          currentStreak: 0,
          longestStreak: 0,
          categoriesExplored: new Map()
        },
        rank: 'Newbie'
      });
    }

    // Check if product already reviewed
    const alreadyReviewed = passport.reviewedProducts.some(
      item => item.productId.toString() === productId.toString()
    );

    if (!alreadyReviewed) {
      // Add to reviewed products
      passport.reviewedProducts.push({
        productId,
        category: category || 'Uncategorized',
        reviewedAt: new Date()
      });

      // Update total reviews
      passport.stats.totalReviews += 1;

      // Update category count
      if (category) {
        const currentCount = passport.stats.categoriesExplored.get(category) || 0;
        passport.stats.categoriesExplored.set(category, currentCount + 1);
      }

      // Update streak
      passport.updateStreak();

      // Recalculate rank
      passport.rank = passport.calculateRank();

      // Check and unlock badges
      passport.checkBadges();

      // Update timestamp
      passport.updatedAt = new Date();

      await passport.save();
    }

    res.status(200).json({
      success: true,
      data: passport
    });
  } catch (error) {
    console.error('Update Passport Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;