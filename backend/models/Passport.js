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

// Method to calculate rank based on reviews
passportSchema.methods.calculateRank = function() {
  const reviews = this.stats.totalReviews;
  if (reviews >= 30) return 'Supreme Barista';
  if (reviews >= 20) return 'Latte Legend';
  if (reviews >= 10) return 'Espresso Expert';
  if (reviews >= 5) return 'Coffee Explorer';
  return 'Newbie';
};

// Update the checkBadges method
passportSchema.methods.checkBadges = function() {
  const badgeDefinitions = [
    { 
      name: 'First Review', 
      icon: '🌟', 
      description: 'Completed your first review', 
      requirement: 1,
      check: (stats) => stats.totalReviews >= 1
    },
    { 
      name: '5 Review Streak', 
      icon: '🔥', 
      description: 'Reviewed 5 items', 
      requirement: 5,
      check: (stats) => stats.totalReviews >= 5
    },
    { 
      name: 'Coffee Explorer', 
      icon: '🗺️', 
      description: 'Reviewed 10 items', 
      requirement: 10,
      check: (stats) => stats.totalReviews >= 10
    },
    { 
      name: 'Review Master', 
      icon: '👑', 
      description: 'Reviewed 20 items', 
      requirement: 20,
      check: (stats) => stats.totalReviews >= 20
    },
    { 
      name: 'Supreme Reviewer', 
      icon: '💎', 
      description: 'Reviewed 30 items', 
      requirement: 30,
      check: (stats) => stats.totalReviews >= 30
    }
  ];

  const newBadges = [];
  
  badgeDefinitions.forEach(def => {
    const existingBadge = this.badges.find(b => b.name === def.name);
    
    if (!existingBadge && def.check(this.stats)) {
      const newBadge = {
        name: def.name,
        icon: def.icon,
        description: def.description,
        requirement: def.requirement,
        unlockedAt: new Date()
      };
      this.badges.push(newBadge);
      newBadges.push(newBadge);
    }
  });

  return newBadges; // Return newly unlocked badges
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