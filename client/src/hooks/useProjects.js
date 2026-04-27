import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/projects');
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
  }, []);

  const addProject = async (projectData, token) => {
    try {
      const response = await axios.post('http://localhost:5000/api/projects', projectData, {
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
      const response = await axios.put(`http://localhost:5000/api/projects/${id}`, projectData, {
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
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
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