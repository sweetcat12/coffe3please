const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const Passport = require('../models/Passport');

// @route   POST /api/feedback
// @desc    Submit product feedback/rating
// @access  Public (should be protected - require login)
router.post('/', async (req, res) => {
  try {
    const { productId, userId, rating, comment, customerName, customerEmail, image } = req.body;

    console.log('Received feedback submission:', { productId, userId, rating, customerName });

    // Validation
    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Please provide productId and rating'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Validate image if provided
    if (image) {
      // Check if it's a valid base64 image
      const base64Regex = /^data:image\/(jpeg|jpg);base64,/;
      if (!base64Regex.test(image)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid image format. Only JPG images are allowed'
        });
      }

      // Check image size (5MB limit)
      const sizeInBytes = (image.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      if (sizeInMB > 5) {
        return res.status(400).json({
          success: false,
          error: 'Image size must be less than 5MB'
        });
      }
    }

    console.log('Validation passed, creating feedback...');

    // Create feedback
    const feedback = await Feedback.create({
      productId,
      userId,
      rating,
      comment: comment || '',
      customerName: customerName || 'Anonymous',
      customerEmail: customerEmail || '',
      image: image || null
    });

    console.log('Feedback created:', feedback._id);

    // Get product details for notification and passport update
    console.log('Fetching product with ID:', productId);
    const product = await Product.findById(productId);
    console.log('Product found:', product ? product.name : 'NOT FOUND');

    const productName = product ? product.name : 'Unknown Product';
    const userName = customerName || 'Anonymous';
    const stars = '⭐'.repeat(rating);

    console.log('Creating notification...');

    // Create notification for admin
    await Notification.create({
      type: 'feedback',
      title: 'New Product Review',
      message: `${userName} rated "${productName}" ${stars} (${rating}/5)`,
      relatedId: feedback._id,
      relatedModel: 'Feedback'
    });

    console.log('Notification created successfully');

    // Update passport if user is logged in
    if (userId) {
      try {
        console.log('Updating passport for user:', userId);
        let passport = await Passport.findOne({ userId });

        if (!passport) {
          passport = await Passport.create({
            userId,
            reviewedProducts: [],
            badges: [],
            stats: {
              totalReviews: 0,
              currentStreak: 0,
              longestStreak: 0,
              categoriesExplored: {}
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
            category: product ? product.category : 'Uncategorized',
            reviewedAt: new Date()
          });

          // Update total reviews
          passport.stats.totalReviews += 1;

          // Update category count
          if (product && product.category) {
            if (!passport.stats.categoriesExplored) {
              passport.stats.categoriesExplored = {};
            }
            passport.stats.categoriesExplored[product.category] = 
              (passport.stats.categoriesExplored[product.category] || 0) + 1;
          }

          // Update streak
          passport.updateStreak();

          // Recalculate rank
          passport.rank = passport.calculateRank();

          // Check and unlock badges
          const newBadges = passport.checkBadges();

          // Save passport
          await passport.save();

          // If new badges were unlocked, include them in the response
          if (newBadges && newBadges.length > 0) {
            return res.status(201).json({
              success: true,
              data: feedback,
              newBadges: newBadges
            });
          }
        }
      } catch (passportError) {
        console.error('Error updating passport:', passportError);
      }
    }

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/feedback/product/:productId
// @desc    Get all feedback for a specific product (sorted by highest rating first)
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const feedback = await Feedback.find({ productId: req.params.productId })
      .populate('userId', 'name email') // Get user info if userId exists
      .sort({ rating: -1, createdAt: -1 }); // Highest rating first, then most recent

    // Calculate average rating
    const averageRating = feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
      : 0;

    // Format the response to include username from either userId or customerName
    const formattedFeedback = feedback.map(item => ({
      _id: item._id,
      username: item.userId?.name || item.customerName || 'Anonymous',
      rating: item.rating,
      comment: item.comment,
      image: item.image,
      createdAt: item.createdAt
    }));

    res.status(200).json({
      success: true,
      count: feedback.length,
      averageRating: parseFloat(averageRating),
      data: formattedFeedback
    });
  } catch (error) {
    console.error('Get Feedback Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   PUT /api/feedback/:id/verify
// @desc    Verify a feedback (voucher functionality removed)
// @access  Admin only
router.put('/:id/verify', async (req, res) => {
  try {
    const { adminId } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    if (feedback.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Feedback already verified'
      });
    }

    // Mark as verified
    feedback.isVerified = true;
    feedback.verifiedAt = new Date();
    feedback.verifiedBy = adminId || null;
    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback verified',
      data: feedback
    });
  } catch (error) {
    console.error('Error verifying feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   PUT /api/feedback/:id/unverify
// @desc    Unverify a feedback
// @access  Admin only
router.put('/:id/unverify', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    if (!feedback.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Feedback is not verified'
      });
    }

    feedback.isVerified = false;
    feedback.verifiedAt = null;
    feedback.verifiedBy = null;
    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback unverified',
      data: feedback
    });
  } catch (error) {
    console.error('Error unverifying feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/feedback/product/:productId/summary
// @desc    Get review summary for a product (count and average)
// @access  Public
router.get('/product/:productId/summary', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ productId: req.params.productId });
    
    const totalReviews = feedbacks.length;
    const averageRating = totalReviews > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalReviews
      : 0;

    res.json({
      success: true,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
    });
  } catch (error) {
    console.error('Error fetching review summary:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback
// @access  Public
router.get('/', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    console.error('Get All Feedback Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback and update passport
// @access  Public (should be protected)
router.delete('/:id', async (req, res) => {
  try {
    // Find the feedback first to get userId and productId
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    const { userId, productId } = feedback;

    // Delete the feedback
    await Feedback.findByIdAndDelete(req.params.id);

    // Update the user's passport if they have one
    if (userId) {
      const passport = await Passport.findOne({ userId });
      
      if (passport) {
        // Find the reviewed product
        const productIndex = passport.reviewedProducts.findIndex(
          item => item.productId.toString() === productId.toString()
        );

        if (productIndex !== -1) {
          const product = passport.reviewedProducts[productIndex];
          const category = product.category;

          // Remove from reviewed products
          passport.reviewedProducts.splice(productIndex, 1);

          // Decrease total reviews
          passport.stats.totalReviews = Math.max(0, passport.stats.totalReviews - 1);

          // Decrease category count
          if (category && passport.stats.categoriesExplored.has(category)) {
            const currentCount = passport.stats.categoriesExplored.get(category);
            if (currentCount > 1) {
              passport.stats.categoriesExplored.set(category, currentCount - 1);
            } else {
              passport.stats.categoriesExplored.delete(category);
            }
          }

          // Recalculate rank
          passport.rank = passport.calculateRank();
          
          // Save the updated passport
          await passport.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete Feedback Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;