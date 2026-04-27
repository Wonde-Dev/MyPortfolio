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
      setProjects(response.data);
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

  const addProject = async (projectData, token) => {
    try {
      const response = await api.post('/api/projects', projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchProjects();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const updateProject = async (id, projectData, token) => {
    try {
      const response = await api.put(`/api/projects/${id}`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
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