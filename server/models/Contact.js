class Contact {
  constructor(pool) {
    this.pool = pool;
  }

  // Create contact messages table
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(200),
        message TEXT NOT NULL,
        status ENUM('unread', 'read', 'replied', 'spam') DEFAULT 'unread',
        ip_address VARCHAR(45),
        user_agent TEXT,
        replied_at TIMESTAMP NULL,
        reply_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await this.pool.query(query);
    console.log('✅ Contact messages table ready');
  }

  // Create new contact message
  async create(messageData) {
    const {
      name,
      email,
      phone = null,
      subject = null,
      message,
      ip_address = null,
      user_agent = null,
      attachments = null
    } = messageData;

    const [result] = await this.pool.query(
      `INSERT INTO contact_messages 
       (name, email, phone, subject, message, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
       [name, email, phone, subject, message, ip_address, user_agent]
    );

    return { id: result.insertId, ...messageData };
  }

  // Get all messages
  async getAll(options = {}) {
    const {
      status = null,
      limit = 50,
      offset = 0
    } = options;

    let query = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await this.pool.query(query, params);
    return rows;
  }

  // Get message by ID
  async findById(id) {
    const [rows] = await this.pool.query(
      'SELECT * FROM contact_messages WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Update message status
  async updateStatus(id, status) {
    const [result] = await this.pool.query(
      'UPDATE contact_messages SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  // Mark as replied
  async markAsReplied(id, replyMessage) {
    const [result] = await this.pool.query(
      'UPDATE contact_messages SET status = "replied", reply_message = ?, replied_at = NOW() WHERE id = ?',
      [replyMessage, id]
    );
    return result.affectedRows > 0;
  }

  // Delete message
  async delete(id) {
    const [result] = await this.pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get unread count
  async getUnreadCount() {
    const [rows] = await this.pool.query(
      'SELECT COUNT(*) as count FROM contact_messages WHERE status = "unread"'
    );
    return rows[0].count;
  }

  // Get messages by email
  async getByEmail(email, limit = 10) {
    const [rows] = await this.pool.query(
      'SELECT * FROM contact_messages WHERE email = ? ORDER BY created_at DESC LIMIT ?',
      [email, limit]
    );
    return rows;
  }

  // Delete old messages
  async deleteOldMessages(daysOld = 30) {
    const [result] = await this.pool.query(
      'DELETE FROM contact_messages WHERE status IN ("spam", "replied") AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysOld]
    );
    return result.affectedRows;
  }
}

export default Contact;