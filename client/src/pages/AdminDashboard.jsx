import React, { useState, useEffect } from 'react';
import { Users, FolderGit2, Mail, LogOut, Edit, Trash2, Eye } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ projects: 0, messages: 0 });
  const navigate = useNavigate();
  const { getThemeStyles } = useTheme();
  const themeStyles = getThemeStyles();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projectsRes = await api.get('/api/projects');
      setProjects(projectsRes.data);
      setStats(prev => ({ ...prev, projects: projectsRes.data.length }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    const token = localStorage.getItem('token');
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Project deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Error deleting project');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className={`min-h-screen pt-24 ${themeStyles.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold"
          >
            Admin Dashboard
          </motion.h1>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={20} /> Logout
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: <FolderGit2 size={24} />, label: 'Total Projects', value: stats.projects, color: 'from-blue-500 to-cyan-500' },
            { icon: <Mail size={24} />, label: 'Messages', value: stats.messages, color: 'from-purple-500 to-pink-500' },
            { icon: <Users size={24} />, label: 'Visitors', value: '1,234', color: 'from-green-500 to-emerald-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${themeStyles.card} rounded-xl p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          {['projects', 'messages', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Projects Table */}
        {activeTab === 'projects' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${themeStyles.card} rounded-xl overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Technologies</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{project.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {project.technologies?.split(',').map(tech => (
                            <span key={tech} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-3">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={18} />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteProject(project.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Messages Section */}
        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${themeStyles.card} rounded-xl p-6`}
          >
            <p className="text-center text-gray-500 py-8">No messages yet. Contact form submissions will appear here.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;