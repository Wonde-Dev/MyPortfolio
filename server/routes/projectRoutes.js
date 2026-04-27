import express from 'express';
import multer from 'multer';
import path from 'path';
import { getProjects, getProject, getProjectBySlug, createProject, updateProject, deleteProject, getCategories } from '../controllers/projectController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'images';
    let folder = 'images';
    if (type === 'video') folder = 'videos';
    else if (type === 'audio') folder = 'audio';
    else if (type === 'document') folder = 'documents';
    cb(null, path.join(process.cwd(), 'uploads', folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const type = req.body.type;
    let allowedTypes = [];
    
    if (type === 'image') allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    else if (type === 'video') allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    else if (type === 'audio') allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    else if (type === 'document') allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for ' + type));
    }
  }
});

router.get('/', getProjects);
router.get('/categories', getCategories);
router.get('/slug/:slug', getProjectBySlug);
router.get('/:id', getProject);

// Create/Update with optional file upload
router.post('/', authenticateToken, isAdmin, upload.single('file'), createProject);
router.put('/:id', authenticateToken, isAdmin, upload.single('file'), updateProject);

router.delete('/:id', authenticateToken, isAdmin, deleteProject);

export default router;
