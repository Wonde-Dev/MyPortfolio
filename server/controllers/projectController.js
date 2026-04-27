import models from '../models/index.js';

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

    // Handle uploaded file
    if (req.file) {
      const fileUrl = `/uploads/${type}s/${req.file.filename}`;
      switch (type) {
        case 'image': projectData.image_url = fileUrl; break;
        case 'video': projectData.video_url = fileUrl; break;
        case 'audio': projectData.audio_url = fileUrl; break;
        case 'document': projectData.document_url = fileUrl; break;
        case 'github': projectData.github_url = fileUrl; break;
        case 'google': projectData.google_url = fileUrl; break;
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

    // Handle uploaded file
    if (req.file) {
      const fileUrl = `/uploads/${type}s/${req.file.filename}`;
      switch (type) {
        case 'image': projectData.image_url = fileUrl; break;
        case 'video': projectData.video_url = fileUrl; break;
        case 'audio': projectData.audio_url = fileUrl; break;
        case 'document': projectData.document_url = fileUrl; break;
        case 'github': projectData.github_url = fileUrl; break;
        case 'google': projectData.google_url = fileUrl; break;
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
    const deleted = await models.Project.delete(req.params.id);
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
