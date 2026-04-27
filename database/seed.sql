USE portfolio_db;

INSERT IGNORE INTO users (username, email, password_hash, role, full_name)
VALUES ('admin', 'admin@wondwosen.com', '...', 'admin', 'Wondwosen Assegid');

INSERT INTO skills (name, category, level, icon, color, years_of_experience, order_position) VALUES
('React.js', 'Frontend', 90, '⚛️', '#61DAFB', 2.0, 1),
('Node.js', 'Backend', 85, '🟢', '#339933', 2.0, 2);

INSERT INTO projects (title, slug, description, technologies, category, featured, status) VALUES
('E-Commerce Platform', 'ecommerce-platform', 'Full-featured platform', 'React,Node.js,MySQL', 'Web Development', TRUE, 'published');

INSERT INTO testimonials (name, position, company, message, rating, is_approved, is_featured) VALUES
('John Doe', 'CTO', 'Tech Corp', 'Amazing work!', 5, TRUE, TRUE);