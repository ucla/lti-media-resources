const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

class LogServices {
  /**
   * Construct a logger object
   *
   * @param {string} taskName  Name of task this logger is for
   * @returns {object}   Return the logger.
   */
  static async createLogger(taskName) {
    // Global logger that outputs log messages to console and .log file
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.json(),
        winston.format.prettyPrint()
      ),
      transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
          dirname: 'logs',
          filename: `${taskName}_%DATE%.log`,
          datePattern: 'YYYY-MM-DD-HH',
          level: 'debug',
          maxFiles: '7',
        }),
      ],
    });

    return logger;
  }
}

module.exports = LogServices;
