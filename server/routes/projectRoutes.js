import express from 'express';
import { getProjects, getProject, getProjectBySlug, createProject, updateProject, deleteProject, getCategories } from '../controllers/projectController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/categories', getCategories);
router.get('/slug/:slug', getProjectBySlug);
router.get('/:id', getProject);
router.post('/', authenticateToken, isAdmin, createProject);
router.put('/:id', authenticateToken, isAdmin, updateProject);
router.delete('/:id', authenticateToken, isAdmin, deleteProject);

export default router;