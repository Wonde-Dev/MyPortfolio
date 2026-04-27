import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    nav: { home: 'Home', about: 'About', services: 'Services', projects: 'Projects', contact: 'Contact' },
    home: {
      greeting: "Hi, I'm",
      name: "Wondwosen Assegid",
      title: "Full-Stack Developer & Creative Designer",
      description: "Building exceptional digital experiences with code and creativity and also I have more expreince on those skills!",
      cta: "View My Work",
      skills: "My Skills"
    },
    about: {
      title: "About Me",
      description: "I am a passionate and detail-oriented Software Engineering student at Haramaya University. I specialize in Full-Stack Web Development, with strong skills in building responsive, modern, and user-friendly websites and web applications.",
      creative: "Beyond development, I am also a creative professional with experience in:",
      tools: "Video Editing (CapCut), Graphic Design (Photoshop), Creative Design (PixelLab)",
      goal: "My goal is to grow as a software engineer, contribute to impactful projects, and build high-quality digital experiences that make a difference."
    },
    services: {
      title: "What I Do",
      webDev: "Web Development",
      webDevDesc: "Full-stack web applications with modern technologies",
      uiux: "UI/UX Design",
      uiuxDesc: "Beautiful and intuitive user interfaces",
      videoEdit: "Video Editing",
      videoEditDesc: "Professional video editing with CapCut",
      graphicDesign: "Graphic Design",
      graphicDesignDesc: "Creative designs with Photoshop & PixelLab"
    },
    contact: {
      title: "Get In Touch",
      name: "Your Name",
      email: "Your Email",
      subject: "Subject",
      message: "Your Message",
      send: "Send Message"
    },
    stats: {
      projects: "Projects",
      experience: "Years Experience",
      clients: "Happy Clients"
    }
  },
  am: {
    nav: { home: 'መነሻ', about: 'ስለ እኔ', services: 'አገልግሎቶች', projects: 'ፕሮጀክቶች', contact: 'አግኙኝ' },
    home: {
      greeting: "ሰላም፣ እኔ",
      name: "ወንድወሰን አሰግድ",
      title: "ሙሉ ቁልል ገንቢ እና ፈጠራ ዲዛይነር",
      description: "በኮድ እና ፈጠራ ልዩ የዲጂታል ልምዶችን መገንባት",
      cta: "ስራዬን ተመልከት",
      skills: "ክህሎቶቼ"
    },
    about: {
      title: "ስለ እኔ",
      description: "እኔ ሀራማያ ዩኒቨርሲቲ የሶፍትዌር ምህንድስና ተማሪ ነኝ። በሙሉ ቁልል ድረ-ገጽ ግንባታ ላይ የተካንኩ ሲሆን ሙሉ ቁልል ድረ-ገጽ መገንባት እችላለሁ።",
      creative: "ከዚህ ባሻገር፣ በሚከተሉት ዘርፎች ልምድ አለኝ፡",
      tools: "ቪዲዮ አርትዖት (CapCut)፣ ግራፊክ ዲዛይን (Photoshop)፣ ክሪዬቲቭ ዲዛይን (PixelLab)",
      goal: "ዓላማዬ እንደ ሶፍትዌር መሐንዲስ ማደግ እና ትርጉም ያለው ለውጥ የሚፈጥሩ ጥራት ያላቸው ዲጂታል ልምዶችን መገንባት ነው።"
    },
    services: {
      title: "አገልግሎቶቼ",
      webDev: "ድረ-ገጽ ግንባታ",
      webDevDesc: "ዘመናዊ ቴክኖሎጂዎችን በመጠቀም ሙሉ ቁልል ድረ-ገጽ መገንባት",
      uiux: "UI/UX ዲዛይን",
      uiuxDesc: "ቆንጆ እና ለመጠቀም ቀላል የተጠቃሚ በይነገጾች",
      videoEdit: "ቪዲዮ አርትዖት",
      videoEditDesc: "በCapCut ሙያዊ ቪዲዮ አርትዖት",
      graphicDesign: "ግራፊክ ዲዛይን",
      graphicDesignDesc: "በPhotoshop እና PixelLab ፈጠራ ዲዛይኖች"
    },
    contact: {
      title: "ያግኙኝ",
      name: "ስምዎ",
      email: "ኢሜይልዎ",
      subject: "ርዕስ",
      message: "መልዕክትዎ",
      send: "መልዕክት ላኩ"
    },
    stats: {
      projects: "ፕሮጀክቶች",
      experience: "የስራ ልምድ ዓመታት",
      clients: "ደስተኛ ደንበኞች"
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], translations[language]) || path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};