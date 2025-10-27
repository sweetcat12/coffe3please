require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email with:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***hidden***' : 'NOT SET');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"CoffeePlease Test" <${process.env.EMAIL_USER}>`,
      to: 'delacruzjefrey15@gmail.com', // Your email
      subject: '✅ Test Email from CoffeePlease',
      html: '<h1>Test Successful!</h1><p>If you see this, email is working! 🎉</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId); 
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();