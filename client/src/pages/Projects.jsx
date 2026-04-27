import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Image,
  Video,
  Music,
  FileText,
  Link as LinkIcon,
  Trash2,
  Edit,
  Upload,
  Github,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";

/* ---------------- TYPES ---------------- */
const TYPES = {
  all: "all",
  image: "image",
  video: "video",
  audio: "audio",
  document: "document",
  link: "link",
  github: "github",
  google: "google",
};

/* ---------------- NAV ITEMS ---------------- */
const tabs = [
  { key: "all", label: "All", icon: <Plus size={16} /> },
  { key: "image", label: "Images", icon: <Image size={16} /> },
  { key: "video", label: "Videos", icon: <Video size={16} /> },
  { key: "audio", label: "Audio", icon: <Music size={16} /> },
  { key: "document", label: "Docs", icon: <FileText size={16} /> },
  { key: "link", label: "Links", icon: <LinkIcon size={16} /> },
  { key: "github", label: "GitHub", icon: <Github size={16} /> },
  { key: "google", label: "Google", icon: <Globe size={16} /> },
];

/* ---------------- MAIN ---------------- */
export default function Projects() {
  const { getThemeStyles } = useTheme();
  const theme = getThemeStyles();
  const { user, isAdmin } = useAuth();
  const { projects, loading, error, addProject, deleteProject, updateProject } =
    useProjects();

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "image",
    url: "",
    contact_name: "",
    contact_email: "",
  });

  const admin = isAdmin?.() || false;
  const [activeTab, setActiveTab] = useState("all");

  /* ---------------- FILTER ---------------- */
  const filteredItems =
    activeTab === "all" ? projects : projects.filter((i) => i.type === activeTab);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      return toast.error("Title is required");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return toast.error("Authentication required");
    }

    // Helper to map type to URL field name
    const getUrlFieldName = (type) => {
      switch (type) {
        case 'image': return 'image_url';
        case 'video': return 'video_url';
        case 'audio': return 'audio_url';
        case 'document': return 'document_url';
        case 'link': return 'live_url';
        case 'github': return 'github_url';
        case 'google': return 'google_url';
        default: return 'url';
      }
    };

    try {
      setUploading(true);

      if (selectedFile) {
        // Build FormData with file (only for file types)
        const formData = new FormData();
        formData.append('type', form.type);
        formData.append('file', selectedFile);
        formData.append('title', form.title);
        formData.append('description', form.description || '');

        const result = editingItem
          ? await updateProject(editingItem.id, formData, token)
          : await addProject(formData, token);

        if (result.success) {
          toast.success(editingItem ? "Updated successfully" : "Added successfully");
          resetForm();
          setOpen(false);
        } else {
          toast.error(result.error || "Failed to save");
        }
      } else if (form.url || editingItem) {
        // URL provided or editing existing (preserve existing URL if not changed)
        const urlField = getUrlFieldName(form.type);
        const projectData = {
          title: form.title,
          description: form.description || '',
        };

        // Add URL if provided
        if (form.url) {
          projectData[urlField] = form.url;
        }

        // For github/google, require contact details
        if (form.type === 'github' || form.type === 'google') {
          if (!form.contact_name || !form.contact_email) {
            toast.error("Contact name and email are required");
            setUploading(false);
            return;
          }
          projectData.contact_name = form.contact_name;
          projectData.contact_email = form.contact_email;
        }

        if (editingItem) {
          const result = await updateProject(editingItem.id, projectData, token);
          if (result.success) {
            toast.success("Updated successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.error || "Failed to update");
          }
        } else {
          const result = await addProject(projectData, token);
          if (result.success) {
            toast.success("Added successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.error || "Failed to add");
          }
        }
      } else {
        toast.error("Please provide a URL or upload a file");
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("An error occurred");
    } finally {
      setUploading(false);
    }
  };

    try {
      setUploading(true);

      if (selectedFile) {
        // Build FormData with file (type must come before file for multer)
        const formData = new FormData();
        formData.append('type', form.type);
        formData.append('file', selectedFile);
        formData.append('title', form.title);
        formData.append('description', form.description || '');

        const result = editingItem
          ? await updateProject(editingItem.id, formData, token)
          : await addProject(formData, token);

        if (result.success) {
          toast.success(editingItem ? "Updated successfully" : "Added successfully");
          resetForm();
          setOpen(false);
        } else {
          toast.error(result.error || "Failed to save");
        }
      } else if (form.url || editingItem) {
        // URL provided or editing existing (preserve existing URL if not changed)
        const urlField = getUrlFieldName(form.type);
        const projectData = {
          title: form.title,
          description: form.description || '',
        };

        // Only add URL if provided (for new items) or keep existing if editing without URL change
        if (form.url) {
          projectData[urlField] = form.url;
        }
        // For edit without URL change, we simply don't send the URL field (preserves existing)

        if (editingItem) {
          const result = await updateProject(editingItem.id, projectData, token);
          if (result.success) {
            toast.success("Updated successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.error || "Failed to update");
          }
        } else {
          const result = await addProject(projectData, token);
          if (result.success) {
            toast.success("Added successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.error || "Failed to add");
          }
        }
      } else {
        toast.error("Please provide a URL or upload a file");
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      return toast.error("Authentication required");
    }

    const result = await deleteProject(id, token);
    if (result.success) {
      toast.success("Deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const urlField =
      item.type === 'image' ? (item.image_url || item.url) :
      item.type === 'video' ? (item.video_url || item.url) :
      item.type === 'audio' ? (item.audio_url || item.url) :
      item.type === 'document' ? (item.document_url || item.url) :
      item.type === 'link' ? (item.live_url || item.url) :
      item.type === 'github' ? (item.github_url || item.url) :
      item.type === 'google' ? (item.google_url || item.url) : (item.url || '');

    setForm({
      title: item.title,
      description: item.description || "",
      type: item.type,
      url: urlField,
      contact_name: item.contact_name || "",
      contact_email: item.contact_email || "",
    });
    setSelectedFile(null);
    setFilePreview(null);
    setOpen(true);
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "image",
      url: "",
      contact_name: "",
      contact_email: "",
    });
    setEditingItem(null);
    setSelectedFile(null);
    setFilePreview(null);
  };

  const openAddModal = (type = null) => {
    const defaultType = type || (activeTab !== "all" ? activeTab : "image");
    resetForm();
    setForm((prev) => ({ ...prev, type: defaultType }));
    setOpen(true);
  };

  /* ---------------- FILE HANDLERS ---------------- */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processFile = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  /* ---------------- RENDER PREVIEW ---------------- */
  const getItemUrl = (item) => {
    switch (item.type) {
      case "image": return item.image_url || item.url;
      case "video": return item.video_url || item.url;
      case "audio": return item.audio_url || item.url;
      case "document": return item.document_url || item.url;
      case "link": return item.live_url || item.url;
      case "github": return item.github_url || item.url;
      case "google": return item.google_url || item.url;
      default: return item.url;
    }
  };

  const renderPreview = (item) => {
    const url = getItemUrl(item);

    switch (item.type) {
      case "image":
        return url ? (
          <img src={url} className="w-full h-40 object-cover rounded" alt={item.title} />
        ) : <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">No image</div>;

      case "video":
        return url ? (
          <video controls src={url} className="w-full rounded" />
        ) : <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">No video</div>;

      case "audio":
        return url ? (
          <audio controls src={url} className="w-full" />
        ) : <div className="text-gray-500">No audio</div>;

      case "document":
        return url ? (
          <a href={url} target="_blank" className="text-blue-500 flex items-center gap-2">
            <FileText size={16} /> Open Document
          </a>
        ) : <div className="text-gray-500">No document</div>;

      case "link":
        return url ? (
          <a href={url} target="_blank" className="text-green-500 flex items-center gap-2">
            <LinkIcon size={16} /> Visit Website
          </a>
        ) : <div className="text-gray-500">No link</div>;

      case "github":
        return url ? (
          <a href={url} target="_blank" className="text-gray-800 flex items-center gap-2">
            <Github size={16} /> View GitHub
          </a>
        ) : <div className="text-gray-500">No GitHub link</div>;

      case "google":
        return url ? (
          <a href={url} target="_blank" className="text-blue-500 flex items-center gap-2">
            <Globe size={16} /> Google
          </a>
        ) : <div className="text-gray-500">No Google link</div>;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-28 p-6 ${theme.bg} flex items-center justify-center`}>
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen pt-28 p-6 ${theme.bg} flex items-center justify-center`}>
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-28 p-6 ${theme.bg}`}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Media Hub</h1>

        {admin && (
          <button
            onClick={() => openAddModal()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Item
          </button>
        )}
      </div>

      {/* QUICK ADD BUTTONS */}
      {admin && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => openAddModal("image")}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <Image size={16} />
            Add Image
          </button>
          <button
            onClick={() => openAddModal("video")}
            className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            <Video size={16} />
            Add Video
          </button>
          <button
            onClick={() => openAddModal("audio")}
            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            <Music size={16} />
            Add Audio
          </button>
          <button
            onClick={() => openAddModal("document")}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
          >
            <FileText size={16} />
            Add Document
          </button>
          <button
            onClick={() => openAddModal("link")}
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
          >
            <LinkIcon size={16} />
            Add Link
          </button>
          <button
            onClick={() => openAddModal("github")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            <Github size={16} />
            Add GitHub
          </button>
          <button
            onClick={() => openAddModal("google")}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Globe size={16} />
            Add Google
          </button>
        </div>
      )}

      {/* NAVBAR TABS */}
      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
              activeTab === tab.key
                ? "bg-purple-600 text-white"
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow relative group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="font-bold">{item.title}</h2>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              {admin && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3">{renderPreview(item)}</div>
          </motion.div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No items found. Add one to get started!
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingItem ? "Edit Item" : "Add Media Item"}
                </h2>
                <button
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* TITLE */}
                <input
                  placeholder="Title"
                  className="w-full border p-2 mb-2 rounded dark:bg-gray-800 dark:border-gray-700"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />

                {/* DESCRIPTION */}
                <textarea
                  placeholder="Description"
                  className="w-full border p-2 mb-2 rounded dark:bg-gray-800 dark:border-gray-700"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />

                {/* TYPE SELECT */}
                <select
                  className="w-full border p-2 mb-2 rounded dark:bg-gray-800 dark:border-gray-700"
                  value={form.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setForm({ ...form, type: newType });
                    // Clear file when type changes (file may not match new type)
                    if (selectedFile) {
                      removeFile();
                    }
                    // Clear contact fields when not social
                    if (newType !== 'github' && newType !== 'google') {
                      setForm(prev => ({ ...prev, contact_name: "", contact_email: "" }));
                    }
                  }}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                  <option value="github">GitHub</option>
                  <option value="google">Google</option>
                </select>

                {/* FILE UPLOAD - hidden for link and social types */}
                {!['link', 'github', 'google'].includes(form.type) && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">
                      Upload File
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-purple-500 transition-colors"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        accept={
                          form.type === 'image' ? 'image/*' :
                          form.type === 'video' ? 'video/*' :
                          form.type === 'audio' ? 'audio/*' :
                          '.pdf,.doc,.docx,.txt'
                        }
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {filePreview ? (
                          <div className="relative">
                            {form.type === 'image' && (
                              <img src={filePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
                            )}
                            {form.type === 'video' && (
                              <video src={filePreview} className="max-h-40 mx-auto rounded" controls />
                            )}
                            {form.type === 'audio' && (
                              <div className="flex flex-col items-center">
                                <Music size={40} className="text-purple-500 mb-2" />
                                <audio src={filePreview} className="w-full" controls />
                              </div>
                            )}
                            {form.type === 'document' && (
                              <div className="text-sm text-gray-500 flex flex-col items-center">
                                <FileText size={40} className="mb-2" />
                                {selectedFile?.name}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                removeFile();
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <Upload className="mx-auto mb-2" size={24} />
                            <p>Click to upload or drag and drop</p>
                            <p className="text-xs mt-1">
                              {form.type === 'image' && 'PNG, JPG, GIF, WEBP'}
                              {form.type === 'video' && 'MP4, WEBM, MOV'}
                              {form.type === 'audio' && 'MP3, WAV, OGG'}
                              {form.type === 'document' && 'PDF, DOC, DOCX, TXT'}
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {/* URL INPUT */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    {form.type === 'link' ? 'Website URL' : 
                     form.type === 'github' ? 'GitHub Profile URL' :
                     form.type === 'google' ? 'Google Profile URL' :
                     'Or paste URL (optional if uploading file)'}
                  </label>
                  <input
                    placeholder={
                      form.type === 'link' ? 'https://example.com' :
                      form.type === 'github' ? 'https://github.com/username' :
                      form.type === 'google' ? 'https://plus.google.com/...' :
                      form.type === 'image' ? 'https://example.com/image.jpg' :
                      form.type === 'video' ? 'https://example.com/video.mp4' :
                      form.type === 'audio' ? 'https://example.com/audio.mp3' :
                      'https://example.com/doc.pdf'
                    }
                    className="w-full border p-2 mb-2 rounded dark:bg-gray-800 dark:border-gray-700"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                  />
                </div>

                {/* CONTACT FIELDS - required for social links */}
                {(form.type === 'github' || form.type === 'google') && (
                  <>
                    <input
                      placeholder="Contact Name"
                      className="w-full border p-2 mb-2 rounded dark:bg-gray-800 dark:border-gray-700"
                      value={form.contact_name}
                      onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                      required
                    />
                    <input
                      placeholder="Contact Email"
                      type="email"
                      className="w-full border p-2 mb-2 rounded dark:bg-gray-800 dark:border-gray-700"
                      value={form.contact_email}
                      onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                      required
                    />
                  </>
                )}

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                    className="flex-1 border p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:opacity-50"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : (editingItem ? "Update" : "Save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}