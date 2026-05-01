-- Migration: Fix projects table and add project_files table
-- Created: 2026-04-27
-- Purpose: Add missing columns and support multiple file uploads per project

USE portfolio_db;

-- Add missing columns to projects table (ignore errors if already exist)
-- Note: Running individually with error suppression for compatibility

-- Add audio_url
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'audio_url' 
                   AND table_schema = DATABASE());
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE projects ADD COLUMN audio_url VARCHAR(500) AFTER image_url',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add contact_name
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'contact_name' 
                   AND table_schema = DATABASE());
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE projects ADD COLUMN contact_name VARCHAR(100) AFTER audio_url',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add contact_email
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'contact_email' 
                   AND table_schema = DATABASE());
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE projects ADD COLUMN contact_email VARCHAR(100) AFTER contact_name',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add google_url
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'google_url' 
                   AND table_schema = DATABASE());
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE projects ADD COLUMN google_url VARCHAR(500) AFTER github_url',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add attachments JSON column
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'attachments' 
                   AND table_schema = DATABASE());
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE projects ADD COLUMN attachments JSON DEFAULT NULL AFTER gallery_images',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create project_files table for multiple file uploads (LinkedIn-style)
CREATE TABLE IF NOT EXISTS project_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  file_type ENUM('image', 'video', 'audio', 'document', 'other') NOT NULL DEFAULT 'other',
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT DEFAULT NULL,
  mime_type VARCHAR(100) DEFAULT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  caption TEXT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_project (project_id),
  INDEX idx_type (file_type),
  INDEX idx_featured (is_featured),
  INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create project_technologies junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS project_technologies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  technology VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Existing projects with comma-separated technologies need manual migration
-- To migrate: INSERT INTO project_technologies (project_id, technology, sort_order)
-- SELECT id, TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(technologies, ',', numbers.n), ',', -1)) as tech, 
--        numbers.n as sort_order
-- FROM projects
-- JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) numbers
--   ON CHAR_LENGTH(technologies) - CHAR_LENGTH(REPLACE(technologies, ',', '')) >= numbers.n-1
-- WHERE technologies IS NOT NULL;
