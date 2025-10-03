require('dotenv').config();
const mongoose = require('mongoose');
const Feedback = require('./models/Feedback');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to database!');
  const feedback = await Feedback.find().populate('productId');
  console.log('Total feedback:', feedback.length);
  console.log('Feedback data:', JSON.stringify(feedback, null, 2));
  process.exit();
}).catch(err => {
  console.error('Database error:', err);
  process.exit(1);
});