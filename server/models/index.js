import pool from '../config/database.js';
import User from './User.js';
import Project from './Project.js';
import Contact from './Contact.js';
import Skill from './Skill.js';
import Testimonial from './Testimonial.js';

// Initialize models with database pool
const models = {
  User: new User(pool),
  Project: new Project(pool),
  Contact: new Contact(pool),
  Skill: new Skill(pool),
  Testimonial: new Testimonial(pool)
};

// Export models
export default models;