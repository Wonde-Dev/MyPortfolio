import React, { useMemo } from 'react';
import { ArrowRight, Brush, Code, Palette, Video, PenTool, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import FloatingShapes from '../components/FloatingShapes';
import wonde from '../assets/wonde.jpg';
import hcj from '../assets/hcj.jpeg';
import RTT from '../assets/RTT.jpeg';
import www from '../assets/www.jpeg';
import Photoshop from '../assets/Photoshop.jpeg';
import pixellab from '../assets/pixellab.jpeg';
import CapCut from '../assets/CapCut.jpeg';
import github1 from '../assets/github1.jpeg';
import github from '../assets/github.jpeg';
import image from '../assets/image.png';
import vite from '../assets/vite.svg';
import react from '../assets/react.svg';

const Home = () => {
  const { t } = useLanguage();
  const { getThemeStyles } = useTheme();
  const themeStyles = getThemeStyles();

  const skills = [
    { name: 'React', icon: <Code />, level: 90, color: 'from-blue-500 to-cyan-500' },
    { name: 'Node.js', icon: <Code />, level: 85, color: 'from-green-500 to-lime-500' },
    { name: 'UI/UX Design', icon: <Palette />, level: 88, color: 'from-pink-500 to-rose-500' },
    { name: 'Video Editing', icon: <Video />, level: 85, color: 'from-purple-500 to-violet-500' },
    { name: 'Graphic Design', icon: <PenTool />, level: 87, color: 'from-orange-500 to-yellow-500' },
  ];

  const companies = useMemo(() => [
    { name: 'Wonde', logo: wonde },
    { name: 'RTT', logo: RTT },
    { name: 'HCJ', logo: hcj },
    { name: 'WWW Co', logo: www },
    { name: 'Photoshop', logo: Photoshop },
    { name: 'PixelLab', logo: pixellab },
    { name: 'CapCut', logo: CapCut },
    { name: 'GitHub', logo: github },
    { name: 'GitHub1', logo: github1 },
    { name: 'Vite', logo: vite },
    { name: 'React', logo: react },
    { name: 'Image', logo: image },
  ], []);

  return (
    <div className={`min-h-screen ${themeStyles.bg}`}>
      <FloatingShapes />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-pink-900/20"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2), transparent 50%)' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-left"
            >
              <div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 mb-6"
              >
                <Sparkles size={16} className="text-yellow-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-gray-200">
                  Full Stack Developer & Creative Designer
                </span>
              </div>

              <div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 leading-tight"
              >
                <span className="text-gray-900 dark:text-gray-100 block mb-2">
                  {t('home.greeting')}
                </span>
                <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent block">
                  {t('home.name')}
                </span>
              </div>

              <div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed"
              >
                {t('home.title')}
              </div>

              <div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl leading-relaxed"
              >
                {t('home.description')}
              </div>

              <div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 justify-start"
              >
                <Link
                  to="/projects"
                  className="group relative inline-flex items-center px-8 py-4 overflow-hidden rounded-full font-semibold transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 opacity-100 transition-opacity group-hover:opacity-80"></div>
                  <span className="relative flex items-center text-white z-10">
                    {t('home.cta')}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 hover:border-gray-400/70 dark:hover:border-gray-500/70 text-gray-700 dark:text-gray-200 rounded-full font-semibold transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-700/50 group"
                >
                  Contact Me
                </Link>
              </div>
            </div>

            <div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/30 animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute inset-4 rounded-full border border-dashed border-pink-500/30 animate-[spin_25s_linear_infinite_reverse]"></div>
                <div className="absolute inset-8 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-pink-500 p-1 shadow-2xl animate-[pulse_3s_ease-in-out_infinite]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                    <img
                      src={wonde}
                      alt="Wondwosen"
                      className="w-full h-full object-cover mix-blend-luminosity"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-violet-900/30 backdrop-blur-sm border border-violet-500/20 mb-6">
              <Brush size={18} className="text-purple-800" />
              <span className="text-sm font-semibold text-violet-900 uppercase tracking-wider">Expertise</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Core Skills & Technologies
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-violet-500 to-pink-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className={`${themeStyles.card} rounded-2xl p-6 md:p-8 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-purple-600 dark:text-purple-400 shadow-lg">
                    {React.cloneElement(skill.icon, { size: 28 })}
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                    {skill.level}%
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {skill.name}
                </h3>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-500"></div>
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${skill.color} relative overflow-hidden`}
                    style={{ width: `${skill.level}%` }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] translate-x-[-200%] animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies/Technologies Logo Slider */}
      <section className="py-20 overflow-hidden border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Technologies & Partners
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Trusted tools and technologies that power our solutions
            </p>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex gap-8 animate-slide whitespace-nowrap">
              {[...companies, ...companies].map((company) => (
                <div
                  key={company.name}
                  className="flex-shrink-0 w-28 sm:w-36 md:w-44 mx-4 group"
                >
                  <div className="h-20 sm:h-24 md:h-28 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center p-3 md:p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:border-violet-300/50 dark:hover:border-violet-700/50 group-hover:scale-105 cursor-pointer">
                    <div className="w-full h-full flex items-center justify-center rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900/50 p-1 md:p-2 transition-all duration-500">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {company.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;