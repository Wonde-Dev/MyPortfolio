class Project {
  constructor(pool) {
    this.pool = pool;
  }

  // Create projects table
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS projects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL,
        slug VARCHAR(120) UNIQUE,
        description TEXT NOT NULL,
        long_description LONGTEXT,
        technologies TEXT,
        category VARCHAR(50),
        image_url VARCHAR(500),
        audio_url VARCHAR(500),
        contact_name VARCHAR(100),
        contact_email VARCHAR(100),
        gallery_images JSON,
        live_url VARCHAR(500),
        github_url VARCHAR(500),
        google_url VARCHAR(500),
        demo_url VARCHAR(500),
        document_url VARCHAR(500),
        video_url VARCHAR(500),
        featured BOOLEAN DEFAULT FALSE,
        status ENUM('draft', 'published', 'archived') DEFAULT 'published',
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_featured (featured),
        INDEX idx_category (category),
        FULLTEXT INDEX idx_search (title, description, technologies)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await this.pool.query(query);
    
    // Migrations for existing tables
    try {
      await this.pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS audio_url VARCHAR(500) AFTER image_url`);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME' && err.errno !== 1060) throw err;
    }
    try {
      await this.pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100) AFTER audio_url`);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME' && err.errno !== 1060) throw err;
    }
    try {
      await this.pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_email VARCHAR(100) AFTER contact_name`);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME' && err.errno !== 1060) throw err;
    }
    try {
      await this.pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS google_url VARCHAR(500) AFTER github_url`);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME' && err.errno !== 1060) throw err;
    }
    
    console.log('✅ Projects table ready');
  }

  // Create slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Create new project
  async create(projectData) {
    const {
      title,
      description,
      long_description = null,
      technologies = null,
      category = null,
      image_url = null,
      audio_url = null,
      contact_name = null,
      contact_email = null,
      gallery_images = null,
      live_url = null,
      github_url = null,
      google_url = null,
      demo_url = null,
      document_url = null,
      video_url = null,
      featured = false,
      status = 'published'
    } = projectData;

    const slug = this.generateSlug(title);
    const galleryJson = gallery_images ? JSON.stringify(gallery_images) : null;

    const [result] = await this.pool.query(
      `INSERT INTO projects 
       (title, slug, description, long_description, technologies, category, 
        image_url, audio_url, contact_name, contact_email, gallery_images, 
        live_url, github_url, google_url, demo_url, document_url, video_url, featured, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
       [title, slug, description, long_description, technologies, category,
        image_url, audio_url, contact_name, contact_email, galleryJson,
        live_url, github_url, google_url, demo_url, document_url, video_url, featured, status]
    );

    return { id: result.insertId, slug, ...projectData };
  }

  // Get all projects
  async getAll(options = {}) {
    const {
      status = 'published',
      category = null,
      featured = null,
      limit = 50,
      offset = 0,
      search = null
    } = options;

    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];

    if (status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (featured !== null) {
      query += ' AND featured = ?';
      params.push(featured);
    }

    if (search) {
      query += ' AND MATCH(title, description, technologies) AGAINST(?)';
      params.push(search);
    }

    query += ' ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await this.pool.query(query, params);
    return rows;
  }

  // Get single project by ID
  async findById(id) {
    const [rows] = await this.pool.query(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    if (rows[0] && rows[0].gallery_images) {
      rows[0].gallery_images = JSON.parse(rows[0].gallery_images);
    }
    
    return rows[0] || null;
  }

  // Get project by slug
  async findBySlug(slug) {
    const [rows] = await this.pool.query(
      'SELECT * FROM projects WHERE slug = ?',
      [slug]
    );
    
    if (rows[0] && rows[0].gallery_images) {
      rows[0].gallery_images = JSON.parse(rows[0].gallery_images);
    }
    
    return rows[0] || null;
  }

  // Increment view count
  async incrementViews(id) {
    await this.pool.query(
      'UPDATE projects SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );
  }

  // Update project
  async update(id, projectData) {
    const fields = [];
    const values = [];

    const updatableFields = [
      'title', 'description', 'long_description', 'technologies', 'category',
      'image_url', 'audio_url', 'contact_name', 'contact_email',
      'live_url', 'github_url', 'google_url', 'demo_url', 'document_url', 'video_url', 'featured', 'status'
    ];

    for (const field of updatableFields) {
      if (projectData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(projectData[field]);
      }
    }

    if (projectData.title) {
      fields.push('slug = ?');
      values.push(this.generateSlug(projectData.title));
    }

    if (projectData.gallery_images) {
      fields.push('gallery_images = ?');
      values.push(JSON.stringify(projectData.gallery_images));
    }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await this.pool.query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }
    }

    if (projectData.title) {
      fields.push('slug = ?');
      values.push(this.generateSlug(projectData.title));
    }

    if (projectData.gallery_images) {
      fields.push('gallery_images = ?');
      values.push(JSON.stringify(projectData.gallery_images));
    }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await this.pool.query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete project
  async delete(id) {
    const [result] = await this.pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get featured projects
  async getFeatured(limit = 6) {
    const [rows] = await this.pool.query(
      'SELECT * FROM projects WHERE featured = TRUE AND status = "published" ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows;
  }

  // Get projects by category
  async getByCategory(category, limit = 10) {
    const [rows] = await this.pool.query(
      'SELECT * FROM projects WHERE category = ? AND status = "published" ORDER BY created_at DESC LIMIT ?',
      [category, limit]
    );
    return rows;
  }

  // Get all categories
  async getCategories() {
    const [rows] = await this.pool.query(
      'SELECT DISTINCT category FROM projects WHERE category IS NOT NULL AND status = "published"'
    );
    return rows.map(row => row.category);
  }

  // Get project count
  async getCount(status = 'published') {
    const [rows] = await this.pool.query(
      'SELECT COUNT(*) as count FROM projects WHERE status = ?',
      [status]
    );
    return rows[0].count;
  }
}

export default Project;