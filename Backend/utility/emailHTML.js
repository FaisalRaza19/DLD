// HTML for email verification
const verificationEmailHTML = (code) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
        margin: 0;
      }
      .container {
        max-width: 600px;
        background-color: #ffffff;
        margin: 0 auto;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        text-align: center;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 20px;
      }
      .highlight {
        font-size: 20px;
        font-weight: bold;
        color: #3498db;
      }
      .code-box {
        font-size: 28px;
        letter-spacing: 6px;
        background: #f0f0f0;
        padding: 15px;
        border-radius: 8px;
        display: inline-block;
        margin: 20px 0;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">DLD (Digital Lawyer Diary)</div>
      <h2>Verify Your Email Address</h2>
      <p>Thank you for registering with <strong>DLD</strong>.<br>
      To complete your registration, please use the verification code below:</p>
      <div class="code-box">${code}</div>
      <p class="highlight">This code is valid for the next 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <div class="footer">
        &copy; ${new Date().getFullYear()} DLD. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

// html for reset password
const changePasswordEmail = (link) => {
  return `
        <h3>Password Reset Requested</h3>
      <p>Click the button below to reset your password:</p>
      <a href="${link}" style="display:inline-block;padding:10px 20px;background:#007BFF;color:#fff;
      text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>If you did not request this, you can ignore this email.</p>
    `
}

export { verificationEmailHTML, changePasswordEmail}