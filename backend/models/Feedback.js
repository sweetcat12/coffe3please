const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    default: 'Anonymous'
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  image: {
    type: String, // Base64 encoded image
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for faster queries
feedbackSchema.index({ productId: 1, rating: -1 });
feedbackSchema.index({ productId: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted date
feedbackSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Static method to get product rating summary
feedbackSchema.statics.getProductSummary = async function(productId) {
  const result = await this.aggregate([
    { $match: { productId: mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$productId',
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratings: {
          $push: {
            rating: '$rating',
            comment: '$comment',
            customerName: '$customerName',
            createdAt: '$createdAt'
          }
        }
      }
    }
  ]);
  
  return result[0] || {
    totalReviews: 0,
    averageRating: 0,
    ratings: []
  };
};

// Pre-save middleware to validate
feedbackSchema.pre('save', function(next) {
  // Ensure customerName has a value
  if (!this.customerName || this.customerName.trim() === '') {
    this.customerName = 'Anonymous';
  }
  next();
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;