import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';

// Load environment variables first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import pool from './config/database.js';
import models from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { errorHandler } from './utils/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'rexmaple_session_secret_change_this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  // Test database connection first
  try {
    await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.log('⚠️  Server will start but database operations may fail');
  }
  
  // Initialize database tables
  try {
    await models.User.createTable();
    await models.Project.createTable();
    await models.Contact.createTable();
    await models.Skill.createTable();
    await models.Testimonial.createTable();
    console.log('✅ Database tables initialized');
    
    // Auto-create admin user if doesn't exist
    const bcrypt = (await import('bcryptjs')).default;
    const adminExists = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@wondwosen.com']
    );
    
    if (adminExists[0].length === 0) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name, role) 
         VALUES (?, ?, ?, ?, ?)`,
        ['admin', 'admin@wondwosen.com', hashedPassword, 'Wondwosen Assegid', 'admin']
      );
      console.log('✅ Admin user created automatically');
      console.log('   📧 Email: admin@wondwosen.com');
      console.log('   🔐 Password: Admin123!');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📦 Models loaded: User, Project, Contact, Skill, Testimonial`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`🌐 Client: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  });
};

startServer();