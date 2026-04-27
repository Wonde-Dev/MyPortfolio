import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
   Mail, 
   Phone, 
   MapPin, 
   Heart 
  } from 'lucide-react'; // Keep lucide for basic icons

// Import from react-icons (more reliable for social media)
import { 
   FaGithub, 
   FaLinkedin, 
   FaTwitter, 
   FaInstagram,
   FaFacebook,
   FaYoutube 
  } from 'react-icons/fa';

import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
   const { t } = useLanguage();
   const { theme } = useTheme();
   const currentYear = new Date().getFullYear();

   const socialLinks = [
      { icon: FaGithub, url: 'https://github.com/wonde-dev', label: 'GitHub', color: 'hover:text-gray-900 dark:hover:text-white' },
      { icon: FaLinkedin, url: 'https://linkedin.com/in/wonde-tech2026', label: 'LinkedIn', color: 'hover:text-blue-600' },
      { icon: FaTwitter, url: 'https://twitter.com/wondwosen', label: 'Twitter', color: 'hover:text-blue-400' },
      { icon: FaInstagram, url: 'https://instagram.com/wondwosen', label: 'Instagram', color: 'hover:text-pink-600' },
   ];

  const quickLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.projects'), path: '/projects' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const services = [
    'Web Development',
    'UI/UX Design',
    'Video Editing',
    'Graphic Design',
    'API Development',
    'Database Design'
  ];

  return (
    <footer className={`relative ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} border-t border-gray-200 dark:border-gray-800`}>
      {/* Animated gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wondwosen
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Building exceptional digital experiences with code and creativity. 
              Full-Stack Developer & Creative Designer.
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 ${social.color}`}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

           {/* Quick Links */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             viewport={{ once: true }}
           >
             <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
             <ul className="space-y-2">
               {quickLinks.map((link, index) => (
                 <li key={link.path}>
                   <Link
                     to={link.path}
                     className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm"
                   >
                     {link.name}
                   </Link>
                 </li>
               ))}
               <li>
                 <Link
                   to="/login"
                   className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm"
                 >
                   Admin Login
                 </Link>
               </li>
             </ul>
           </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-gray-600 dark:text-gray-400 text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Get In Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 group">
                <Mail size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
                <a href="mailto:wondwosen@example.com" className="hover:text-purple-600 transition-colors">
                  wondwosen@example.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 group">
                <Phone size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
                <a href="tel:+251912345678" className="hover:text-purple-600 transition-colors">
                  +251 912 345 678
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={16} className="text-purple-600" />
                <span>Haramaya University, Ethiopia</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center gap-1">
            © {currentYear} Wondwosen Assegid. All rights reserved.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-2 flex items-center justify-center gap-1">
            Made with <Heart size={12} className="text-red-500 animate-pulse" /> using React, TailwindCSS & Node.js
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;