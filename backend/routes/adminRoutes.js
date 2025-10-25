const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Feedback = require('../models/Feedback');
const bcrypt = require('bcryptjs');
const Passport = require('../models/Passport');

// ===========================
// EMAIL SERVICE
// ===========================
const sendApprovalEmail = async (email, name, status, reason = null) => {
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let subject, html;
  
  if (status === 'approved') {
    subject = '✅ Your CoffeePlease Account Has Been Approved!';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">🎉 Account Approved!</h2>
        <p>Hi ${name},</p>
        <p>Great news! Your CoffeePlease account has been approved.</p>
        <p>You can now log in and start rating your favorite coffee items!</p>
        <a href="http://localhost:5173" style="display: inline-block; padding: 12px 24px; background-color: #D97706; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Login Now
        </a>
        <p style="color: #6B7280; font-size: 14px;">Happy coffee tasting! ☕</p>
      </div>
    `;
  } else {
    subject = '❌ CoffeePlease Account Status Update';
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Account Not Approved</h2>
        <p>Hi ${name},</p>
        <p>We're sorry, but your CoffeePlease account registration was not approved.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you have questions, please contact our support team.</p>
        <p style="color: #6B7280; font-size: 14px;">Thank you for your understanding.</p>
      </div>
    `;
  }

  try {
    await transporter.sendMail({
      from: `"CoffeePlease" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// ===========================
// OTP EMAIL SERVICE
// ===========================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, name, type = 'user') => {
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const subject = '🔐 Password Reset OTP - CoffeePlease';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Use the OTP below to continue:</p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="color: #667eea; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
      </div>
      <p style="color: #EF4444; font-weight: 600;">This OTP will expire in 15 minutes.</p>
      <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"CoffeePlease" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

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

// ==================== ADMIN MANAGEMENT ====================

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

// ===========================
// APPROVE USER ACCOUNT (with email notification)
// ===========================
router.post('/users/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    console.log('Approve user request:', id, 'by admin:', adminId);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.accountStatus === 'approved') {
      return res.status(400).json({
        success: false,
        error: 'User is already approved'
      });
    }

    // Update user status
    user.accountStatus = 'approved';
    user.approvedBy = adminId;
    user.approvedAt = new Date();
    user.rejectionReason = null;
    await user.save();

    // Create passport for approved user
    console.log('Creating passport for approved user...');
    try {
      const existingPassport = await Passport.findOne({ userId: user._id });
      
      if (!existingPassport) {
        const passportData = {
          userId: user._id,
          reviewedProducts: [],
          badges: [],
          stats: {
            totalReviews: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastReviewDate: null,
            categoriesExplored: {}
          },
          rank: 'Newbie'
        };
        
        await Passport.create(passportData);
        console.log('✅ Passport created for approved user');
      }
    } catch (passportError) {
      console.error('❌ Passport creation error:', passportError.message);
    }

    // 🆕 Send approval email
    console.log('Sending approval email...');
    const emailResult = await sendApprovalEmail(user.email, user.name, 'approved');
    if (emailResult.success) {
      console.log('✅ Approval email sent');
    } else {
      console.log('❌ Failed to send approval email:', emailResult.error);
    }

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus,
        approvedAt: user.approvedAt
      }
    });
  } catch (error) {
    console.error('Approve User Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: error.message  
    });
  }
});

// ===========================
// REJECT USER ACCOUNT (with email notification)
// ===========================
router.post('/users/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, reason } = req.body;

    console.log('Reject user request:', id, 'by admin:', adminId);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.accountStatus === 'rejected') {
      return res.status(400).json({
        success: false,
        error: 'User is already rejected'
      });
    }

    // Update user status
    user.accountStatus = 'rejected';
    user.approvedBy = adminId;
    user.rejectionReason = reason || 'Your account registration did not meet our requirements.';
    await user.save();

    // 🆕 Send rejection email
    console.log('Sending rejection email...');
    const emailResult = await sendApprovalEmail(user.email, user.name, 'rejected', user.rejectionReason);
    if (emailResult.success) {
      console.log('✅ Rejection email sent');
    } else {
      console.log('❌ Failed to send rejection email:', emailResult.error);
    }

    res.status(200).json({
      success: true,
      message: 'User rejected successfully',
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus,
        rejectionReason: user.rejectionReason
      }
    });
  } catch (error) {
    console.error('Reject User Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: error.message  
    });
  }
});

// ===========================
// GET PENDING USERS
// ===========================
router.get('/users/pending', async (req, res) => {
  try {
    const pendingUsers = await User.find({ accountStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers
    });
  } catch (error) {
    console.error('Get Pending Users Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
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
router.delete('/feedback/:id', async (req, res) => {
  try {
    console.log('Delete feedback request:', req.params.id);
    
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

          // Handle categoriesExplored
          if (category && passport.stats.categoriesExplored) {
            if (passport.stats.categoriesExplored instanceof Map) {
              passport.stats.categoriesExplored = Object.fromEntries(passport.stats.categoriesExplored);
            }

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
            if (badge.name.includes('Master')) {
              const badgeCategory = badge.name.replace(' Master', '');
              const reviewedInCategory = passport.stats.categoriesExplored[badgeCategory] || 0;
              const totalInCategory = await Product.countDocuments({ category: badgeCategory });
              
              if (reviewedInCategory >= totalInCategory && totalInCategory > 0) {
                newBadges.push(badge);
              }
            } else if (badge.requirement === -1 || passport.stats.totalReviews >= badge.requirement) {
              newBadges.push(badge);
            }
          }
          
          passport.badges = newBadges;
          passport.updatedAt = new Date();
          
          passport.markModified('stats.categoriesExplored');
          passport.markModified('reviewedProducts');
          passport.markModified('badges');
          
          await passport.save();
          
          console.log(`✅ Passport updated for user ${userId}`);
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