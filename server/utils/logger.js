import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(logEntry) {
    fs.appendFileSync(this.logFile, logEntry + '\n');
  }

  getColorForLevel(level) {
    switch(level) {
      case LogLevel.INFO: return colors.green;
      case LogLevel.WARN: return colors.yellow;
      case LogLevel.ERROR: return colors.red;
      case LogLevel.DEBUG: return colors.blue;
      default: return colors.reset;
    }
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    const color = this.getColorForLevel(level);
    
    // Console output with color
    console.log(`${color}[${level}]${colors.reset} ${colors.gray}${new Date().toLocaleTimeString()}${colors.reset} - ${message}`);
    
    // File output
    this.writeToFile(formattedMessage);
  }

  info(message, meta = {}) {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message, meta = {}) {
    this.log(LogLevel.ERROR, message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }

  // Log API requests
  logRequest(req, res, duration) {
    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    if (res.statusCode >= 400) {
      this.warn(`${req.method} ${req.url} - ${res.statusCode}`, meta);
    } else {
      this.info(`${req.method} ${req.url} - ${res.statusCode}`, meta);
    }
  }

  // Log database queries
  logQuery(query, params = [], duration) {
    this.debug('Database Query', {
      query,
      params,
      duration: `${duration}ms`
    });
  }
}

export const logger = new Logger();

// Middleware for logging requests
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  
  next();
};