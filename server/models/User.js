import bcrypt from 'bcryptjs';

class User {
  constructor(pool) {
    this.pool = pool;
  }

  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        avatar_url VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `;
    await this.pool.query(query);
  }

  async findByEmail(email) {
    const [rows] = await this.pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await this.pool.query(
      'SELECT id, username, email, full_name, avatar_url, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async create(userData) {
    const { username, email, password, full_name = null, role = 'user', avatar_url = null } = userData;
    
    let password_hash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password, salt);
    }
    
    const [result] = await this.pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, avatar_url, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, full_name, avatar_url, role]
    );
    
    return { id: result.insertId, username, email, full_name, avatar_url, role };
  }

  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  async updateLastLogin(id) {
    await this.pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [id]
    );
  }
}

export default User;