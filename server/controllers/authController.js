import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Google OAuth Login/Register
export const googleAuth = async (req, res) => {
  try {
    const { email, name, avatar } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    // Check if user exists
    let user = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (user[0].length === 0) {
      // Create new user
      const username = name.toLowerCase().replace(/\s+/g, '') + '_' + uuidv4().substring(0, 8);
      const [result] = await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name, avatar_url, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, email, '', name, avatar || null, 'user']
      );
      
      user = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    }
    
    const userData = user[0][0];
    
    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userData.id]);
    
    // Generate token
    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// GitHub OAuth Login/Register
export const githubAuth = async (req, res) => {
  try {
    const { email, name, avatar } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    // Check if user exists
    let user = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (user[0].length === 0) {
      // Create new user
      const username = name.toLowerCase().replace(/\s+/g, '') + '_' + uuidv4().substring(0, 8);
      const [result] = await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name, avatar_url, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, email, '', name, avatar || null, 'user']
      );
      
      user = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    }
    
    const userData = user[0][0];
    
    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userData.id]);
    
    // Generate token
    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.status(500).json({ message: 'GitHub authentication failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check if it's a Google user (no password)
    if (!user.password_hash) {
      return res.status(401).json({ message: 'Please login with Google' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyToken = async (req, res) => {
  res.json({ valid: true, user: req.user });
};