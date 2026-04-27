class Testimonial {
  constructor(pool) {
    this.pool = pool;
  }

  // Create testimonials table
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        position VARCHAR(100),
        company VARCHAR(100),
        avatar_url VARCHAR(500),
        message TEXT NOT NULL,
        rating INT DEFAULT 5,
        is_approved BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_approved (is_approved),
        INDEX idx_featured (is_featured),
        INDEX idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await this.pool.query(query);
    console.log('✅ Testimonials table ready');
  }

  // Create testimonial
  async create(testimonialData) {
    const {
      name,
      position = null,
      company = null,
      avatar_url = null,
      message,
      rating = 5,
      is_approved = false,
      is_featured = false
    } = testimonialData;

    const [result] = await this.pool.query(
      `INSERT INTO testimonials 
       (name, position, company, avatar_url, message, rating, is_approved, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, position, company, avatar_url, message, rating, is_approved, is_featured]
    );

    return { id: result.insertId, ...testimonialData };
  }

  // Get approved testimonials
  async getApproved(limit = 10) {
    const [rows] = await this.pool.query(
      'SELECT * FROM testimonials WHERE is_approved = TRUE ORDER BY is_featured DESC, created_at DESC LIMIT ?',
      [limit]
    );
    return rows;
  }

  // Get all testimonials (admin)
  async getAll(options = {}) {
    const {
      is_approved = null,
      limit = 50,
      offset = 0
    } = options;

    let query = 'SELECT * FROM testimonials WHERE 1=1';
    const params = [];

    if (is_approved !== null) {
      query += ' AND is_approved = ?';
      params.push(is_approved);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await this.pool.query(query, params);
    return rows;
  }

  // Get testimonial by ID
  async findById(id) {
    const [rows] = await this.pool.query('SELECT * FROM testimonials WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // Update testimonial
  async update(id, testimonialData) {
    const fields = [];
    const values = [];

    const updatableFields = ['name', 'position', 'company', 'avatar_url', 'message', 'rating', 'is_approved', 'is_featured'];

    for (const field of updatableFields) {
      if (testimonialData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(testimonialData[field]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await this.pool.query(
      `UPDATE testimonials SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Approve testimonial
  async approve(id) {
    const [result] = await this.pool.query(
      'UPDATE testimonials SET is_approved = TRUE WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Delete testimonial
  async delete(id) {
    const [result] = await this.pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get average rating
  async getAverageRating() {
    const [rows] = await this.pool.query(
      'SELECT AVG(rating) as average, COUNT(*) as total FROM testimonials WHERE is_approved = TRUE'
    );
    return {
      average: parseFloat(rows[0].average || 0).toFixed(1),
      total: rows[0].total
    };
  }
}

export default Testimonial;