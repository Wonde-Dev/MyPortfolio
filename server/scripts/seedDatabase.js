import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'portfolio_db'
    });

    console.log('🌱 Seeding database...');

    // Generate REAL bcrypt hash for admin password
    const adminPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log(`✅ Generated hash for password: ${adminPassword}`);

    // Check if admin exists
    const [adminExists] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@wondwosen.com']
    );

    if (adminExists.length === 0) {
      await connection.query(
        `INSERT INTO users (username, email, password_hash, role, full_name) 
         VALUES (?, ?, ?, ?, ?)`,
        ['admin', 'admin@wondwosen.com', hashedPassword, 'admin', 'Wondwosen Assegid']
      );
      console.log('✅ Admin user created successfully!');
      console.log('   Email: admin@wondwosen.com');
      console.log('   Password: Admin123!');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Check and insert skills
    const [skillsCount] = await connection.query('SELECT COUNT(*) as count FROM skills');
    
    if (skillsCount[0].count === 0) {
      const skills = [
        { name: 'React.js', category: 'Frontend', level: 90, icon: '⚛️', color: '#61DAFB', years_of_experience: 2, order_position: 1 },
        { name: 'Node.js', category: 'Backend', level: 85, icon: '🟢', color: '#339933', years_of_experience: 2, order_position: 2 },
        { name: 'TailwindCSS', category: 'Frontend', level: 88, icon: '🎨', color: '#06B6D4', years_of_experience: 1.5, order_position: 3 },
        { name: 'MySQL', category: 'Database', level: 80, icon: '🐬', color: '#4479A1', years_of_experience: 2, order_position: 4 },
        { name: 'Express.js', category: 'Backend', level: 85, icon: '🚂', color: '#000000', years_of_experience: 2, order_position: 5 },
        { name: 'Video Editing', category: 'Creative', level: 85, icon: '🎬', color: '#FF6B6B', years_of_experience: 3, order_position: 6 },
        { name: 'Graphic Design', category: 'Creative', level: 87, icon: '🎨', color: '#FF9F43', years_of_experience: 3, order_position: 7 }
      ];

      for (const skill of skills) {
        await connection.query(
          `INSERT INTO skills (name, category, level, icon, color, years_of_experience, order_position) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [skill.name, skill.category, skill.level, skill.icon, skill.color, skill.years_of_experience, skill.order_position]
        );
      }
      console.log('✅ Skills seeded successfully!');
    } else {
      console.log('ℹ️ Skills already exist');
    }

    // Check and insert sample projects
    const [projectsCount] = await connection.query('SELECT COUNT(*) as count FROM projects');
    
    if (projectsCount[0].count === 0) {
      const projects = [
        {
          title: 'E-Commerce Platform',
          description: 'Full-featured e-commerce platform with payment integration',
          technologies: 'React,Node.js,MySQL,Stripe',
          category: 'Web Development',
          featured: true,
          status: 'published'
        },
        {
          title: 'Task Management App',
          description: 'Collaborative task management tool with real-time updates',
          technologies: 'React,Express,MongoDB,Socket.io',
          category: 'Web Development',
          featured: true,
          status: 'published'
        },
        {
          title: 'Portfolio Website',
          description: 'Modern portfolio website with theme changer and multiple languages',
          technologies: 'React,TailwindCSS,Node.js,MySQL',
          category: 'Web Development',
          featured: true,
          status: 'published'
        }
      ];

      for (const project of projects) {
        const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await connection.query(
          `INSERT INTO projects (title, slug, description, technologies, category, featured, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [project.title, slug, project.description, project.technologies, project.category, project.featured, project.status]
        );
      }
      console.log('✅ Sample projects seeded!');
    } else {
      console.log('ℹ️ Projects already exist');
    }

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

seedDatabase();