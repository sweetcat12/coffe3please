// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const Passport = require('../models/Passport');


// ===========================
// SIGNUP ROUTE - NOW CREATES PENDING ACCOUNTS
// ===========================
router.post('/signup', async (req, res) => {
  try {
    const { username, name, email, phone, password } = req.body;

    console.log('=== SIGNUP REQUEST ===');
    console.log('Received data:', { username, name, email, phone, passwordLength: password?.length });

    // Validate all required fields
    if (!username || !name || !email || !phone || !password) {
      console.log('Missing fields');
      return res.status(400).json({
        success: false,
        error: 'Please fill in all fields (username, name, email, phone, password)'
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if username already exists
    console.log('Checking if username exists...');
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log('Username already taken:', username);
      return res.status(400).json({
        success: false,
        error: 'Username is already taken'
      });
    }

    // Check if email already exists
    console.log('Checking if email exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({
        success: false,
        error: 'Email is already registered'
      });
    }

    // Create new user with PENDING status
    console.log('Creating new user with pending status...');
    const user = await User.create({
      username,
      name,
      email,
      phone,
      password,
      accountStatus: 'pending' // NEW: Set to pending by default
    });

    console.log('✅ User created successfully with pending status:', user._id);

    // Create notification for admins about new signup
    console.log('Creating notification for admins...');
    try {
      await Notification.create({
        type: 'user',
        title: 'New User Registration Pending',
        message: `${name} (${email}) has signed up and is waiting for approval.`,
        relatedId: user._id,
        relatedModel: 'User'
      });
      console.log('✅ Admin notification created successfully');
    } catch (notificationError) {
      console.error('❌ Notification creation error:', notificationError.message);
      // Don't throw - continue even if notification fails
    }

    console.log('=== SIGNUP SUCCESS (PENDING APPROVAL) ===');
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please wait for admin approval before logging in.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        accountStatus: 'pending'
      }
    });
  } catch (error) {
    console.error('❌ === SIGNUP ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    console.error('Stack:', error.stack);

    let errorMessage = 'Server error. Please try again later.';

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      errorMessage = `This ${field} is already registered`;
    } else if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        code: error.code
      } : undefined
    });
  }
});

// ===========================
// LOGIN ROUTE - CHECK APPROVAL STATUS
// ===========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // NEW: Check if account is approved
    if (user.accountStatus === 'pending') {
      return res.status(403).json({
        success: false,
        error: 'Your account is pending admin approval. Please wait for confirmation.',
        accountStatus: 'pending'
      });
    }

    if (user.accountStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        error: user.rejectionReason || 'Your account has been rejected. Please contact support.',
        accountStatus: 'rejected'
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address'
      });
    }

    const otp = generateOTP();

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const emailResult = await sendOTPEmail(email, otp, user.name, 'customer');

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
    console.error('Forgot Password Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordOTP +resetPasswordExpires');

    if (!user) {
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
    console.error('Verify OTP Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordOTP +resetPasswordExpires +password');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset Password Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===========================
// GET ALL USERS
// ===========================
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get Users Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===========================
// GET USER BY ID
// ===========================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get User Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===========================
// UPDATE USER PROFILE
// ===========================
router.put('/update-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, name, phone, currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: 'Username is already taken'
        });
      }
    }

    // Validate username
    if (username) {
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({
          success: false,
          error: 'Username must be between 3-20 characters'
        });
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({
          success: false,
          error: 'Username can only contain letters, numbers, and underscores'
        });
      }
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is required to change password'
        });
      }

      const isPasswordCorrect = await user.comparePassword(currentPassword);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long'
        });
      }

      user.password = newPassword;
    }

    // Update other fields
    if (username) user.username = username;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    user.updatedAt = Date.now();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;