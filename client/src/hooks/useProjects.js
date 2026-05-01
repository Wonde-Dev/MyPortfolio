import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/projects');
      
      // Compute type for each project based on which URL field is populated
      const projectsWithType = response.data.map(project => {
        let type = 'link'; // default
        if (project.image_url) type = 'image';
        else if (project.video_url) type = 'video';
        else if (project.audio_url) type = 'audio';
        else if (project.document_url) type = 'document';
        else if (project.github_url) type = 'github';
        else if (project.google_url) type = 'google';
        else if (project.live_url) type = 'link';
        return { ...project, type };
      });
      
      setProjects(projectsWithType);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (data, token) => {
    try {
      // Convert data to FormData if it contains FormData objects
      const isFormData = data instanceof FormData;
      
      let response;
      if (isFormData) {
        response = await api.post('/api/projects', data, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.post('/api/projects', data, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      await fetchProjects();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add project' };
    }
  };

  const updateProject = async (id, data, token) => {
    try {
      const isFormData = data instanceof FormData;
      
      let response;
      if (isFormData) {
        response = await api.put(`/api/projects/${id}`, data, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.put(`/api/projects/${id}`, data, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      await fetchProjects();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update project' };
    }
  };

  const deleteProject = async (id, token) => {
    try {
      await api.delete(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchProjects();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete project' };
    }
  };

  // File management functions
   const uploadFiles = async (projectId, files, token, options = {}) => {
     try {
       const formData = new FormData();
       files.forEach((file, index) => {
         formData.append('files', file.file);
         if (file.caption) formData.append(`caption[${index}]`, file.caption);
         if (file.isFeatured) formData.append(`is_featured[${index}]`, 'true');
       });
       if (options.type) formData.append('type', options.type);

       const response = await api.post(`/api/projects/${projectId}/files/bulk`, formData, {
         headers: { 
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'multipart/form-data'
         }
       });

       return { success: true, data: response.data };
     } catch (err) {
       return { success: false, error: err.response?.data?.message || 'Failed to upload files' };
     }
   };

  const deleteFile = async (projectId, fileId, token) => {
    try {
      await api.delete(`/api/projects/${projectId}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete file' };
    }
  };

  const reorderFiles = async (projectId, fileOrder, token) => {
    try {
      await api.post(`/api/projects/${projectId}/files/reorder`, { fileOrder }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to reorder files' };
    }
  };

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    fetchProjects,
    uploadFiles,
    deleteFile,
    reorderFiles
  };
};
