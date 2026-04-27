import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const migrations = [
  {
    version: 1,
    name: 'Add profile views table',
    sql: `
      CREATE TABLE IF NOT EXISTS profile_views (
        id INT PRIMARY KEY AUTO_INCREMENT,
        ip_address VARCHAR(45),
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_viewed_at (viewed_at)
      )
    `
  },
  {
    version: 2,
    name: 'Add skills table',
    sql: `
      CREATE TABLE IF NOT EXISTS skills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        level INT DEFAULT 0,
        category VARCHAR(50),
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    version: 3,
    name: 'Add testimonials table',
    sql: `
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        position VARCHAR(100),
        company VARCHAR(100),
        message TEXT NOT NULL,
        rating INT DEFAULT 5,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  }
];

const runMigrations = async () => {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'portfolio_db',
      multipleStatements: true
    });

    // Create migrations table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        version INT UNIQUE NOT NULL,
        name VARCHAR(255),
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get executed migrations
    const [executed] = await connection.query('SELECT version FROM migrations');
    const executedVersions = new Set(executed.map(m => m.version));

    // Run pending migrations
    for (const migration of migrations) {
      if (!executedVersions.has(migration.version)) {
        console.log(`📦 Running migration ${migration.version}: ${migration.name}`);
        await connection.query(migration.sql);
        await connection.query(
          'INSERT INTO migrations (version, name) VALUES (?, ?)',
          [migration.version, migration.name]
        );
        console.log(`✅ Migration ${migration.version} completed`);
      } else {
        console.log(`⏭️ Skipping migration ${migration.version} (already executed)`);
      }
    }

    console.log('🎉 All migrations completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

runMigrations();