import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Image,
  Video,
  FileText,
  Trash2,
  Edit,
  Upload,
  File,
  FolderOpen,
  Star,
  Check
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";

// Skill categories with beautiful descriptions
const SKILLS = [
  {
    id: "web",
    title: "Web Development",
    description: "Modern, responsive websites built with cutting-edge technologies",
    icon: <FolderOpen size={32} className="text-purple-500" />,
    color: "from-purple-600 to-pink-600",
    gradient: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
  },
  {
    id: "app",
    title: "App Development",
    description: "Cross-platform mobile applications with intuitive user experiences",
    icon: <Image size={32} className="text-blue-500" />,
    color: "from-blue-600 to-cyan-600",
    gradient: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
  },
  {
    id: "graphics",
    title: "Graphics Design",
    description: "Stunning visual designs that capture attention and communicate effectively",
    icon: <Star size={32} className="text-yellow-500" />,
    color: "from-yellow-600 to-orange-600",
    gradient: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
  },
  {
    id: "video",
    title: "Video Editing",
    description: "Professional video content with cinematic effects and storytelling",
    icon: <Video size={32} className="text-red-500" />,
    color: "from-red-600 to-rose-600",
    gradient: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
  }
];

// Default portfolio samples - replace these with your own work
const DEFAULT_PORTFOLIOS = {
  web: [
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "Full-featured online store with payment integration",
      category: "web",
      type: "image",
      image_url: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop",
      featured: true
    },
    {
      id: 2,
      title: "Corporate Dashboard",
      description: "Analytics dashboard with real-time data visualization",
      category: "web",
      type: "image",
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      featured: false
    }
  ],
  app: [
    {
      id: 3,
      title: "Fitness Tracker App",
      description: "Mobile app for workout tracking and progress monitoring",
      category: "app",
      type: "image",
      image_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
      featured: true
    },
    {
      id: 4,
      title: "Task Management App",
      description: "Collaborative productivity app for teams",
      category: "app",
      type: "image",
      image_url: "https://images.unsplash.com/photo-1488616963235-4d3b2fc3f279?w=800&h=600&fit=crop",
      featured: false
    }
  ],
  graphics: [
    {
      id: 5,
      title: "Brand Identity Design",
      description: "Complete visual identity for modern tech startup",
      category: "graphics",
      type: "image",
      image_url: "https://images.unsplash.com/photo-1395950851940-d17e633a80df?w=800&h=600&fit=crop",
      featured: true
    },
    {
      id: 6,
      title: "Marketing Campaign Graphics",
      description: "Social media assets and promotional materials",
      category: "graphics",
      type: "image",
      image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
      featured: false
    }
  ],
  video: [
    {
      id: 7,
      title: "Product Launch Video",
      description: "Cinematic promotional video with motion graphics",
      category: "video",
      type: "video",
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-laptop-in-a-home-office-4311-large.mp4",
      image_url: "https://images.unsplash.com/photo-1574717024456-44405831228d?w=800&h=600&fit=crop",
      featured: true
    },
    {
      id: 8,
      title: "Corporate Overview Video",
      description: "Professional company introduction video",
      category: "video",
      type: "video",
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-city-26125-large.mp4",
      image_url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop",
      featured: false
    }
  ]
};

export default function Projects() {
  const { getThemeStyles } = useTheme();
  const theme = getThemeStyles();
  const { isAdmin } = useAuth();
  const {
    projects,
    loading,
    error,
    addProject,
    deleteProject,
    updateProject,
    uploadFiles
  } = useProjects();

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedProject, setExpandedProject] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [showCertificateUpload, setShowCertificateUpload] = useState(false);
  const fileInputRef = useRef(null);

  const admin = isAdmin?.() || false;

  // Filter projects by category/skill
  const filteredProjects = activeTab === "all"
    ? projects.length > 0 ? projects : Object.values(DEFAULT_PORTFOLIOS).flat()
    : projects.filter(p => p.category === activeTab || p.type === activeTab);

  // File preview cleanup
  useEffect(() => {
    return () => {
      selectedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, [selectedFiles]);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "web",
    type: "image",
    url: "",
    technologies: ""
  });

  const getUrlFieldName = (type) => {
    switch (type) {
      case "image": return "image_url";
      case "video": return "video_url";
      case "audio": return "audio_url";
      case "document": return "document_url";
      case "link": return "live_url";
      case "github": return "github_url";
      case "google": return "google_url";
      default: return "url";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) return toast.error("Title is required");
    if (!form.description?.trim()) return toast.error("Description is required");

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Authentication required");

    try {
      setUploading(true);

      const projectData = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        technologies: form.technologies?.trim() || "",
      };

      const urlField = getUrlFieldName(form.type);
      if (form.url?.trim()) projectData[urlField] = form.url.trim();

      let projectId = editingItem?.id;
      if (editingItem) {
        const result = await updateProject(editingItem.id, projectData, token);
        if (!result.success) throw new Error(result.error);
        projectId = editingItem.id;
      } else {
        const result = await addProject(projectData, token);
        if (!result.success) throw new Error(result.error);
        projectId = result.data?.id;
      }

      if (selectedFiles.length > 0 && projectId) {
        const filesToUpload = selectedFiles.map(f => ({
          file: f.file,
          caption: f.caption || "",
          isFeatured: f.isFeatured || false,
        }));
        const uploadResult = await uploadFiles(projectId, filesToUpload, token, {
          type: form.type,
        });
        if (!uploadResult.success) {
          console.warn("Files upload failed:", uploadResult.error);
          toast.warning("Project saved, but file upload had issues");
        }
      }

      toast.success(editingItem ? "Project updated successfully" : "Project created successfully");
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its files?")) return;
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Authentication required");
    const result = await deleteProject(id, token);
    if (result.success) toast.success("Project deleted successfully");
    else toast.error(result.error || "Failed to delete");
  };

  const handleEdit = async (project) => {
    setEditingItem(project);
    const urlField = project.image_url || project.video_url || project.audio_url || 
                     project.document_url || project.live_url || project.github_url || 
                     project.google_url || "";
    setForm({
      title: project.title,
      description: project.description || "",
      category: project.category || "web",
      type: project.type || "image",
      url: urlField,
      technologies: project.technologies || "",
    });
    if (project.id) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/projects/${project.id}/files`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const files = await response.json();
        setSelectedFiles(files);
      } catch (err) {
        console.error("Failed to load project files:", err);
      }
    }
    setOpen(true);
  };

  const resetForm = () => {
    setForm({ title: "", description: "", category: "web", type: "image", url: "", technologies: "" });
    setEditingItem(null);
    setSelectedFiles([]);
  };

  // File handling
  const processFiles = (files, defaultType) => {
    const maxSize = 50 * 1024 * 1024;
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/webm", "video/quicktime",
      "audio/mpeg", "audio/wav", "audio/ogg",
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain", "application/zip"
    ];
    const processed = [];
    files.forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 50MB)`);
        return;
      }
      const isAllowed = allowedTypes.some(type => 
        file.type.includes(type.split("/")[0]) || file.type === type
      );
      if (!isAllowed) {
        toast.error(`${file.name} has an unsupported file type`);
        return;
      }
      processed.push({
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        type: defaultType || getFileType(file),
        caption: "",
        isFeatured: false,
        name: file.name,
        size: file.size,
      });
    });
    if (processed.length > 0) {
      setSelectedFiles(prev => [...prev, ...processed]);
      toast.success(`${processed.length} file(s) added`);
    }
  };

  const getFileType = file => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.includes("pdf") || file.type.includes("document") || file.type.includes("text")) return "document";
    return "other";
  };

  const removeFile = index => {
    const file = selectedFiles[index];
    if (file.preview) URL.revokeObjectURL(file.preview);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Certificate handling
  const handleCertificateUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newCerts = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file,
      preview: file.type.startsWith("image/") || file.type.includes("pdf") 
        ? URL.createObjectURL(file) 
        : null,
      type: file.type
    }));
    setCertificates(prev => [...prev, ...newCerts]);
    toast.success(`${files.length} certificate(s) uploaded`);
    e.target.value = "";
  };

  const removeCertificate = (id) => {
    setCertificates(prev => {
      const cert = prev.find(c => c.id === id);
      if (cert?.preview) URL.revokeObjectURL(cert.preview);
      return prev.filter(c => c.id !== id);
    });
  };

  return (
    <div className={`min-h-screen pt-24 ${theme.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            My Skills & Portfolio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            I specialize in four key areas that help businesses grow and succeed in the digital world.
            Below you&apos;ll find examples of my work and professional credentials.
          </p>
        </motion.div>

        {/* Skill Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {SKILLS.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl p-6 ${skill.gradient} border border-gray-200 dark:border-gray-700 
                hover:shadow-xl transition-all duration-300 cursor-pointer group`}
              onClick={() => setActiveTab(activeTab === skill.id ? "all" : skill.id)}
            >
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  {skill.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{skill.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{skill.description}</p>
                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                    ${activeTab === skill.id 
                      ? "bg-white/20 text-gray-900 dark:text-white" 
                      : "bg-white/50 text-gray-700 dark:text-gray-300"}`}
                  >
                    {DEFAULT_PORTFOLIOS[skill.id]?.length || 0} Projects
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === "all"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"}`}
          >
            All Skills ({DEFAULT_PORTFOLIOS.web.length + DEFAULT_PORTFOLIOS.app.length + 
                        DEFAULT_PORTFOLIOS.graphics.length + DEFAULT_PORTFOLIOS.video.length})
          </button>
          {SKILLS.map(skill => (
            <button
              key={skill.id}
              onClick={() => setActiveTab(skill.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === skill.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"}`}
            >
              {skill.title}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`${theme.card} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl 
                  transition-all duration-300 cursor-pointer group`}
                onClick={() => admin && handleEdit(project)}
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {project.type === "video" ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Video size={48} className="text-gray-400" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  ) : (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {project.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{project.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Admin: Add Project */}
        {admin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-16"
          >
            <button
              onClick={() => { resetForm(); setOpen(true); }}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 
                rounded-2xl hover:border-purple-400 dark:hover:border-purple-500 
                transition-all duration-300 flex items-center justify-center gap-3
                group"
            >
              <Plus size={24} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
              <span className="text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors">
                Add New Project
              </span>
            </button>
          </motion.div>
        )}

        {/* Certificates Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-8 ${theme.card} border border-gray-200 dark:border-gray-700`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Professional Certificates
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Credentials and achievements that validate my expertise
              </p>
            </div>
            {admin && (
              <button
                onClick={() => setShowCertificateUpload(!showCertificateUpload)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white 
                  rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                {showCertificateUpload ? "Cancel" : "Upload Certificates"}
              </button>
            )}
          </div>

          {/* Certificate Upload */}
          {admin && showCertificateUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 
                  rounded-xl p-8 text-center hover:border-purple-400 dark:hover:border-purple-500
                  transition-colors cursor-pointer"
                onDrop={(e) => {
                  e.preventDefault();
                  handleCertificateUpload({ target: { files: e.dataTransfer.files } });
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  type="file"
                  id="certificate-upload"
                  className="hidden"
                  onChange={handleCertificateUpload}
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                />
                <label htmlFor="certificate-upload" className="cursor-pointer">
                  <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                    Click or drag certificates here to upload
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports: PDF, DOC, DOCX, JPG, PNG (max 50MB each)
                  </p>
                </label>
              </div>
            </motion.div>
          )}

          {/* Certificate Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {certificates.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                <FileText size={48} className="mx-auto mb-4" />
                <p>No certificates uploaded yet</p>
                {admin && <p className="text-sm mt-2">Upload certificates to showcase your achievements</p>}
              </div>
            ) : (
              certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative rounded-lg overflow-hidden ${theme.card} border group`}
                >
                  {cert.preview ? (
                    <img
                      src={cert.preview}
                      alt={cert.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <FileText size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {cert.name}
                    </p>
                  </div>
                  {admin && (
                    <button
                      onClick={() => removeCertificate(cert.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full 
                        opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Project Edit Modal */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
              onClick={() => { setOpen(false); resetForm(); }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingItem ? "Edit Project" : "New Project"}
                  </h2>
                  <button
                    onClick={() => { setOpen(false); resetForm(); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                        value={form.title}
                        onChange={e => setForm({...form, title: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                      >
                        {SKILLS.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">Portfolio Images/Videos</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="relative group">
                          {f.preview && f.type === 'image' ? (
                            <img src={f.preview} className="w-20 h-20 object-cover rounded" />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                              <File size={24} />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-purple-400 transition-colors"
                      onDrop={e => { e.preventDefault(); processFiles(Array.from(e.dataTransfer.files), form.type); }}
                      onDragOver={e => e.preventDefault()}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={e => processFiles(Array.from(e.target.files), form.type)}
                        multiple
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click or drag files to upload</p>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setOpen(false); resetForm(); }}
                      className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {uploading ? "Saving..." : "Save Project"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}