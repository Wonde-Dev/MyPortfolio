import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader, CheckCircle, AlertTriangle, Upload, FileText, X, User, Lock, LogOut, Check } from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa6';
import api from '../api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState(false);
  const [formSubmitError, setFormSubmitError] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [authMethod, setAuthMethod] = useState('direct'); // 'direct', 'google', 'github'
  const [oauthLoading, setOauthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authProvider, setAuthProvider] = useState(null);
  const { getThemeStyles } = useTheme();
  const themeStyles = getThemeStyles();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const provider = localStorage.getItem('authProvider');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setAuthProvider(provider);
        setAuthMethod(provider); // Set auth method to the provider used
        setIsAuthenticated(true);

        // Prefill form with user data
        setFormData({
          name: user.full_name || user.username || '',
          email: user.email || '',
          subject: '',
          message: ''
        });
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authProvider');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authProvider');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthProvider(null);
    setAuthMethod('direct');
    setFormData({ name: '', email: '', subject: '', message: '' });
    toast.success('Logged out successfully');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.length > 500) {
      errors.message = 'Message must be 500 characters or less';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    setFormSubmitSuccess(false);
    setFormSubmitError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('authMethod', authMethod);
      attachedFiles.forEach(file => formDataToSend.append('attachments', file));

      await api.post('/api/contact', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setAttachedFiles([]);
      toast.success('Message sent successfully!');

      // If authenticated, logout after sending or keep for further messages?
      // For now, keep authenticated
    } catch (error) {
      setFormSubmitError(error.response?.data?.message || 'Failed to send message. Please try again.');
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    setOauthLoading(true);
    setAuthMethod(provider);
    // Redirect to OAuth endpoint on backend server
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/${provider}`;
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'google':
        return <FaGoogle className="w-5 h-5 text-[#DB4437]" />;
      case 'github':
        return <FaGithub className="w-5 h-5 text-white" />;
      default:
        return null;
    }
  };

  const getProviderName = (provider) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      default:
        return 'Direct';
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'google':
        return 'bg-gradient-to-r from-blue-500 to-red-500';
      case 'github':
        return 'bg-gradient-to-r from-gray-800 to-gray-900';
      default:
        return 'bg-gradient-to-r from-purple-600 to-pink-600';
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 50 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'text/plain', 'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/zip', 'application/x-zip-compressed'
    ];

    const validFiles = [];
    files.forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 50MB)`);
        return;
      }
      const fileType = file.type || '';
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return fileType.startsWith(baseType);
        }
        return fileType === type || file.name.toLowerCase().endsWith(type.replace('application/', '.'));
      });
      if (!isAllowed && fileType !== '') {
        toast.error(`${file.name} has an unsupported file type`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added`);
    }
    if (e.target) e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className={`min-h-screen ${themeStyles.bg} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 px-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-4 px-4 py-2 rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50"
          >
            <Mail className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Get in Touch</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700">
            Let's Talk
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Have a project in mind or just want to say hello? I'd love to hear from you.
            {isAuthenticated && ` You're signed in with ${getProviderName(authProvider)}.`}
            Drop me a message and let's create something amazing together.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto px-4 pb-12">
          {/* Auth Method Selection Cards - Only show if not authenticated */}
          {!isAuthenticated && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-3 gap-6 mb-12"
            >
              {/* Direct Message Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAuthMethod('direct')}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 group ${authMethod === 'direct'
                    ? 'bg-white dark:bg-gray-800 shadow-2xl shadow-purple-500/20 border-2 border-purple-500 scale-105'
                    : 'bg-white/50 dark:bg-gray-800/50 shadow-lg border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${authMethod === 'direct' ? 'bg-purple-500 scale-100' : 'bg-gray-200 dark:bg-gray-700 scale-0'}">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:shadow-lg transition-all">
                  <User className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Direct Message</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Send me a message directly with your details.</p>
                {authMethod === 'direct' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full"
                  />
                )}
              </motion.div>

              {/* Google OAuth Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthLogin('google')}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 group ${oauthLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="text-xs text-gray-400">via</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-4 group-hover:shadow-lg transition-all border border-gray-200">
                  <FaGoogle className="w-7 h-7 text-[#DB4437]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Continue with Google</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Sign in with your Google account securely.</p>
                <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Secure OAuth 2.0</span>
                </div>
              </motion.div>

              {/* GitHub OAuth Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthLogin('github')}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 group ${oauthLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="text-xs text-gray-400">via</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-[#1a1a1a] flex items-center justify-center mb-4 group-hover:shadow-lg transition-all">
                  <FaGithub className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Continue with GitHub</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Authenticate via GitHub and share your details.</p>
                <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Secure OAuth 2.0</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Authenticated User Summary */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <div className={`${themeStyles.card} rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full ${getProviderColor(authProvider)} flex items-center justify-center`}>
                      {currentUser?.avatar_url ? (
                        <img src={currentUser.avatar_url} alt={currentUser.full_name || currentUser.username} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        getProviderIcon(authProvider)
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentUser?.full_name || currentUser?.username}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        {currentUser?.email}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 capitalize">
                          via {authProvider}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>

              {/* Quick Send Section for Authenticated Users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${themeStyles.card} rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20 dark:border-gray-700/50 mt-6`}
              >
                <div className="text-center mb-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${getProviderColor(authProvider)} mb-4`}>
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    Send a Quick Message
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    You're authenticated. Just add your message and hit send.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-4 transition-all ${formErrors.subject ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500/20 focus:border-purple-500'}`}
                      placeholder="Project inquiry / Collaboration / Job opportunity..."
                      required
                    />
                    {formErrors.subject && <p className="text-red-500 text-sm mt-1 ml-1">{formErrors.subject}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="5"
                      value={formData.message}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 500) {
                          setFormData({...formData, message: value});
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-4 transition-all resize-none ${formErrors.message ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500/20 focus:border-purple-500'}`}
                      placeholder="Tell me about your project, timeline, and any specific requirements..."
                      required
                      maxLength="500"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm ${formErrors.message ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formData.message.length}/500 characters
                      </span>
                      {formErrors.message && <p className="text-red-500 text-sm">{formErrors.message}</p>}
                    </div>
                  </div>

                  {/* File Upload - Optional for authenticated users too */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Attach Files (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 transition-all hover:border-purple-400 dark:hover:border-purple-500 group">
                      <input
                        type="file"
                        id="fileUploadAuth"
                        className="hidden"
                        onChange={handleFileUpload}
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.mp3,.wav,.ogg,.zip,.xlsx,.xls,.ppt,.pptx"
                      />
                      <label
                        htmlFor="fileUploadAuth"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-purple-500" />
                        </div>
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Click to upload
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          PDF, DOC, Images, Videos, Audio<br />
                          <span className="text-purple-500 dark:text-purple-400">Max 50MB per file</span>
                        </span>
                      </label>
                    </div>

                    {/* File Preview */}
                    {attachedFiles.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 space-y-2"
                      >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {attachedFiles.length} file(s) selected
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {attachedFiles.map((file, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                            >
                              <FileText className="w-4 h-4 text-purple-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {(file.size / 1024).toFixed(1)}KB
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="text-red-500 hover:text-red-700 ml-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/30'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        Send Message
                      </>
                    )}
                  </motion.button>

                  {/* Info Text */}
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Your message will be sent to{' '}
                    <span className="text-purple-500 font-medium">wondedev369@gmail.com</span>
                  </p>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Direct Contact Form - Only show for non-authenticated users choosing direct method */}
          {!isAuthenticated && authMethod === 'direct' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <div className={`${themeStyles.card} rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 dark:border-gray-700/50`}>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    Send Your Message
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    I'll get back to you within 24 hours
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Success Message */}
                  {formSubmitSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300">Message sent successfully!</p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">I'll get back to you soon.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {formSubmitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-red-600 dark:text-red-400">{formSubmitError}</p>
                    </motion.div>
                  )}

                  {/* Name & Email Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-4 transition-all ${formErrors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500/20 focus:border-purple-500'}`}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      {formErrors.name && <p className="text-red-500 text-sm mt-1 ml-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-4 transition-all ${formErrors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500/20 focus:border-purple-500'}`}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      {formErrors.email && <p className="text-red-500 text-sm mt-1 ml-1">{formErrors.email}</p>}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-4 transition-all ${formErrors.subject ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500/20 focus:border-purple-500'}`}
                      placeholder="Project inquiry / Collaboration / Job opportunity..."
                      required
                    />
                    {formErrors.subject && <p className="text-red-500 text-sm mt-1 ml-1">{formErrors.subject}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="5"
                      value={formData.message}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 500) {
                          setFormData({...formData, message: value});
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-4 transition-all resize-none ${formErrors.message ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500/20 focus:border-purple-500'}`}
                      placeholder="Tell me about your project, timeline, and any specific requirements..."
                      required
                      maxLength="500"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm ${formErrors.message ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formData.message.length}/500 characters
                      </span>
                      {formErrors.message && <p className="text-red-500 text-sm">{formErrors.message}</p>}
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Attach CV or Files (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 transition-all hover:border-purple-400 dark:hover:border-purple-500 group">
                      <input
                        type="file"
                        id="fileUpload"
                        className="hidden"
                        onChange={handleFileUpload}
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.mp3,.wav,.ogg,.zip,.xlsx,.xls,.ppt,.pptx"
                      />
                      <label
                        htmlFor="fileUpload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-purple-500" />
                        </div>
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Click to upload
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          PDF, DOC, Images, Videos, Audio<br />
                          <span className="text-purple-500 dark:text-purple-400">Max 50MB per file</span>
                        </span>
                      </label>
                    </div>
                    
                    {/* File Preview */}
                    {attachedFiles.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 space-y-2"
                      >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {attachedFiles.length} file(s) selected
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {attachedFiles.map((file, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                            >
                              <FileText className="w-4 h-4 text-purple-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {(file.size / 1024).toFixed(1)}KB
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="text-red-500 hover:text-red-700 ml-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/30'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        Send Message
                      </>
                    )}
                  </motion.button>

                  {/* Info Text */}
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Your message will be sent to{' '}
                    <span className="text-purple-500 font-medium">wondedev369@gmail.com</span>
                  </p>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;