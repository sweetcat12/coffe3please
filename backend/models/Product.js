const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide product category'],
    enum: ['ICED COFFEE', 'NON COFFEE', 'HOT COFFEE', 'BLENDED DRINK']
  },
  price: {
    type: Number,
    default: 0
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;