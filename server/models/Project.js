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

    // Auto-run migrations for backward compatibility
    await this.runMigrations();
    console.log('✅ Projects table ready');
  }

  // Run migrations to add missing columns
  async runMigrations() {
    const migrations = [
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS audio_url VARCHAR(500) AFTER image_url',
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100) AFTER audio_url',
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_email VARCHAR(100) AFTER contact_name',
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS google_url VARCHAR(500) AFTER github_url',
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS attachments JSON DEFAULT NULL AFTER gallery_images'
    ];

    for (const sql of migrations) {
      try {
        await this.pool.query(sql);
      } catch (err) {
        if (!err.code?.includes('ER_CANT_FIND_SYSTEM_TABLE') && 
            !err.code?.includes('ER_PARSE_ERROR') &&
            !err.message?.includes('already exist')) {
          console.warn('Migration warning:', err.message);
        }
      }
    }
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

  // ==================== PROJECT CRUD ====================

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
    
    // Parse JSON fields
    return rows.map(row => {
      if (row.gallery_images) {
        try { row.gallery_images = JSON.parse(row.gallery_images); } 
        catch (e) { row.gallery_images = []; }
      }
      return row;
    });
  }

  // Get single project by ID
  async findById(id) {
    const [rows] = await this.pool.query(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    if (rows[0]) {
      const row = rows[0];
      if (row.gallery_images) {
        try { row.gallery_images = JSON.parse(row.gallery_images); } 
        catch (e) { row.gallery_images = []; }
      }
    }
    
    return rows[0] || null;
  }

  // Get project by slug
  async findBySlug(slug) {
    const [rows] = await this.pool.query(
      'SELECT * FROM projects WHERE slug = ?',
      [slug]
    );
    
    if (rows[0]) {
      const row = rows[0];
      if (row.gallery_images) {
        try { row.gallery_images = JSON.parse(row.gallery_images); } 
        catch (e) { row.gallery_images = []; }
      }
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

  // Delete project
  async remove(id) {
    const [result] = await this.pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // ==================== FILE MANAGEMENT ====================

  // Add file to project (legacy - for single main image)
  async addFile(projectId, fileData) {
    const { file_type, file_url, file_name, file_size = null, mime_type = null, 
            thumbnail_url = null, caption = null, sort_order = 0, is_featured = false } = fileData;

    const [result] = await this.pool.query(
      `INSERT INTO project_files 
       (project_id, file_type, file_url, file_name, file_size, mime_type, 
        thumbnail_url, caption, sort_order, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, file_type, file_url, file_name, file_size, mime_type, 
       thumbnail_url, caption, sort_order, is_featured]
    );

    return { id: result.insertId, project_id: projectId, ...fileData };
  }

  // Get all files for a project
  async getFiles(projectId, type = null) {
    let query = 'SELECT * FROM project_files WHERE project_id = ?';
    const params = [projectId];

    if (type) {
      query += ' AND file_type = ?';
      params.push(type);
    }

    query += ' ORDER BY sort_order ASC, created_at DESC';

    const [rows] = await this.pool.query(query, params);
    return rows;
  }

  // Get single file
  async getFile(fileId) {
    const [rows] = await this.pool.query(
      'SELECT * FROM project_files WHERE id = ?',
      [fileId]
    );
    return rows[0] || null;
  }

  // Update file
  async updateFile(fileId, updates) {
    const fields = [];
    const values = [];

    const updatableFields = [
      'file_type', 'file_url', 'file_name', 'file_size', 'mime_type',
      'thumbnail_url', 'caption', 'sort_order', 'is_featured'
    ];

    for (const field of updatableFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (fields.length === 0) return null;

    values.push(fileId);
    const [result] = await this.pool.query(
      `UPDATE project_files SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete file
  async deleteFile(fileId) {
    const [result] = await this.pool.query('DELETE FROM project_files WHERE id = ?', [fileId]);
    return result.affectedRows > 0;
  }

  // Reorder files
  async reorderFiles(projectId, fileOrder) {
    // fileOrder: array of {id, sort_order}
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      for (const item of fileOrder) {
        await connection.query(
          'UPDATE project_files SET sort_order = ? WHERE id = ? AND project_id = ?',
          [item.sort_order, item.id, projectId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Bulk delete files
  async deleteFiles(projectId, fileIds) {
    const placeholders = fileIds.map(() => '?').join(',');
    const [result] = await this.pool.query(
      `DELETE FROM project_files WHERE project_id = ? AND id IN (${placeholders})`,
      [projectId, ...fileIds]
    );
    return result.affectedRows;
  }

  // ==================== UTILITY METHODS ====================

  // Get featured projects with their files
  async getFeatured(limit = 6) {
    const [rows] = await this.pool.query(
      `SELECT p.*, 
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT('id', f.id, 'file_url', f.file_url, 'file_type', f.file_type, 'is_featured', f.is_featured)
        ) FROM project_files f WHERE f.project_id = p.id AND f.is_featured = TRUE) as featured_files
       FROM projects p 
       WHERE p.featured = TRUE AND p.status = "published" 
       ORDER BY p.created_at DESC 
       LIMIT ?`,
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
      'SELECT DISTINCT category FROM projects WHERE category IS NOT NULL AND status = "published" ORDER BY category'
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
