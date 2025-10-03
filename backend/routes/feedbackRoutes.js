// backend/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// @route   POST /api/feedback
// @desc    Submit product feedback/rating
// @access  Public (should be protected - require login)
router.post('/', async (req, res) => {
  try {
    const { productId, userId, rating, comment, customerName, customerEmail, image } = req.body;

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

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
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
// @desc    Delete feedback (Admin only - add auth middleware later)
// @access  Public (should be protected)
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
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