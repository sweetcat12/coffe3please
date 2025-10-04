const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName, userType = 'customer') => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${userType === 'admin' ? 'Admin Panel' : 'CoffeePlease'} - Password Reset Code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: ${userType === 'admin' ? '#667eea' : '#6F4E37'};
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background-color: white;
            padding: 40px 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
          }
          .otp-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 25px;
            text-align: center;
            border-radius: 10px;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .otp-label {
            color: rgba(255,255,255,0.9);
            font-size: 14px;
            margin-bottom: 10px;
          }
          .expiry {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .expiry strong {
            color: #D97706;
          }
          .warning {
            background-color: #FEE2E2;
            border-left: 4px solid #DC2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            color: #991B1B;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            font-size: 12px;
            color: #6B7280;
          }
          .footer a {
            color: ${userType === 'admin' ? '#667eea' : '#6F4E37'};
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <p class="greeting">Hello ${userName || 'there'},</p>
            
            <p>We received a request to reset your password for your ${userType === 'admin' ? 'Admin Panel' : 'CoffeePlease'} account.</p>
            
            <p>Use the following One-Time Password (OTP) to complete the password reset process:</p>
            
            <div class="otp-box">
              <div class="otp-label">YOUR OTP CODE</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry">
              <strong>⏰ Important:</strong> This code will expire in <strong>15 minutes</strong>.
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our team will never ask for your OTP.
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} CoffeePlease. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, message: 'Failed to send OTP email' };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};