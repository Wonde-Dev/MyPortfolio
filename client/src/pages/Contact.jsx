import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader, CheckCircle, AlertTriangle, Upload, FileText, X } from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa6';
import api from '../api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState(false);
  const [formSubmitError, setFormSubmitError] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleLoginType, setGoogleLoginType] = useState('');
  const { getThemeStyles } = useTheme();
  const themeStyles = getThemeStyles();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setFormSubmitSuccess(false);
      setFormSubmitError(null);
      
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('subject', formData.subject);
        formDataToSend.append('message', formData.message);
        attachedFiles.forEach(file => formDataToSend.append('attachments', file));
        
        await api.postForm('/api/contact', formDataToSend);
        
        setFormSubmitSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setAttachedFiles([]);
     } catch (err) {
       console.error(err);
       setFormSubmitError('Failed to send message. Please try again.');
     }
    };

   const handleGoogleLogin = async (provider) => {
     setGoogleLoginType(provider);
     setGoogleLoading(true);
     try {
       const user = {
         email: formData.email || 'guest@example.com',
         name: formData.name || 'Guest User',
         avatar: null
       };
       
       const res = await api.post('/api/auth/google', user);
       localStorage.setItem('token', res.data.token);
       localStorage.setItem('user', JSON.stringify(res.data.user));
       toast.success(`${provider === 'google' ? 'Google' : 'GitHub'} login successful! You can now submit your message.`);
     } catch (err) {
       console.error(err);
       setFormSubmitError('Failed to send message. Please try again.');
     } finally {
       setGoogleLoading(false);
     }
   };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    files.forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 50MB)`);
        return;
      }
    });
    
    setAttachedFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`min-h-screen pt-24 ${themeStyles.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-12"
         >
           <h1 className="text-5xl font-bold mb-4">Get In Touch</h1>
           <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto"></div>
           <p className="text-gray-600 dark:text-gray-300 mt-4">Have a project in mind? Let's work together!</p>
         </motion.div>

            <div className="grid gap-8">
                {/* Form Status Messages */}
                {isSubmitting && (
                  <div className="mb-4">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg shadow-md"
                    >
                      <Loader className="animate-spin" size={20} className="text-blue-500" />
                      <span>Sending your message...</span>
                    </motion.div>
                  </div>
                )}
                
                {formSubmitSuccess && (
                  <div className="mb-4">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-4 py-2 bg-green-50 dark:bg-green-900/50 rounded-lg shadow-md"
                    >
                      <CheckCircle size={20} className="text-green-500" />
                      <span>Message sent successfully! I'll get back to you soon.</span>
                    </motion.div>
                  </div>
                )}
                
                {formSubmitError && (
                  <div className="mb-4">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-4 py-2 bg-red-50 dark:bg-red-900/50 rounded-lg shadow-md"
                    >
                      <AlertTriangle size={20} className="text-red-500" />
                      <span>{formSubmitError}</span>
                    </motion.div>
                  </div>
                )}
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
            <div className={`${themeStyles.card} rounded-2xl p-8`}>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Mail className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium">wondwosen@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Phone className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium">+251 912 345 678</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <MapPin className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium">Haramaya University, Ethiopia</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Quick Login</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleGoogleLogin('google')}
                    disabled={!formData.email || googleLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaGoogle size={22} className="text-red-500" />
                    {googleLoading && googleLoginType === 'google' ? 'Logging in...' : 'Continue with Google'}
                  </button>
                  
                  <button
                    onClick={() => handleGoogleLogin('github')}
                    disabled={!formData.email || googleLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaGithub size={22} />
                    {googleLoading && googleLoginType === 'github' ? 'Logging in...' : 'Continue with GitHub'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Quick login to submit contact form
                </p>
              </div>


            </div>

             <div className={`${themeStyles.card} rounded-2xl p-8`}>
               <h2 className="text-2xl font-bold mb-4">Follow Me</h2>
               <div className="flex gap-4">
                 {['https://github.com/wondwosen', 'https://linkedin.com/in/wondwosen', 'https://twitter.com/wondwosen', 'https://instagram.com/wondwosen'].map((social, i) => (
                   <a key={social} href={social} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                     <span className="text-purple-600">{['GitHub', 'LinkedIn', 'Twitter', 'Instagram'][i][0]}</span>
                   </a>
                 ))}
               </div>
            </div>
           </motion.div>
           
           <motion.div
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             className={`${themeStyles.card} rounded-2xl p-8`}
           >
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
               <div>
                 <label className="block text-sm font-medium mb-2 flex justify-between">
                   <span>Message</span>
                   <span className="text-xs text-gray-500 dark:text-gray-400">{formData.message.length}/500</span>
                 </label>
                 <textarea
                   rows="5"
                   value={formData.message}
                   onChange={(e) => {
                     const value = e.target.value;
                     if (value.length <= 500) { // Limit to 500 characters
                       setFormData({...formData, message: value});
                     }
                   }}
                   className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   required
                   maxLength="500"
                 ></textarea>
               </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

  );
};

export default Contact;