import { useState, useEffect } from 'react';
import api from '../api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
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
  };

  useEffect(() => {
    fetchProjects();
// eslint-disable-next-line react-hooks/set-state-in-effect -- Standard initialization
  }, []);

  const addProject = async (data, token) => {
    try {
      const isFormData = data instanceof FormData;
      
      const response = await api.post('/api/projects', data, {
        headers: isFormData 
          ? { Authorization: `Bearer ${token}` }
          : { Authorization: `Bearer ${token}` }
      });
      await fetchProjects();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const updateProject = async (id, data, token) => {
    try {
      const isFormData = data instanceof FormData;
      
      const response = await api.put(`/api/projects/${id}`, data, {
        headers: isFormData 
          ? { Authorization: `Bearer ${token}` }
          : { Authorization: `Bearer ${token}` }
      });
      await fetchProjects();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
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
      return { success: false, error: err.response?.data?.message };
    }
  };

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    fetchProjects
  };
};