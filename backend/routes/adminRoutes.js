const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Feedback = require('../models/Feedback');
const bcrypt = require('bcryptjs');
const Passport = require('../models/Passport');
const { generateOTP, sendOTPEmail } = require('../emailService');

// ==================== ADMIN AUTH ====================

// @route   POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isPasswordCorrect = await admin.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ===========================
// FORGOT PASSWORD - SEND OTP
// ===========================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your email address'
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'No admin account found with this email address'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database (expires in 15 minutes)
    admin.resetPasswordOTP = otp;
    admin.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await admin.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp, admin.username, 'admin');
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address'
    });
  } catch (error) {
    console.error('Admin Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// ===========================
// VERIFY OTP
// ===========================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and OTP'
      });
    }

    const admin = await Admin.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordOTP +resetPasswordExpires');

    if (!admin) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Admin Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// ===========================
// RESET PASSWORD
// ===========================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, OTP, and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    const admin = await Admin.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordOTP +resetPasswordExpires +password');

    if (!admin) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

    // Update password
    admin.password = newPassword;
    admin.resetPasswordOTP = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Admin Reset Password Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/admin/all
router.get('/all', async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    console.error('Get Admins Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/admin/create
router.post('/create', async (req, res) => {
  try {
    console.log('Create admin request body:', req.body);
    const { username, email, phone, password, role } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Admin already exists'
      });
    }

    const admin = await Admin.create({
      username,
      email,
      phone,
      password,
      role: role || 'admin'
    });

    res.status(201).json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create Admin Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

// @route   PUT /api/admin/:id
router.put('/:id', async (req, res) => {
  try {
    console.log('Update admin request:', req.params.id, req.body);
    const { username, email, phone, password, role } = req.body;
    
    const updateData = { username, email, phone };
    if (role) updateData.role = role;
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Update Admin Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

// @route   DELETE /api/admin/:id
router.delete('/:id', async (req, res) => {
  try {
    console.log('Delete admin request:', req.params.id);
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete Admin Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== DASHBOARD ====================

// @route   GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    
    const feedbackData = await Feedback.find().populate('productId', 'name category');
    
    const avgRating = feedbackData.length > 0
      ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(2)
      : 0;

    const ratingsDistribution = {
      1: feedbackData.filter(f => f.rating === 1).length,
      2: feedbackData.filter(f => f.rating === 2).length,
      3: feedbackData.filter(f => f.rating === 3).length,
      4: feedbackData.filter(f => f.rating === 4).length,
      5: feedbackData.filter(f => f.rating === 5).length,
    };

    const productRatings = {};
    feedbackData.forEach(f => {
      if (f.productId) {
        const productName = f.productId.name;
        if (!productRatings[productName]) {
          productRatings[productName] = { total: 0, count: 0, reviews: [] };
        }
        productRatings[productName].total += f.rating;
        productRatings[productName].count += 1;
        productRatings[productName].reviews.push(f.comment);
      }
    });

    const topProducts = Object.entries(productRatings)
      .map(([name, data]) => ({
        name,
        averageRating: (data.total / data.count).toFixed(2),
        reviewCount: data.count
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);

    const lowProducts = Object.entries(productRatings)
      .map(([name, data]) => ({
        name,
        averageRating: (data.total / data.count).toFixed(2),
        reviewCount: data.count
      }))
      .sort((a, b) => a.averageRating - b.averageRating)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalFeedback,
        avgRating,
        ratingsDistribution,
        topProducts,
        lowProducts,
        recentFeedback: feedbackData.slice(-10).reverse()
      }
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== USER MANAGEMENT ====================

// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   POST /api/admin/users
router.post('/users', async (req, res) => {
  try {
    console.log('Create user request body:', req.body);
    const { username, name, email, phone, password } = req.body;

    if (!username || !name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    const user = await User.create({ username, name, email, phone, password });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    console.log('Update user request:', req.params.id, req.body);
    const { username, name, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, name, email, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user and their associated data (passport, feedback)
router.delete('/users/:id', async (req, res) => {
  try {
    console.log('Delete user request:', req.params.id);
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user's passport
    await Passport.findOneAndDelete({ userId: req.params.id });
    
    // Delete user's feedback
    await Feedback.deleteMany({ userId: req.params.id });
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: error.message  
    });
  }
});

// ==================== FEEDBACK MANAGEMENT ====================

// @route   GET /api/admin/feedback
router.get('/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('productId', 'name category')
      .populate('userId', 'username name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    console.error('Get Feedback Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   DELETE /api/admin/feedback/:id
// @desc    Delete feedback and update user's passport
router.delete('/feedback/:id', async (req, res) => {
  try {
    console.log('Delete feedback request:', req.params.id);
    
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

          // ✅ FIX: Handle categoriesExplored as a plain object, not a Map
          if (category && passport.stats.categoriesExplored) {
            // Convert to plain object if it's a Map
            if (passport.stats.categoriesExplored instanceof Map) {
              passport.stats.categoriesExplored = Object.fromEntries(passport.stats.categoriesExplored);
            }

            // Decrease category count
            const currentCount = passport.stats.categoriesExplored[category] || 0;
            if (currentCount > 1) {
              passport.stats.categoriesExplored[category] = currentCount - 1;
            } else {
              delete passport.stats.categoriesExplored[category];
            }
          }

          // Recalculate rank
          passport.rank = passport.calculateRank();

          // Remove badges that no longer meet requirements
          const newBadges = [];
          for (const badge of passport.badges) {
            // Keep category master badges only if still valid
            if (badge.name.includes('Master')) {
              const badgeCategory = badge.name.replace(' Master', '');
              
              // Use object notation instead of Map methods
              const reviewedInCategory = passport.stats.categoriesExplored[badgeCategory] || 0;
              const totalInCategory = await Product.countDocuments({ category: badgeCategory });
              
              if (reviewedInCategory >= totalInCategory && totalInCategory > 0) {
                newBadges.push(badge);
              }
            } 
            // Keep other badges if they still meet requirements
            else if (badge.requirement === -1 || passport.stats.totalReviews >= badge.requirement) {
              newBadges.push(badge);
            }
          }
          
          passport.badges = newBadges;
          passport.updatedAt = new Date();
          
          // Mark the paths as modified to ensure MongoDB saves the changes
          passport.markModified('stats.categoriesExplored');
          passport.markModified('reviewedProducts');
          passport.markModified('badges');
          
          await passport.save();
          
          console.log(`✅ Passport updated for user ${userId}:`, {
            totalReviews: passport.stats.totalReviews,
            rank: passport.rank,
            badgesCount: passport.badges.length,
            categoriesExplored: passport.stats.categoriesExplored
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully and passport updated'
    });
  } catch (error) {
    console.error('Delete Feedback Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: error.message 
    });
  }
});

// ==================== PRODUCT MANAGEMENT ====================

// @route   POST /api/admin/products
router.post('/products', async (req, res) => {
  try {
    console.log('Create product request body:', req.body);
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

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    console.log('Update product request:', req.params.id, req.body);
    const { name, description, category, price } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, category, price },
      { new: true, runValidators: true }
    );

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
    console.error('Update Product Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    console.log('Delete product request:', req.params.id);
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;