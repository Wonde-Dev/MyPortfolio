import pool from '../config/database.js';
import models from '../models/index.js';
import { sendContactEmails } from '../utils/emailService.js';
import { logger } from '../utils/logger.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import { formatResponse } from '../utils/helpers.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';

export const submitContact = catchAsync(async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // Handle file uploads
  const attachments = req.files || [];
  const attachmentNames = attachments.map(file => file.originalname);
  
  // Save to database
  await models.Contact.create({
    name, 
    email, 
    subject, 
    message,
    attachments: attachmentNames.length > 0 ? attachmentNames : null
  });
  
  // Send email notifications
  const emailResult = await sendContactEmails({ 
    name, 
    email, 
    subject, 
    message,
    attachments: attachmentNames 
  });
  
  if (!emailResult.adminEmailSent) {
    logger.warn('Admin email notification failed', { name, email });
  }
  
  logger.info('New contact message received', { 
    from: email,
    attachments: attachmentNames,
    adminEmailSent: emailResult.adminEmailSent,
    userEmailSent: emailResult.userEmailSent
  });
  
  res.status(HTTP_STATUS.CREATED).json(
    formatResponse(true, RESPONSE_MESSAGES.EMAIL_SENT, {
      emailSent: emailResult.userEmailSent,
      attachments: attachmentNames
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