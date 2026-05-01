import pool from '../config/database.js';
import models from '../models/index.js';
import { sendContactEmails, sendEmail } from '../utils/emailService.js';
import { logger } from '../utils/logger.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';

export const submitContact = catchAsync(async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // If user is authenticated, use their email for sending
  const senderEmail = req.user?.email || email;
  const senderName = req.user?.full_name || name;
  
  // Handle file uploads
  const attachments = req.files || [];
  const attachmentNames = attachments.map(file => file.originalname);
  
  // Save to database
  const contactId = await models.Contact.create({
    name: senderName, 
    email: senderEmail, 
    subject, 
    message,
    attachments: attachmentNames.length > 0 ? attachmentNames : null
  });
  
  // Send email notifications
  const emailResult = await sendContactEmails({ 
    name: senderName, 
    email: senderEmail, 
    subject, 
    message,
    attachments: attachmentNames 
  });
  
  if (!emailResult.adminEmailSent) {
    logger.warn('Admin email notification failed', { name: senderName, email: senderEmail });
  }
  
  logger.info('New contact message received', { 
    from: senderEmail,
    attachments: attachmentNames,
    adminEmailSent: emailResult.adminEmailSent,
    userEmailSent: emailResult.userEmailSent
  });
  
  res.status(HTTP_STATUS.CREATED).json(
    formatResponse(true, RESPONSE_MESSAGES.EMAIL_SENT, {
      emailSent: emailResult.adminEmailSent,
      attachments: attachmentNames,
      messageId: contactId
    })
  );
});

export const getMessages = catchAsync(async (req, res) => {
  const [messages] = await pool.query(
    'SELECT * FROM contact_messages ORDER BY created_at DESC'
  );
  
  res.status(HTTP_STATUS.OK).json(
    formatResponse(true, RESPONSE_MESSAGES.FETCHED_SUCCESS, messages)
  );
});

export const getMessageById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const [messages] = await pool.query(
    'SELECT * FROM contact_messages WHERE id = ?',
    [id]
  );
  
  if (messages.length === 0) {
    throw new AppError(RESPONSE_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  
  res.status(HTTP_STATUS.OK).json(
    formatResponse(true, RESPONSE_MESSAGES.FETCHED_SUCCESS, messages[0])
  );
});

export const updateMessageStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const [result] = await pool.query(
    'UPDATE contact_messages SET status = ? WHERE id = ?',
    [status, id]
  );
  
  if (result.affectedRows === 0) {
    throw new AppError(RESPONSE_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  
  res.status(HTTP_STATUS.OK).json(
    formatResponse(true, RESPONSE_MESSAGES.UPDATED_SUCCESS)
  );
});

// Reply to a contact message - admin function
export const replyToMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { replySubject, replyMessage } = req.body;
  
  // Get the original message
  const [messages] = await pool.query(
    'SELECT * FROM contact_messages WHERE id = ?',
    [id]
  );
  
  if (messages.length === 0) {
    throw new AppError(RESPONSE_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  
  const originalMessage = messages[0];
  
  // Send reply email to the user
  const replyHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Reply to Your Message</h2>
        </div>
        <div class="content">
          <p>Hello ${originalMessage.name},</p>
          <p>${replyMessage.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><strong>Your original message:</strong></p>
          <p><em>${originalMessage.message.replace(/\n/g, '<br>')}</em></p>
          <p>Best regards,<br>Wondwosen Assegid</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Wondwosen Assegid</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const emailResult = await sendEmail({
    to: originalMessage.email,
    subject: replySubject || `Re: ${originalMessage.subject}`,
    html: replyHtml
  });
  
  if (emailResult.success) {
    // Update message status to replied
    await pool.query(
      'UPDATE contact_messages SET status = ?, reply_message = ?, replied_at = NOW() WHERE id = ?',
      ['replied', replyMessage, id]
    );
    
    logger.info(`Reply sent to ${originalMessage.email} for message #${id}`);
  }
  
  res.status(HTTP_STATUS.OK).json(
    formatResponse(
      emailResult.success, 
      emailResult.success ? 'Reply sent successfully' : 'Failed to send reply',
      { emailSent: emailResult.success }
    )
  );
});