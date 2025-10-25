const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirement: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  voucherCode: {
    type: String,
    default: null
  },
  unlockedAt: {
    type: Date,
    default: null
  }
});

const passportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  reviewedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    category: String,
    reviewedAt: Date
  }],
  badges: [badgeSchema],
  stats: {
    totalReviews: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastReviewDate: Date,
    categoriesExplored: {
      type: Object,
      default: () => ({})
    }
  },
  rank: {
    type: String,
    enum: ['Newbie', 'Coffee Explorer', 'Espresso Expert', 'Latte Legend', 'Supreme Barista'],
    default: 'Newbie'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Method to calculate rank based on total reviews
passportSchema.methods.calculateRank = function() {
  const reviews = this.stats.totalReviews;
  if (reviews >= 30) return 'Supreme Barista';
  if (reviews >= 20) return 'Latte Legend';
  if (reviews >= 10) return 'Espresso Expert';
  if (reviews >= 5) return 'Coffee Explorer';
  return 'Newbie';
};

// Helper function to generate unique voucher code
const generateVoucherCode = (discount) => {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `COFFEE${discount}-${randomStr}`;
};

// Method to check and unlock badges (with discount vouchers)
passportSchema.methods.checkBadges = async function(userId) {
  const User = mongoose.model('User');
  
  const badgeDefinitions = [
    { 
      name: 'First Review', 
      icon: '🌟', 
      description: 'Completed your first review', 
      requirement: 1,
      discount: 0
    },
    { 
      name: 'Coffee Enthusiast', 
      icon: '☕', 
      description: 'Reviewed 5 items - 5% discount unlocked!', 
      requirement: 5,
      discount: 5
    },
    { 
      name: 'Coffee Connoisseur', 
      icon: '🔥', 
      description: 'Reviewed 10 items - 10% discount unlocked!', 
      requirement: 10,
      discount: 10
    },
    { 
      name: 'Coffee Expert', 
      icon: '👑', 
      description: 'Reviewed 20 items - 20% discount unlocked!', 
      requirement: 20,
      discount: 20
    },
    { 
      name: 'Coffee Master', 
      icon: '💎', 
      description: 'Reviewed 30 items - 30% discount unlocked!', 
      requirement: 30,
      discount: 30
    }
  ];

  const newBadges = [];
  
  for (const def of badgeDefinitions) {
    const existingBadge = this.badges.find(b => b.name === def.name);
    
    if (!existingBadge && this.stats.totalReviews >= def.requirement) {
      // Generate voucher code if badge has discount
      const voucherCode = def.discount > 0 ? generateVoucherCode(def.discount) : null;
      
      const newBadge = {
        name: def.name,
        icon: def.icon,
        description: def.description,
        requirement: def.requirement,
        discount: def.discount,
        voucherCode: voucherCode,
        unlockedAt: new Date()
      };
      
      this.badges.push(newBadge);
      newBadges.push(newBadge);

      // ✅ Add voucher to user's account if discount badge
      if (def.discount > 0 && userId) {
        try {
          const user = await User.findById(userId);
          if (user) {
            user.vouchers.push({
              code: voucherCode,
              discount: def.discount,
              badgeName: def.name,
              isUsed: false,
              expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days expiry
              createdAt: new Date()
            });
            await user.save();
            console.log(`✅ Voucher ${voucherCode} added to user ${userId}`);
          }
        } catch (error) {
          console.error('Error adding voucher to user:', error);
        }
      }
    }
  }

  return newBadges;
};

// Method to update streak
passportSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.stats.lastReviewDate) {
    const lastReview = new Date(this.stats.lastReviewDate);
    lastReview.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastReview) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      this.stats.currentStreak += 1;
    } else if (daysDiff > 1) {
      this.stats.currentStreak = 1;
    }
  } else {
    this.stats.currentStreak = 1;
  }
  
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  
  this.stats.lastReviewDate = new Date();
};

const Passport = mongoose.model('Passport', passportSchema);

module.exports = Passport;