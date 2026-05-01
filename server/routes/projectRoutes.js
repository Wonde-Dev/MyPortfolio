import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getProjects, getProject, getProjectBySlug, createProject, updateProject, deleteProject, getCategories,
  getProjectFiles, addProjectFile, bulkUploadFiles, updateProjectFile, deleteProjectFile, reorderProjectFiles, bulkDeleteFiles
} from '../controllers/projectController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Ensure upload directories exist
const uploadsBase = path.join(process.cwd(), 'uploads');
const folders = ['images', 'videos', 'audio', 'documents', 'others'];

folders.forEach(folder => {
  const dir = path.join(uploadsBase, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for single file uploads (legacy)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'images';
    let folder = 'images';
    if (type === 'video') folder = 'videos';
    else if (type === 'audio') folder = 'audio';
    else if (type === 'document') folder = 'documents';
    else if (type === 'other') folder = 'others';
    const uploadDir = path.join(uploadsBase, folder);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 20 // max 20 files per request
  },
  fileFilter: (req, file, cb) => {
    const type = req.body.type;
    let allowedTypes = [];
    
    if (type === 'image') allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    else if (type === 'video') allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    else if (type === 'audio') allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'];
    else if (type === 'document') allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'];
    else allowedTypes = ['*/*']; // other - accept any
    
    if (allowedTypes.includes('*/*') || allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${type}. Allowed: ${allowedTypes.join(', ')}`));
    }
  }
});

// Configure multer for multiple file uploads
const multiUpload = multer({
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024,
    files: 50 // max 50 files total
  },
  fileFilter: upload.fileFilter
});

router.get('/', getProjects);
router.get('/categories', getCategories);
router.get('/slug/:slug', getProjectBySlug);
router.get('/:id', getProject);

// Project files endpoints
router.get('/:projectId/files', getProjectFiles);
router.post('/:projectId/files', authenticateToken, isAdmin, upload.single('file'), addProjectFile);
router.post('/:projectId/files/bulk', authenticateToken, isAdmin, multiUpload.array('files', 50), bulkUploadFiles);
router.put('/:projectId/files/:fileId', authenticateToken, isAdmin, updateProjectFile);
router.delete('/:projectId/files/:fileId', authenticateToken, isAdmin, deleteProjectFile);
router.post('/:projectId/files/reorder', authenticateToken, isAdmin, reorderProjectFiles);
router.delete('/:projectId/files/bulk', authenticateToken, isAdmin, bulkDeleteFiles);

// Project CRUD (legacy single file support still works)
router.post('/', authenticateToken, isAdmin, upload.single('file'), createProject);
router.put('/:id', authenticateToken, isAdmin, upload.single('file'), updateProject);
router.delete('/:id', authenticateToken, isAdmin, deleteProject);

export default router;
