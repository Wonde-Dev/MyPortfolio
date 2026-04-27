class Skill {
  constructor(pool) {
    this.pool = pool;
  }

  // Create skills table
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS skills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        level INT DEFAULT 0,
        icon VARCHAR(100),
        color VARCHAR(20),
        years_of_experience DECIMAL(3,1) DEFAULT 0,
        order_position INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_active (is_active),
        INDEX idx_order (order_position)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await this.pool.query(query);
    console.log('✅ Skills table ready');
  }

  // Create new skill
  async create(skillData) {
    const {
      name,
      category,
      level = 0,
      icon = null,
      color = null,
      years_of_experience = 0,
      order_position = 0
    } = skillData;

    const [result] = await this.pool.query(
      `INSERT INTO skills 
       (name, category, level, icon, color, years_of_experience, order_position) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, category, level, icon, color, years_of_experience, order_position]
    );

    return { id: result.insertId, ...skillData };
  }

  // Get all skills
  async getAll(category = null) {
    let query = 'SELECT * FROM skills WHERE is_active = TRUE';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY order_position ASC, level DESC';

    const [rows] = await this.pool.query(query, params);
    return rows;
  }

  // Get skills grouped by category
  async getGroupedByCategory() {
    const [rows] = await this.pool.query(
      'SELECT * FROM skills WHERE is_active = TRUE ORDER BY order_position ASC'
    );
    
    const grouped = {};
    for (const skill of rows) {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    }
    
    return grouped;
  }

  // Get skill by ID
  async findById(id) {
    const [rows] = await this.pool.query('SELECT * FROM skills WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // Update skill
  async update(id, skillData) {
    const fields = [];
    const values = [];

    const updatableFields = ['name', 'category', 'level', 'icon', 'color', 'years_of_experience', 'order_position', 'is_active'];

    for (const field of updatableFields) {
      if (skillData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(skillData[field]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await this.pool.query(
      `UPDATE skills SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete skill
  async delete(id) {
    const [result] = await this.pool.query('DELETE FROM skills WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get skills by category
  async getByCategory(category) {
    const [rows] = await this.pool.query(
      'SELECT * FROM skills WHERE category = ? AND is_active = TRUE ORDER BY level DESC',
      [category]
    );
    return rows;
  }

  // Seed default skills
  async seedDefaultSkills() {
    const defaultSkills = [
      { name: 'React.js', category: 'Frontend', level: 90, icon: '⚛️', color: '#61DAFB', years_of_experience: 2, order_position: 1 },
      { name: 'Node.js', category: 'Backend', level: 85, icon: '🟢', color: '#339933', years_of_experience: 2, order_position: 2 },
      { name: 'TailwindCSS', category: 'Frontend', level: 88, icon: '🎨', color: '#06B6D4', years_of_experience: 1.5, order_position: 3 },
      { name: 'MySQL', category: 'Database', level: 80, icon: '🐬', color: '#4479A1', years_of_experience: 2, order_position: 4 },
      { name: 'Express.js', category: 'Backend', level: 85, icon: '🚂', color: '#000000', years_of_experience: 2, order_position: 5 },
      { name: 'Video Editing', category: 'Creative', level: 85, icon: '🎬', color: '#FF6B6B', years_of_experience: 3, order_position: 6 },
      { name: 'Graphic Design', category: 'Creative', level: 87, icon: '🎨', color: '#FF9F43', years_of_experience: 3, order_position: 7 }
    ];

    for (const skill of defaultSkills) {
      const [existing] = await this.pool.query(
        'SELECT id FROM skills WHERE name = ?',
        [skill.name]
      );
      
      if (existing.length === 0) {
        await this.create(skill);
      }
    }
    
    console.log('✅ Default skills seeded');
  }
}

export default Skill;