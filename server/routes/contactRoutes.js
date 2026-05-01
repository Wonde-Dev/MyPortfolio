import express from 'express';
import { submitContact, getMessages, updateMessageStatus, getMessageById, replyToMessage } from '../controllers/contactController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.get('/', getMessages);
router.get('/:id', getMessageById);
router.post('/', upload.array('attachments', 10), submitContact);
router.put('/:id', authenticateToken, isAdmin, updateMessageStatus);
router.post('/:id/reply', authenticateToken, isAdmin, replyToMessage);

export default router;