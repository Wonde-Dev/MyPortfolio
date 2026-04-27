import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const setupDatabase = async () => {
  let connection;
  
  try {
    // First connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('📡 Connected to MySQL server...');

    // Read and execute schema file
    const schemaPath = join(__dirname, '../../database/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📝 Creating database and tables...');
    await connection.query(schema);
    
    console.log('✅ Database setup completed successfully!');
    
    // Verify connection to new database
    await connection.changeUser({ database: process.env.DB_NAME || 'portfolio_db' });
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 Created tables:', tables.map(t => Object.values(t)[0]).join(', '));
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

setupDatabase();