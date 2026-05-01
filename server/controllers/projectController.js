import models from '../models/index.js';

// ==================== PROJECTS ====================

export const getProjects = async (req, res) => {
  try {
    const projects = await models.Project.getAll(req.query);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await models.Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const project = await models.Project.findBySlug(req.params.slug);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // Increment view count
    await models.Project.incrementViews(project.id);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    // Extract type before sending to model (type is not a DB column)
    const { type, ...projectData } = req.body;

    // Handle single main image/file (legacy support)
    if (req.file) {
      const folderMap = {
        'image': 'images',
        'video': 'videos',
        'audio': 'audio',
        'document': 'documents'
      };
      const folder = folderMap[type] || 'images';
      const fileUrl = `/uploads/${folder}/${req.file.filename}`;
      
      switch (type) {
        case 'image': projectData.image_url = fileUrl; break;
        case 'video': projectData.video_url = fileUrl; break;
        case 'audio': projectData.audio_url = fileUrl; break;
        case 'document': projectData.document_url = fileUrl; break;
        default: projectData.image_url = fileUrl;
      }
    }

    const project = await models.Project.create(projectData);
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    // Extract type before sending to model
    const { type, ...projectData } = req.body;

    // Handle single main image/file (legacy support)
    if (req.file) {
      const folderMap = {
        'image': 'images',
        'video': 'videos',
        'audio': 'audio',
        'document': 'documents'
      };
      const folder = folderMap[type] || 'images';
      const fileUrl = `/uploads/${folder}/${req.file.filename}`;
      
      switch (type) {
        case 'image': projectData.image_url = fileUrl; break;
        case 'video': projectData.video_url = fileUrl; break;
        case 'audio': projectData.audio_url = fileUrl; break;
        case 'document': projectData.document_url = fileUrl; break;
        default: projectData.image_url = fileUrl;
      }
    }

    const updated = await models.Project.update(req.params.id, projectData);
    if (updated) {
      res.json({ message: 'Project updated successfully' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const deleted = await models.Project.remove(req.params.id);
    if (deleted) {
      res.json({ message: 'Project deleted successfully' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await models.Project.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PROJECT FILES ====================

// Get all files for a project
export const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type } = req.query;
    
    const files = await models.Project.getFiles(projectId, type);
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add file to project (single upload for legacy compatibility)
export const addProjectFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const type = req.body.type || 'image';
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const folderMap = {
      'image': 'images',
      'video': 'videos',
      'audio': 'audio',
      'document': 'documents',
      'other': 'others'
    };
    const folder = folderMap[type] || 'others';
    const fileUrl = `/uploads/${folder}/${req.file.filename}`;

    const fileData = {
      project_id: projectId,
      file_type: type,
      file_url: fileUrl,
      file_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      sort_order: 0,
      is_featured: false
    };

    const file = await models.Project.addFile(parseInt(projectId), fileData);
    res.status(201).json(file);
  } catch (error) {
    console.error('Add file error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Bulk upload files to project
export const bulkUploadFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const type = req.body.type || 'image';
    const caption = req.body.caption || '';
    const isFeatured = req.body.is_featured === 'true';
    
    const folderMap = {
      'image': 'images',
      'video': 'videos',
      'audio': 'audio',
      'document': 'documents',
      'other': 'others'
    };
    const folder = folderMap[type] || 'others';

    const uploadedFiles = [];
    
    for (const file of req.files) {
      const fileUrl = `/uploads/${folder}/${file.filename}`;
      
      const fileData = {
        project_id: projectId,
        file_type: type,
        file_url: fileUrl,
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        caption: caption || null,
        is_featured: isFeatured,
        sort_order: uploadedFiles.length
      };

      const saved = await models.Project.addFile(parseInt(projectId), fileData);
      uploadedFiles.push(saved);
    }

    res.status(201).json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update project file
export const updateProjectFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { caption, sort_order, is_featured } = req.body;
    
    const updates = {};
    if (caption !== undefined) updates.caption = caption;
    if (sort_order !== undefined) updates.sort_order = parseInt(sort_order);
    if (is_featured !== undefined) updates.is_featured = is_featured === true || is_featured === 'true';

    const updated = await models.Project.updateFile(fileId, updates);
    
    if (updated) {
      const file = await models.Project.getFile(fileId);
      res.json(file);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete project file
export const deleteProjectFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const deleted = await models.Project.deleteFile(fileId);
    
    if (deleted) {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reorder project files
export const reorderProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fileOrder } = req.body; // [{id: 1, sort_order: 0}, {id: 2, sort_order: 1}, ...]
    
    await models.Project.reorderFiles(projectId, fileOrder);
    res.json({ message: 'Files reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk delete project files
export const bulkDeleteFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fileIds } = req.body; // [1, 2, 3]
    
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ message: 'No file IDs provided' });
    }

    const deleted = await models.Project.deleteFiles(projectId, fileIds);
    res.json({ 
      message: `${deleted} file(s) deleted successfully`,
      deletedCount: deleted 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
