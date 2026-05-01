import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured. Emails will not be sent.');
    return null;
  }
  
  // For Gmail
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // For Outlook/Hotmail
  if (process.env.EMAIL_SERVICE === 'outlook') {
    return nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // For custom SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  // Contact form submission confirmation to admin
  adminNotification: (data) => ({
    subject: `New Contact Form Submission: ${data.subject || 'No Subject'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Message</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
          .value { background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          h2 { margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${data.email}</div>
            </div>
            ${data.subject ? `
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${data.subject}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p>This message was sent from your portfolio website contact form.</p>
            <p>Sent at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Auto-reply to user
  userAutoReply: (data) => ({
    subject: 'Thank you for contacting me!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Your Message</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .btn { display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          h2 { margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Reaching Out! 🙏</h2>
          </div>
          <div class="content">
            <p>Dear ${data.name},</p>
            <p>Thank you for contacting me. I have received your message and will get back to you as soon as possible (usually within 24-48 hours).</p>
            <p>Here's a copy of your message for your reference:</p>
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>Subject:</strong> ${data.subject || 'No Subject'}<br>
              <strong>Message:</strong><br>
              ${data.message.replace(/\n/g, '<br>')}
            </div>
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Check out my portfolio projects on my website</li>
              <li>Connect with me on social media</li>
              <li>Explore my GitHub repositories</li>
            </ul>
            <center>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="btn">Visit My Portfolio</a>
            </center>
            <p>Best regards,<br>
            <strong>Wondwosen Assegid</strong><br>
            Full-Stack Developer & Creative Designer</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wondwosen Assegid. All rights reserved.</p>
            <p>This is an automated response, please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Welcome email for new subscribers (if you add newsletter feature)
  welcomeSubscriber: (data) => ({
    subject: 'Welcome to My Newsletter! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to My Creative World! 🚀</h2>
          </div>
          <div class="content">
            <p>Hi ${data.name || 'there'},</p>
            <p>Thank you for subscribing to my newsletter! You'll now receive updates about:</p>
            <ul>
              <li>New projects and portfolio updates</li>
              <li>Development tips and tutorials</li>
              <li>Design insights and creative processes</li>
              <li>Special announcements and opportunities</li>
            </ul>
            <p>I'm excited to have you on this journey with me!</p>
            <p>Stay creative,<br>Wondwosen</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async ({ to, subject, html, from = process.env.EMAIL_USER, useAuthUser = false }) => {
  try {
    // Check if transporter is configured
    if (!transporter) {
      console.log(`📧 [SIMULATED] Email would be sent to ${to}: ${subject}`);
      return { success: true, messageId: 'simulated', simulated: true };
    }
    
    const mailOptions = {
      from: useAuthUser && from ? `"Wondwosen Assegid - From: ${from}" <${from}>` : `"Wondwosen Assegid" <${process.env.EMAIL_USER || from}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Send contact notification emails
const sendContactEmails = async (formData) => {
  try {
    // Send notification to admin (wondedev369@gmail.com) - if authenticated user has Gmail, send FROM their account
    const adminEmail = await sendEmail({
      to: process.env.ADMIN_EMAIL || 'wondedev369@gmail.com',
      subject: emailTemplates.adminNotification(formData).subject,
      html: emailTemplates.adminNotification(formData).html,
      from: formData.email && formData.email.endsWith('@gmail.com') ? formData.email : process.env.EMAIL_USER,
      useAuthUser: formData.email && formData.email.endsWith('@gmail.com')
    });

    // Send auto-reply to user
    const userEmail = await sendEmail({
      to: formData.email,
      subject: emailTemplates.userAutoReply(formData).subject,
      html: emailTemplates.userAutoReply(formData).html
    });

    return { 
      adminEmailSent: adminEmail.success, 
      userEmailSent: userEmail.success 
    };
  } catch (error) {
    console.error('Error sending contact emails:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'Test Email from Portfolio Server',
      html: '<h1>Test Successful!</h1><p>Your email configuration is working correctly.</p>'
    });
    
    if (result.success) {
      console.log('✅ Email configuration test successful');
    } else {
      console.error('❌ Email configuration test failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Email test error:', error);
    return { success: false, error: error.message };
  }
};

export { sendEmail, sendContactEmails, testEmailConfig, emailTemplates };