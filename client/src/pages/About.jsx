import React from 'react';
import { motion } from 'framer-motion';
import { Code, Video, PenTool, Layout, Server, Smartphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const About = () => {
  const { t } = useLanguage();
  const { getThemeStyles } = useTheme();
  const themeStyles = getThemeStyles();

  const skills = [
    { name: 'React.js', icon: <Code />, color: 'from-cyan-500 to-blue-500' },
    { name: 'Node.js', icon: <Server />, color: 'from-green-500 to-emerald-500' },
    { name: 'TailwindCSS', icon: <Layout />, color: 'from-blue-500 to-indigo-500' },
    { name: 'MySQL', icon: <Server />, color: 'from-orange-500 to-red-500' },
    { name: 'CapCut', icon: <Video />, color: 'from-purple-500 to-pink-500' },
    { name: 'Photoshop', icon: <PenTool />, color: 'from-blue-600 to-cyan-600' },
  ];

  return (
    <div className={`min-h-screen pt-24 ${themeStyles.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">{t('about.title')}</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`${themeStyles.card} rounded-2xl p-8`}
          >
            <h2 className="text-2xl font-bold mb-4">Who Am I?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('about.description')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('about.creative')}
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                CapCut
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                Photoshop
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                PixelLab
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
              {t('about.goal')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`${themeStyles.card} rounded-xl p-6 text-center card-hover`}
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${skill.color} mb-4`}>
                    <div className="text-white">{skill.icon}</div>
                  </div>
                  <h3 className="font-semibold">{skill.name}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;