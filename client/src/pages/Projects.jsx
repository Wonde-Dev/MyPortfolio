import React, { useEffect, useState } from 'react';
import { ExternalLink, Plus, Image, FileText, Video, Link as LinkIcon, Upload, X, Search } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newProject, setNewProject] = useState({
    title: '', description: '', long_description: '', technologies: '', 
    category: '', image_url: '', live_url: '', github_url: '', 
    demo_url: '', document_url: '', video_url: '',
    gallery_images: []
  });
  const [galleryUrls, setGalleryUrls] = useState(['']);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { slug } = useParams();
  const { getThemeStyles } = useTheme();
  const themeStyles = getThemeStyles();

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/projects/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleViewProject = async (projectSlug) => {
    try {
      const res = await api.get(`/api/projects/slug/${projectSlug}`);
      setSelectedProject(res.data);
      setShowDetailModal(true);
      setGalleryIndex(0);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

    useEffect(() => {
      async function loadData() {
        await fetchProjects();
        await fetchCategories();
        
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const user = JSON.parse(atob(token.split('.')[1]));
            if (user.role === 'admin') {
              setIsAdmin(true);
            }
          } catch (_error) {
            // Handle token parsing error
          }
        }
      }
      
      loadData();
    }, []); // Empty deps array is intentional for initial data fetch

    useEffect(() => {
      if (slug) {
        handleViewProject(slug).catch(error => {
          console.error('Error in handleViewProject effect:', error);
        });
      }
    }, [slug]); // Re-run when slug changes

  const handleAddProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const projectData = {
        ...newProject,
        gallery_images: galleryUrls.filter(url => url.trim() !== '')
      };
      await api.post('/api/projects', projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchProjects();
      setNewProject({
        title: '', description: '', long_description: '', technologies: '', 
        category: '', image_url: '', live_url: '', github_url: '', 
        demo_url: '', document_url: '', video_url: '',
        gallery_images: []
      });
      setGalleryUrls(['']);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate upload - in production, implement actual file upload to server
    setUploadFile(file);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Add to gallery or set as main image
          const url = URL.createObjectURL(file);
          if (!newProject.image_url) {
            setNewProject({...newProject, image_url: url});
          } else {
            setGalleryUrls([...galleryUrls.filter(u => u), url]);
          }
          setUploadFile(null);
          return 0;
        }
        return prev + 10;
      });
    }, 100);
  };

  const filteredProjects = projects.filter(project => {
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen pt-24 ${themeStyles.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold mb-4">My Projects</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Explore my portfolio of web development projects. Click on any project to view details, live demo, or GitHub repository.
            </p>
          </motion.div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg"
            >
              <Plus size={20} /> Add Project
            </motion.button>
          )}
        </div>

        {/* Search and Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Search Projects</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by title, description, or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              All Projects
            </button>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`${themeStyles.card} rounded-2xl overflow-hidden cursor-pointer group`}
              onClick={() => handleViewProject(project.slug)}
            >
              <div className="h-48 overflow-hidden">
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-4xl">🚀</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.title}</h3>
                  {project.featured && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies?.split(',').slice(0, 3).map((tech, idx) => (
                    <span key={`${tech}-${idx}`} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                  {project.technologies?.split(',').length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded text-xs">
                      +{project.technologies?.split(',').length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" 
                       className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors" 
                       title="View Live Site" onClick={e => e.stopPropagation()}>
                      <ExternalLink size={18} className="text-purple-600" />
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                       className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                       title="View GitHub" onClick={e => e.stopPropagation()}>
                      <FaGithub size={18} className="text-gray-600 dark:text-gray-400" />
                    </a>
                  )}
                  {project.demo_url && (
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
                       className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                       title="View Demo" onClick={e => e.stopPropagation()}>
                      <Video size={18} className="text-blue-500" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${themeStyles.card} rounded-2xl p-8 max-w-2xl w-full mx-auto my-8`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Project</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input type="text" placeholder="Project title" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input type="text" placeholder="Web Development, Mobile App, etc." value={newProject.category} onChange={(e) => setNewProject({...newProject, category: e.target.value})} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea placeholder="Short description" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800" rows="2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Long Description</label>
                <textarea placeholder="Detailed project description" value={newProject.long_description} onChange={(e) => setNewProject({...newProject, long_description: e.target.value})} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800" rows="3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Technologies (comma separated)</label>
                <input type="text" placeholder="React, Node.js, MongoDB" value={newProject.technologies} onChange={(e) => setNewProject({...newProject, technologies: e.target.value})} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Main Image URL</label>
                <div className="flex gap-2">
                  <input type="url" placeholder="https://..." value={newProject.image_url} onChange={(e) => setNewProject({...newProject, image_url: e.target.value})} className="flex-1 px-4 py-2 rounded-lg border dark:bg-gray-800" />
                  <button type="button" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => document.getElementById('fileUpload').click()}>
                    <Upload size={20} />
                  </button>
                  <input type="file" id="fileUpload" className="hidden" onChange={handleFileUpload} accept="image/*" />
                </div>
                {uploadFile && (
                  <div className="mt-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full transition-all" style={{width: `${uploadProgress}%`}}></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Uploading: {uploadFile.name}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gallery Images (optional)</label>
                {galleryUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="url" placeholder="https://..." value={url} onChange={(e) => {
                      const newUrls = [...galleryUrls];
                      newUrls[i] = e.target.value;
                      setGalleryUrls(newUrls);
                    }} className="flex-1 px-4 py-2 rounded-lg border dark:bg-gray-800" />
                    {galleryUrls.length > 1 && (
                      <button type="button" onClick={() => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setGalleryUrls([...galleryUrls, ''])} className="text-sm text-purple-600 hover:text-purple-700">
                  + Add another image
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Live URL</label>
                  <input type="url" placeholder="https://..." value={newProject.live_url} onChange={(e) => setNewProject({...newProject, live_url: e.target.value})} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">GitHub URL</label>
                  <input type="url" placeholder="https://github.com/..." value={newProject.github_url} onChange={(e) => setNewProject({...newProject, github_url: e.target.value})} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Demo URL</label>
                  <input type="url" placeholder="Video demo URL" value={newProject.demo_url} onChange={(e) => setNewProject({...newProject, demo_url: e.target.value})} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Document URL (PDF, Docs)</label>
                  <input type="url" placeholder="https://..." value={newProject.document_url} onChange={(e) => setNewProject({...newProject, document_url: e.target.value})} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Video URL</label>
                  <input type="url" placeholder="YouTube, Vimeo, etc." value={newProject.video_url} onChange={(e) => setNewProject({...newProject, video_url: e.target.value})} className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg">
                  Add Project
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Project Detail Modal */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${themeStyles.card} rounded-2xl p-8 max-w-4xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => { setShowDetailModal(false); navigate('/projects', { replace: true }); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X size={24} />
              </button>
            </div>
            
            {/* Gallery */}
            <div className="mb-6">
              <div className="relative h-80 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                {(selectedProject.gallery_images?.length > 0 || selectedProject.image_url) && (
                  <>
                    <motion.img
                      key={galleryIndex}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      src={selectedProject.gallery_images?.[galleryIndex] || selectedProject.image_url}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                    {selectedProject.gallery_images?.length > 1 && (
                      <>
                        <button onClick={() => setGalleryIndex((i) => (i > 0 ? i - 1 : i))} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
                          ←
                        </button>
                        <button onClick={() => setGalleryIndex((i) => (i < selectedProject.gallery_images.length - 1 ? i + 1 : i))} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70">
                          →
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {selectedProject.gallery_images.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i === galleryIndex ? 'bg-white' : 'bg-white/50'}`}></div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
                {!selectedProject.image_url && !selectedProject.gallery_images?.length && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🚀</span>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4">{selectedProject.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProject.technologies?.split(',').map(tech => (
                <span key={tech} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                  {tech.trim()}
                </span>
              ))}
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">{selectedProject.description}</p>
            
            {selectedProject.long_description && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">About This Project</h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{selectedProject.long_description}</p>
              </div>
            )}

            {/* Resource Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {selectedProject.live_url && (
                <a href={selectedProject.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all">
                  <ExternalLink size={24} />
                  <div>
                    <div className="font-semibold">Live Demo</div>
                    <div className="text-sm opacity-90">View Project Website</div>
                  </div>
                </a>
              )}
              {selectedProject.github_url && (
                <a href={selectedProject.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:shadow-lg transition-all">
                  <FaGithub size={24} />
                  <div>
                    <div className="font-semibold">Source Code</div>
                    <div className="text-sm opacity-90">View on GitHub</div>
                  </div>
                </a>
              )}
              {selectedProject.demo_url && (
                <a href={selectedProject.demo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all">
                  <Video size={24} />
                  <div>
                    <div className="font-semibold">Video Demo</div>
                    <div className="text-sm opacity-90">Watch Demo Video</div>
                  </div>
                </a>
              )}
              {selectedProject.document_url && (
                <a href={selectedProject.document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all">
                  <FileText size={24} />
                  <div>
                    <div className="font-semibold">Project Documentation</div>
                    <div className="text-sm opacity-90">Download/View Docs</div>
                  </div>
                </a>
              )}
              {selectedProject.video_url && (
                <a href={selectedProject.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all">
                  <Video size={24} />
                  <div>
                    <div className="font-semibold">Video Walkthrough</div>
                    <div className="text-sm opacity-90">YouTube / Vimeo</div>
                  </div>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;