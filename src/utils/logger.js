const chalk = require('chalk');

/**
 * Custom logger with color-coded output
 */
class Logger {
  constructor() {
    this.useColors = process.env.NODE_ENV !== 'production';
  }

  _getTimestamp() {
    return new Date().toISOString();
  }

  _formatMessage(level, message, ...args) {
    const timestamp = this._getTimestamp();
    const formattedArgs = args.length ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ') : '';
    
    return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
  }

  info(message, ...args) {
    if (this.useColors) {
      console.log(chalk.blue(this._formatMessage('INFO', message, ...args)));
    } else {
      console.log(this._formatMessage('INFO', message, ...args));
    }
  }

  success(message, ...args) {
    if (this.useColors) {
      console.log(chalk.green(this._formatMessage('SUCCESS', message, ...args)));
    } else {
      console.log(this._formatMessage('SUCCESS', message, ...args));
    }
  }

  warn(message, ...args) {
    if (this.useColors) {
      console.warn(chalk.yellow(this._formatMessage('WARN', message, ...args)));
    } else {
      console.warn(this._formatMessage('WARN', message, ...args));
    }
  }

  error(message, ...args) {
    if (this.useColors) {
      console.error(chalk.red(this._formatMessage('ERROR', message, ...args)));
    } else {
      console.error(this._formatMessage('ERROR', message, ...args));
    }
  }

  debug(message, ...args) {
    if (process.env.NODE_ENV === 'development') {
      if (this.useColors) {
        console.log(chalk.gray(this._formatMessage('DEBUG', message, ...args)));
      } else {
        console.log(this._formatMessage('DEBUG', message, ...args));
      }
    }
  }
}

module.exports = new Logger();
