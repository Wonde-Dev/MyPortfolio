import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '../.env') });

const runMigrations = async () => {
  let connection;

  try {
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'portfolio_db',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read and execute migration SQL
    const migrationPath = join(__dirname, '../../database/migrations/20260427_add_project_files.sql');
    
    try {
      const sql = await fs.readFile(migrationPath, 'utf8');
      console.log('📝 Running migration...');
      await connection.query(sql);
      console.log('✅ Migration completed successfully');
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('ℹ️  No migration file found, skipping');
      } else {
        throw err;
      }
    }

    // Verify tables exist
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'project_files'"
    );
    
    if (tables.length > 0) {
      console.log('✅ project_files table created');
      
      // Show structure
      const [columns] = await connection.query('DESCRIBE project_files');
      console.log('📊 project_files columns:', columns.map(c => c.Field).join(', '));
    } else {
      console.log('⚠️  project_files table not found');
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
