import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Code, Palette, Video, PenTool, Smartphone, Server, Database, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Services = () => {
  const { t } = useLanguage();
  const { getThemeStyles } = useTheme();
  const themeStyles = getThemeStyles();

  const services = [
    {
      icon: <Code size={40} />,
      title: t('services.webDev'),
      description: t('services.webDevDesc'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Palette size={40} />,
      title: t('services.uiux'),
      description: t('services.uiuxDesc'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Video size={40} />,
      title: t('services.videoEdit'),
      description: t('services.videoEditDesc'),
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: <PenTool size={40} />,
      title: t('services.graphicDesign'),
      description: t('services.graphicDesignDesc'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Database size={40} />,
      title: "Database Design",
      description: "Efficient MySQL database architecture and optimization",
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: <Server size={40} />,
      title: "API Development",
      description: "RESTful APIs with Node.js and Express",
      color: 'from-indigo-500 to-purple-500'
    }
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
          <h1 className="text-5xl font-bold mb-4">{t('services.title')}</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
            I offer professional services in web development, creative design, and video editing
          </p>
        </motion.div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {services.map((service, index) => (
             <motion.div
               key={`service-${index}-${service.title}`}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               whileHover={{ y: -10 }}
               className={`${themeStyles.card} rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group`}
             >
               <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${service.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                 <div className="text-white">{service.icon}</div>
               </div>
               <h3 className="text-xl font-bold mb-3">{service.title}</h3>
               <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
             </motion.div>
           ))}
         </div>

        {/* Process Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">How I Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Discovery", desc: "Understanding your needs and goals" },
              { step: "02", title: "Planning", desc: "Creating a detailed roadmap" },
              { step: "03", title: "Development", desc: "Building with cutting-edge tech" },
              { step: "04", title: "Delivery", desc: "Launching and ongoing support" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;